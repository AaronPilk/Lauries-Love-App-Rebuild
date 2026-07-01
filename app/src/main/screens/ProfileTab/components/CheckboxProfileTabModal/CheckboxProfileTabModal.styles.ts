import { Dimensions, StyleSheet } from 'react-native';

const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: HEIGHT * 0.6,
  },
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default styles;
