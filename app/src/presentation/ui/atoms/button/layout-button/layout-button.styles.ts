import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_HANKEN_GROTESK_400 } from 'styles/fonts';

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    borderRadius: 12,
    height: 53,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  selected: {
    backgroundColor: 'transparent',
  },
  text: {
    color: colors.neutral[700],
    fontFamily: FONT_HANKEN_GROTESK_400,
    fontSize: 16,
  },
  selectedText: {
    color: colors.white,
  },
});

export default styles;
