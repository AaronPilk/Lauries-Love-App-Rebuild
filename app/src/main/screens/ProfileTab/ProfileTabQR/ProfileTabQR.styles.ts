import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_AUTOGRAPHY_100 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  backgroundButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WIDTH,
    height: HEIGHT,
  },
  title: {
    fontFamily: FONT_AUTOGRAPHY_100,
    fontSize: 60,
    textAlign: 'center',
    lineHeight: 76,
    letterSpacing: -1.2,
    color: colors.white,
  },
});

export default styles;
