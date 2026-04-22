import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Register push notifications when authenticated
  useNotifications(isAuthenticated);

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
          Cargando...
        </Text>
      </View>
    );
  }

  // Si está autenticado, ir a las tabs, sino al login
  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/landing"} />;
}
