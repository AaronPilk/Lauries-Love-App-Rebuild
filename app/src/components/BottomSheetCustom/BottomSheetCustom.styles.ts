import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../styles/colors';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  backgroundButton: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: colors.black,
    opacity: 0.4,
  },
  background: {
    borderRadius: 32,
    elevation: 8,
    shadowOffset: { width: 0, height: -17.4 / 2 },
    shadowRadius: 17.4 / 2,
    shadowOpacity: 0.15,
  },
  handleIndicator: {
    display: 'none',
  },
  scrollViewContainer: {
    width: WIDTH,
  },
});

export default styles;
