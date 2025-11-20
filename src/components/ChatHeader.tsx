import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../styles/theme';

interface ChatHeaderProps {
  onClearChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat }) => {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/images/no_bgtext.png')}
        style={styles.headerLogo}
      />
      <Text style={styles.headerTitle}>{'Survived AI'}</Text>
      <TouchableOpacity onPress={onClearChat} style={styles.clearChatButton}>
        <Text style={styles.clearChatButtonText}>Очистить</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: spacing.medium,
    backgroundColor: colors.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.small,
    borderBottomLeftRadius: borderRadius.medium,
    borderBottomRightRadius: borderRadius.medium,
    paddingBottom: spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  clearChatButton: {
    position: 'absolute',
    right: spacing.medium,
    top: spacing.medium + 10,
    zIndex: 10,
    padding: spacing.small,
    borderRadius: borderRadius.small,
    backgroundColor: colors.primary,
  },
  clearChatButtonText: {
    color: colors.buttonText,
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
});

export default ChatHeader;
