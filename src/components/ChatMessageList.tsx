import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import { ChatMessage } from '../types';
import TypingIndicator from './TypingIndicator';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoadingLlamaContext: boolean;
  downloadProgress: number;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoadingLlamaContext,
  downloadProgress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
    >
      {isLoadingLlamaContext && (
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

      {!isLoadingLlamaContext && (
        <View style={styles.chatMessagesContainer}>
          {messages.map((message: ChatMessage) => (
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
  );
};

const styles = StyleSheet.create({
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
});

export default ChatMessageList;
