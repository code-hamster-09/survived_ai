import { TextStyle } from 'react-native';

export const colors = {
  primary: '#FF6B6B', // Ярко-красный вместо фиолетового
  accent: '#FFD93D',  // Желтый акцент
  background: '#1E1E1E', // Темный, но менее синий
  cardBackground: '#2C2C2C', // Карточки темно-серые
  textPrimary: '#FFFFFF', // Белый текст
  textSecondary: '#B0B0B0', // Серый для второстепенного текста
  inputBorder: '#FF6B6B', // Бордер поля ввода в красном
  buttonText: '#FFFFFF', // Текст кнопок белый
  headerBackground: '#1E1E1E', // Фон хедера совпадает с фоном
  headerText: '#FFFFFF', // Текст хедера белый
  userMessageBackground: '#FF6B6B', // Фон сообщений пользователя красный
  modelMessageBackground: '#2C2C2C', // Фон сообщений модели темный
  buttonBackground: '#FF6B6B', // Цвет кнопок совпадает с primary
};


export const spacing = {
  tiny: 2,
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
