import { AuthGuard } from '@/components/AuthGuard';
import { CommonColors } from '@/components/CommonStyles';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tint = colorScheme === 'light' ? CommonColors.lightTint : CommonColors.darkTint;
  const isIOS = Platform.OS === 'ios';

  // tamaños base
  const BASE_HEIGHT = 33;   // altura visual base de la tab bar
  const INNER_PAD  = 4;     // padding vertical interno
  const ACTIVE = CommonColors.tabActive;   // casi negro
  const INACTIVE = CommonColors.tabInactive; 

  return (
    <AuthGuard>
      <View style={{ flex: 1, backgroundColor: CommonColors.tabBackgroundInner }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: tint,
          tabBarButton: HapticTab,

          // ⬇️ estilos separados por plataforma
          tabBarStyle: isIOS
            ? {
                // iOS: no absoluta; deja que Safe Area empuje hacia arriba
                backgroundColor: CommonColors.tabBackground,
                borderTopWidth: 0,
                borderTopColor: CommonColors.tabBorder,
                paddingTop: INNER_PAD,
                paddingBottom: Math.max(insets.bottom, INNER_PAD),
                height: BASE_HEIGHT + Math.max(insets.bottom, INNER_PAD),
              }
            : {
                // ANDROID: flotante pero con insets para no chocar con la nav bar
                position: 'absolute',
                left: 16,
                right: 16,
                // puedes dejar bottom: 16 para "flotar" o 0 si la quieres pegada.
                bottom: 16,
                borderRadius: 16,

                backgroundColor: CommonColors.tabBackground,
                borderTopWidth: 0.5,
                borderTopColor: CommonColors.tabBorder,

                // 👇 clave: sumar inset inferior a altura y padding
                height: BASE_HEIGHT + Math.max(insets.bottom, INNER_PAD),
                paddingTop: INNER_PAD,
                paddingBottom: Math.max(insets.bottom, INNER_PAD),

                elevation: 8, // sombra Android
              },

          tabBarBackground: () => (
            <View
              style={{
                flex: 1,
                borderRadius: isIOS ? 0 : 16,
                backgroundColor: CommonColors.tabBackgroundInner,
              }}
            />
          ),
        }}
      >
        
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarActiveTintColor: ACTIVE,
            tabBarInactiveTintColor: INACTIVE,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="dispositivo"
          options={{
            title: 'Dispositivo',
            tabBarActiveTintColor: ACTIVE,
            tabBarInactiveTintColor: INACTIVE,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerta"
          options={{
            title: 'Alerta',
            tabBarActiveTintColor: ACTIVE,
            tabBarInactiveTintColor: INACTIVE,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="ubicacion"
          options={{
            title: 'Ubicación',
            tabBarActiveTintColor: ACTIVE,
            tabBarInactiveTintColor: INACTIVE,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="location.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarActiveTintColor: ACTIVE,
            tabBarInactiveTintColor: INACTIVE,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        </Tabs>
      </View>
    </AuthGuard>
  );
}
