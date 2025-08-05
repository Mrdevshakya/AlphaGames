import { SafeAreaView, StyleSheet } from 'react-native';
import LimboBoardScreen from '../lib/LimboBoardScreen/index';

export default function LimboGame() {
  return (
    <SafeAreaView style={styles.container}>
      <LimboBoardScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
