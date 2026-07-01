import { Dimensions, StyleSheet } from 'react-native';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 2,
    overflow: 'hidden',
  },
  line: {
    width: WIDTH / 4,
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

export default styles;
