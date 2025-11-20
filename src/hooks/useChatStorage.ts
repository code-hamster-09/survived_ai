import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { CHAT_STORAGE_KEY, MAX_MESSAGES_TO_STORE } from '../constants';
import { ChatMessage } from '../types';

export const useChatStorage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const saveMessages = async (currentMessages: ChatMessage[]) => {
    try {
      const messagesToSave = currentMessages.slice(-MAX_MESSAGES_TO_STORE);
      await AsyncStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(messagesToSave),
      );
    } catch (e) {
      // console.error("Ошибка при сохранении сообщений: ", e);
    }
  };

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (e) {
      // console.error("Ошибка при загрузке сообщений: ", e);
    }
  };

  const clearStoredMessages = async () => {
    try {
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
      // console.log('История чата удалена из хранилища.');
    } catch (e) {
      // console.error('Ошибка при очистке хранилища: ', e);
    }
  };

  return {
    messages,
    setMessages,
    loadMessages,
    saveMessages,
    clearStoredMessages,
  };
};
