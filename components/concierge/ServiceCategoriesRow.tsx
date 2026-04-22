import { useDimensions } from '@/hooks/useDimensions';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ServiceCategoryCard } from './ServiceCategoryCard';

interface ServiceCategoriesRowProps {
  onCategoryPress?: (category: string) => void;
}

const CATEGORIES = [
  {
    id: 'health',
    icon: 'medkit.fill',
    title: 'Salud y\ncitas',
  },
  {
    id: 'orders',
    icon: 'briefcase.fill',
    title: 'Pedidos\ny tramites',
  },
  {
    id: 'security',
    icon: 'checkmark.shield.fill',
    title: 'Seguridad\ny fraudes',
  },
];

export function ServiceCategoriesRow({ onCategoryPress }: ServiceCategoriesRowProps) {
  const { getResponsivePadding } = useDimensions();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: getResponsivePadding(16, 20, 24),
      gap: getResponsivePadding(10, 12, 16),
    },
  }), [getResponsivePadding]);

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => (
        <ServiceCategoryCard
          key={category.id}
          icon={category.icon}
          title={category.title}
          onPress={() => onCategoryPress?.(category.id)}
        />
      ))}
    </View>
  );
}
