// Using Ionicons for consistent cross-platform icons

import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof Ionicons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Ionicons mappings for consistent cross-platform icons.
 * - see Ionicons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code-slash',
  'chevron.right': 'chevron-forward',
  'heart.fill': 'heart',
  'figure.walk': 'walk',
  'square.and.arrow.up': 'share',
  'drop.fill': 'water',
  'thermometer': 'thermometer',
  'checkmark.shield.fill': 'shield-checkmark',
  'waveform': 'pulse',
  'phone.fill': 'call',
  'square.stack.3d.up.fill': 'layers',
  'exit-outline': 'exit-outline',
  'bell.fill': 'notifications',
  'bell.badge': 'notifications',
  'bell.slash': 'notifications-off',
  'location.fill': 'location',
  'person.fill': 'person',
  'heart.text.square.fill': 'heart-circle',
  'drop.circle.fill': 'water',
  'briefcase.fill': 'briefcase',
  'calendar.badge.plus': 'calendar',
  'medkit.fill': 'medkit',
  'plus.circle': 'add-circle',
  'plus.circle.fill': 'add-circle',
  'gearshape.fill': 'settings',
} as IconMapping;

/**
 * An icon component that uses Ionicons for consistent cross-platform icons.
 * Icon `name`s are based on SF Symbols and mapped to Ionicons equivalents.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
};
