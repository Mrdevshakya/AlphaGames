import { SafeAreaView, StyleSheet } from 'react-native';
import LudoBoardScreen from '../lib/LudoBoardScreen/index';

export default function LudoGame() {
  return (
    <SafeAreaView style={styles.container}>
      <LudoBoardScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
