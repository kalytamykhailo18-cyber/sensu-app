import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';
import { DeviceStatusProvider } from '@/contexts/DeviceStatusContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { WatchConfigProvider } from '@/contexts/WatchConfigContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Hace la barra de navegación transparente y superpuesta
      NavigationBar.setBackgroundColorAsync('transparent');
      NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
      // Se superpone al contenido y se oculta con gesto
      NavigationBar.setBehaviorAsync('overlay-swipe').catch(() => {});
    }
  }, [colorScheme]);

  if (!loaded) return null;

  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <AuthProvider>
      <ProfileProvider>
        <WatchConfigProvider>
          <DeviceStatusProvider>
          <ThemeProvider value={navTheme}>
            <Stack screenOptions={{ headerBackTitle: 'Atrás' }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="geofence-editor" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="+not-found" />
            </Stack>

            {/* StatusBar translúcido para dibujar por debajo de la isla / status bar */}
            <StatusBar
              translucent
              backgroundColor="transparent"
              style={colorScheme === 'dark' ? 'light' : 'dark'}
            />
          </ThemeProvider>
          </DeviceStatusProvider>
        </WatchConfigProvider>
      </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
