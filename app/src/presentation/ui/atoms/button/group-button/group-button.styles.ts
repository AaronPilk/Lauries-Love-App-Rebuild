import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500 } from 'styles/fonts';

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: colors.neutral[400],
    justifyContent: 'center',
    borderRadius: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.neutral[400],
  },
  selected: {
    backgroundColor: colors.white,
  },
  text: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
  }
});

export default styles;
