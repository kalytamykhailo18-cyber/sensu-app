import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Si no está autenticado, redirigir al login
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#0B0B0F'
      }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ 
          color: '#FFFFFF', 
          marginTop: 16,
          fontSize: 16
        }}>
          Verificando sesión...
        </Text>
      </View>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}
