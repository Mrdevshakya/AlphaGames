import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface AlphaGamesCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
}

export const AlphaGamesCard: React.FC<AlphaGamesCardProps> = ({
  children,
  style,
  colors = ['#111111', '#222222']
}) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gradient: {
    padding: 20,
  },
});