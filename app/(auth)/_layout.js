import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a1a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="LoginScreen" 
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen 
          name="RegisterScreen" 
          options={{
            title: 'Register',
          }}
        />
      </Stack>
    </>
  );
}