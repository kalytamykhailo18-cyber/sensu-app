// components/ui/TabBarBackground.ios.tsx
import { BlurView } from 'expo-blur';
export default function TabBarBackground() {
  return <BlurView tint="light" intensity={28} style={{ flex: 1 }} pointerEvents="none" />;
}