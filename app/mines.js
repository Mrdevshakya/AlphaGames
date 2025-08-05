import { SafeAreaView, StyleSheet } from 'react-native';
import MinesBoardScreen from '../lib/MinesBoardScreen/index';

export default function MinesGame() {
  return (
    <SafeAreaView style={styles.container}>
      <MinesBoardScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
