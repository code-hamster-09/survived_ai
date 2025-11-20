import React from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../styles/theme';

interface ChatInputProps {
  promptInput: string;
  setPromptInput: (text: string) => void;
  sendMessage: () => void;
  isLlamaContextReady: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  promptInput,
  setPromptInput,
  sendMessage,
  isLlamaContextReady,
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        onChangeText={setPromptInput}
        value={promptInput}
        placeholder="Отправить сообщение..."
        placeholderTextColor={colors.textPrimary}
        editable={isLlamaContextReady}
        multiline
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!isLlamaContextReady || !promptInput.trim()) &&
            styles.sendButtonDisabled,
        ]}
        onPress={sendMessage}
        disabled={!isLlamaContextReady || !promptInput.trim()}
      >
        <Image
          source={require('../assets/images/message.png')}
          style={styles.sendButtonIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ChatInput;
