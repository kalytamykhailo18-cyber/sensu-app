import { Stack } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: true }} />
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://source.unsplash.com/200x200/?error' }}
          style={styles.image}
        />
        <Text style={styles.title}>Esta página no existe</Text>
        <Text style={styles.subtitle}>
          Lo sentimos, no pudimos encontrar la página que buscas.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    borderRadius: 100,
    height: 200,
    marginBottom: 32,
    width: 200,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
