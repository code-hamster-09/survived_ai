import { TextStyle } from 'react-native';

export const colors = {
  primary: '#7A5AF5', // Фиолетовый мягкий (нейронный эффект)
  accent: '#C77DFF',  // Розово-фиолетовый подсветки (акцент)
  background: '#0D1B2A', // Темно-синий (глубокий, уверенный)
  cardBackground: '#1B263B', // Серый нейтральный (фон для карточек/сообщений)
  textPrimary: '#E2E8F0', // Белый / Slate 200 (для текста и контраста)
  textSecondary: '#1B263B', // 
  inputBorder: '#3B3C99', // Фиолетово-синий (для бордера поля ввода)
  buttonText: '#E2E8F0', // Белый / Slate 200 (для текста кнопок)
  headerBackground: '#0D1B2A', // Фон хедера
  headerText: '#E2E8F0', // Текст хедера
  userMessageBackground: '#344762', // Фон сообщений пользователя (справа)
  modelMessageBackground: '#E2E8F0', // Фон сообщений модели (слева)
  buttonBackground: '#7A5AF5', // Цвет фона кнопки (используем primary)
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

export const borderRadius = {
  small: 8,
  medium: 16,
  large: 25,
};

export const typography: { [key: string]: TextStyle } = {
  h1: {
    fontSize: 24,
    fontWeight: '700', // Изменено на числовое значение
    color: colors.headerText,
  } as TextStyle,
  body: {
    fontSize: 16,
    color: colors.textPrimary,
  } as TextStyle,
  small: {
    fontSize: 12,
    color: colors.textSecondary,
  } as TextStyle,
  chatMessage: {
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
  } as TextStyle,
};
