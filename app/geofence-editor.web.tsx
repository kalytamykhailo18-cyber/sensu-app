import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function GeofenceEditorWeb() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="phone-portrait-outline" size={48} color="#9CA3AF" style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Solo disponible en la app móvil</Text>
      <Text style={styles.text}>
        Las geocercas se configuran desde la aplicación Android o iOS.
      </Text>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#fff" />
        <Text style={styles.backText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 28,
    lineHeight: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
