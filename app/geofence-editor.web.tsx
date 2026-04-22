import { View, Text, StyleSheet } from 'react-native';

export default function GeofenceEditorWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Geofence editor is only available on the mobile app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
});
