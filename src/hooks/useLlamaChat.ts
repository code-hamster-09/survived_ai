import { initLlama, LlamaContext } from '@pocketpalai/llama.rn';
import { useEffect, useState } from 'react';
import {
  FATAL_ERROR_MESSAGE,
  INITIAL_AI_MESSAGE,
  LLAMA_SYSTEM_PROMPT,
} from '../constants';
import { ChatMessage } from '../types';
import {
  getLlamaModelPath,
  getOptimizedLlamaInitParams,
} from '../utils/llamaUtils';

interface UseLlamaChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  appendLog: (msg: string) => void; // Оставляем, так как используется для верхнеуровневого лога
}

export const useLlamaChat = ({
  messages,
  setMessages,
  appendLog,
}: UseLlamaChatProps) => {
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);
  const [restartKey, setRestartKey] = useState(0);

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

  useEffect(() => {
    (async () => {
      try {
        // appendLog('🔍 debug: старт useEffect');

        // appendLog('Загружаю путь к модели Llama...');
        const modelPath = await getLlamaModelPath(progress => {
          setDownloadProgress(progress);
        });

        if (!modelPath) {
          // appendLog('Ошибка: Не удалось получить путь к модели Llama.');
          return;
        }

        // appendLog('Инициализирую модель Llama...');
        const t0 = Date.now();
        const optimizedParams = await getOptimizedLlamaInitParams();
        const ctx = await initLlama(
          {
            model: modelPath,
            ...optimizedParams,
            use_progress_callback: true,
          },
          (_progress: number) => {
            // console.log('progress: ', _progress);
          },
        );
        const t1 = Date.now();
        // appendLog(`Модель Llama инициализирована за ${t1 - t0} мс.`);
        setLlamaContext(ctx);
        // appendLog('Модель Llama успешно инициализирована!');
        setMessages((prev: ChatMessage[]) => {
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
        // appendLog('Fatal error: ' + (err.message || String(err)));
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: FATAL_ERROR_MESSAGE,
            isUser: false,
          },
        ]);
      }
    })();
  }, [restartKey, setMessages, appendLog]);

  const sendMessage = async (promptInput: string) => {
    if (!llamaContext || !promptInput.trim()) return;

    const userMessageId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      text: promptInput.trim(),
      isUser: true,
    };
    setMessages((prev: ChatMessage[]) => [...prev, newUserMessage]);

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

      setMessages((prev: ChatMessage[]) => [
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

        setMessages((prev: ChatMessage[]) =>
          prev.map((msg: ChatMessage) =>
            msg.id === modelMessageId
              ? { ...msg, text: currentModelResponse }
              : msg,
          ),
        );
      });
      // appendLog('FINAL (completion) получено.');
    } catch (e: any) {
      const errorMessage =
        'Ошибка генерации с Llama: ' + (e.message || String(e));
      // appendLog(errorMessage);
      setMessages((prev: ChatMessage[]) =>
        prev.map((msg: ChatMessage) =>
          msg.id === userMessageId
            ? msg
            : msg.id === (Date.now() + 1).toString()
            ? { ...msg, text: currentModelResponse + '\n\n' + errorMessage }
            : msg,
        ),
      );
    }
  };

  return {
    llamaContext,
    downloadProgress,
    sendMessage,
    setRestartKey,
  };
};
