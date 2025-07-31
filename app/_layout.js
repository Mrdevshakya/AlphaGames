import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="main" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {/* Hidden reCAPTCHA container for Firebase Phone Auth */}
      <View id="recaptcha-container" style={{ position: 'absolute', top: -1000, left: -1000, width: 1, height: 1 }} />
    </>
  );
}