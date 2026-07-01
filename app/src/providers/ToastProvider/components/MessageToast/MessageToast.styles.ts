
import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_400, FONT_RALEWAY_700 } from 'styles/fonts';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerTop: {
    top: 40,
    bottom: 'auto',
  },
  main: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
  },
  title: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 16,
    color: colors.white,
    lineHeight: 20,
  },
  message: {
    fontFamily: FONT_RALEWAY_400,
    fontSize: 14,
    color: colors.white,
    lineHeight: 18,
  },
});

export default styles;
