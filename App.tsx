import { initLlama, LlamaContext } from '@pocketpalai/llama.rn';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from './src/styles/theme';
import {
  getLlamaModelPath,
  getOptimizedLlamaInitParams,
} from './src/utils/llamaUtils';

// Определение типа для сообщения в чате
// interface ChatMessage {
//   id: string;
//   text: string;
//   isUser: boolean;
// }

// Импортируем TypingIndicator из нового файла
import TypingIndicator from './src/components/TypingIndicator';
import {
  FATAL_ERROR_MESSAGE,
  INITIAL_AI_MESSAGE,
  LLAMA_SYSTEM_PROMPT,
} from './src/constants';
import { ChatMessage } from './src/types';

export default function App() {
  const [log, setLog] = useState('🚀 Инициализация...\n');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [restartKey, setRestartKey] = useState(0);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const { messages, setMessages, clearStoredMessages } = useChatStorage();
  const scrollViewRef = useRef<ScrollView>(null);

  const append = (msg: string) => setLog(l => l + msg + '\n');

  const clearChat = async () => {
    setMessages([]);
    setLog('Чат очищен.\n');
    await clearStoredMessages();
    setMessages([
      {
        id: Date.now().toString(),
        text: INITIAL_AI_MESSAGE,
        isUser: false,
      },
    ]);
  };

  useEffect(() => {
    (async () => {
      try {
        append('🔍 debug: старт useEffect');

        append('Загружаю путь к модели Llama...');
        const modelPath = await getLlamaModelPath(progress => {
          setDownloadProgress(progress);
        });

        if (!modelPath) {
          append('Ошибка: Не удалось получить путь к модели Llama.');
          return;
        }

        append('Инициализирую модель Llama...');
        const t0 = Date.now();
        const optimizedParams = await getOptimizedLlamaInitParams();
        const ctx = await initLlama(
          {
            model: modelPath,
            ...optimizedParams,
            use_progress_callback: true,
          },
          (_progress: number) => {},
        );
        const t1 = Date.now();
        append(`Модель Llama инициализирована за ${t1 - t0} мс.`);
        setLlamaContext(ctx);
        append('Модель Llama успешно инициализирована!');
        setMessages(prev => {
          if (prev.length === 0) {
            return [
              {
                id: Date.now().toString(),
                text: INITIAL_AI_MESSAGE,
                isUser: false,
              },
            ];
          } else {
            return prev;
          }
        });
      } catch (err: any) {
        append('Fatal error: ' + (err.message || String(err)));
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: FATAL_ERROR_MESSAGE,
            isUser: false,
          },
        ]);
      }
    })();
  }, [restartKey]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!llamaContext || !promptInput.trim()) return;

    const userMessageId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      text: promptInput.trim(),
      isUser: true,
    };
    setMessages(prev => [...prev, newUserMessage]);
    setPromptInput('');

    let currentModelResponse = '';
    let lastTextLength = 0;
    const modelMessageId = (Date.now() + 1).toString();

    try {
      const messagesWithNewUserMessage = [...messages, newUserMessage];
      const chatHistory = formatChatHistoryForLlama(messagesWithNewUserMessage);
      const formattedPrompt = `${LLAMA_SYSTEM_PROMPT}${chatHistory}<|im_start|>user\n${newUserMessage.text}<|im_end|>\n<|im_start|>assistant\n`;

      const completionParams = {
        prompt: formattedPrompt,
        n_predict: 200,
        temperature: 0.7,
        stop: ['<|im_end|>', '<|im_start|>assistant', '\n'],
      };

      setMessages(prev => [
        ...prev,
        { id: modelMessageId, text: '', isUser: false },
      ]);

      await llamaContext.completion(completionParams, (partialText: any) => {
        const currentPartial =
          typeof partialText === 'object' && partialText !== null
            ? partialText.content ?? JSON.stringify(partialText)
            : partialText;
        const newPart = currentPartial.slice(lastTextLength);
        currentModelResponse += newPart;
        lastTextLength = currentPartial.length;

        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId
              ? { ...msg, text: currentModelResponse }
              : msg,
          ),
        );
      });
      append('FINAL (completion) получено.');
    } catch (e: any) {
      const errorMessage =
        'Ошибка генерации с Llama: ' + (e.message || String(e));
      append(errorMessage);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessageId
            ? msg
            : msg.id === (Date.now() + 1).toString()
            ? { ...msg, text: currentModelResponse + '\n\n' + errorMessage }
            : msg,
        ),
      );
    }
  };

  const formatChatHistoryForLlama = (chatHistory: ChatMessage[]) => {
    const historyToFormat = chatHistory.slice(-200);
    let formattedHistory = '';
    historyToFormat.forEach(msg => {
      if (msg.isUser) {
        formattedHistory += `<|im_start|>user\n${msg.text}<|im_end|>\n`;
      } else {
        formattedHistory += `<|im_start|>assistant\n${msg.text}<|im_end|>\n`;
      }
    });
    return formattedHistory;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('./src/assets/images/no_bgtext.png')}
            style={styles.headerLogo}
          />
          <Text style={styles.headerTitle}>Survived AI</Text>
        </View>

        <TouchableOpacity onPress={clearChat} style={styles.clearChatButton}>
          <Text style={styles.clearChatButtonText}>Очистить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        {!llamaContext && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                typography.body,
                { marginTop: spacing.medium, color: colors.textPrimary },
              ]}
            >
              Инициализация модели...
            </Text>
            {downloadProgress > 0 && !isNaN(downloadProgress) && (
              <Text
                style={[
                  typography.small,
                  { marginTop: spacing.small, color: colors.textPrimary },
                ]}
              >
                Прогресс загрузки: {downloadProgress.toFixed(0)}%
              </Text>
            )}
          </View>
        )}

        {llamaContext && (
          <View style={styles.chatMessagesContainer}>
            {messages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser
                    ? styles.userMessageBubble
                    : styles.modelMessageBubble,
                ]}
              >
                {message.text ? (
                  <Text
                    style={[
                      typography.chatMessage,
                      message.isUser
                        ? styles.userMessageText
                        : styles.modelMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                ) : (
                  !message.isUser && <TypingIndicator />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {llamaContext && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            onChangeText={setPromptInput}
            value={promptInput}
            placeholder="Отправить сообщение..."
            placeholderTextColor={colors.textPrimary}
            editable={!!llamaContext}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!llamaContext || !promptInput.trim()) &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!llamaContext || !promptInput.trim()}
          >
            <Image
              source={require('./src/assets/images/message.png')}
              style={styles.sendButtonIcon}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.large,
    backgroundColor: colors.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: borderRadius.medium,
    borderBottomRightRadius: borderRadius.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    overflow: 'hidden',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.headerText,
  },
  clearChatButton: {
    padding: spacing.small,
    borderRadius: borderRadius.small,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  clearChatButtonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  chatMessagesContainer: {
    flex: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: borderRadius.large,
    marginBottom: spacing.small,
    maxWidth: '80%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  userMessageBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
    backgroundColor: colors.userMessageBackground,
  },
  modelMessageBubble: {
    borderBottomLeftRadius: 2,
    alignSelf: 'flex-start',
    backgroundColor: colors.modelMessageBackground,
  },
  userMessageText: {
    ...typography.chatMessage,
    color: colors.textPrimary,
  },
  modelMessageText: {
    ...typography.chatMessage,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.small,
    margin: spacing.medium,
    marginTop: spacing.small,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.cardBackground,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 150,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.cardBackground,
  },
  sendButton: {
    borderRadius: borderRadius.large,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.small,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: colors.buttonText,
    overflow: 'hidden',
  },
});
