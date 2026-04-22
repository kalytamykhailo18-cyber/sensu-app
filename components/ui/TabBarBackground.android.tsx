// components/ui/TabBarBackground.android.tsx
import { CommonColors } from '@/components/CommonStyles';
import { View } from 'react-native';

export default function TabBarBackground() {
  return <View pointerEvents="none" style={{ flex: 1, borderRadius: 24, backgroundColor: CommonColors.tabBarBackgroundAndroid }} />;
}