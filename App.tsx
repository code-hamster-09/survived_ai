import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChatHeader from './src/components/ChatHeader';
import ChatInput from './src/components/ChatInput';
import ChatMessageList from './src/components/ChatMessageList';
import { INITIAL_AI_MESSAGE } from './src/constants';
import { useChatStorage } from './src/hooks/useChatStorage';
import { useLlamaChat } from './src/hooks/useLlamaChat';
import { colors } from './src/styles/theme';
import { ChatMessage } from './src/types';

export default function App() {
  const [log, setLog] = useState(''); // Оставляем log для отладки, если очень нужно
  const { messages, setMessages, clearStoredMessages } = useChatStorage();
  const [promptInput, setPromptInput] = useState('');

  const { llamaContext, downloadProgress, sendMessage } = useLlamaChat({
    messages,
    setMessages,
    appendLog: (msg: string) => setLog(l => l + msg + '\n'), // Передаем функцию для логов
  });

  const clearChat = async () => {
    setMessages((prev: ChatMessage[]) => [
      {
        id: Date.now().toString(),
        text: INITIAL_AI_MESSAGE,
        isUser: false,
      },
    ]);
    setLog(''); // Очищаем лог при очистке чата
    await clearStoredMessages();
  };

  const handleSendMessage = () => {
    sendMessage(promptInput);
    setPromptInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader onClearChat={clearChat} />

      <ChatMessageList
        messages={messages}
        isLoadingLlamaContext={!llamaContext}
        downloadProgress={downloadProgress}
      />

      {llamaContext && (
        <ChatInput
          promptInput={promptInput}
          setPromptInput={setPromptInput}
          sendMessage={handleSendMessage}
          isLlamaContextReady={!!llamaContext}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 2,
  },
});
