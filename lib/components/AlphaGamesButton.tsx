import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface AlphaGamesButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  colors?: string[];
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const AlphaGamesButton: React.FC<AlphaGamesButtonProps> = ({
  title,
  onPress,
  disabled = false,
  colors = ['#333333', '#444444'],
  size = 'medium',
  style
}) => {
  const buttonStyle = [
    styles.button,
    size === 'small' && styles.smallButton,
    size === 'large' && styles.largeButton,
    disabled && styles.disabledButton,
    style
  ];

  const textStyle = [
    styles.text,
    size === 'small' && styles.smallText,
    size === 'large' && styles.largeText,
    disabled && styles.disabledText
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={(disabled ? ['#666666', '#555555'] : colors) as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={textStyle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallButton: {
    borderRadius: 8,
  },
  largeButton: {
    borderRadius: 15,
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});