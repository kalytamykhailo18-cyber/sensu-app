import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { EviewSetupForm } from '@/components/eview-setup';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function EviewSetupScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    content: {
      paddingTop: 20,
      paddingBottom: Platform.OS === 'ios' ? insets.bottom + 100 : 100,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Atrás',
          title: 'Configurar Botón de Emergencia',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.secondary,
          headerTitleStyle: { color: theme.colors.text, fontWeight: '700' },
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <EviewSetupForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
