import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_BEHIND_THE_NINETIES_500, FONT_RALEWAY_500 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  screen: {
    width: WIDTH,
    paddingHorizontal: 16,
    gap: 24,
  },
  titles: {
    gap: 8,
  },
  title: {
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 36,
    lineHeight: 48,
    color: colors.primary[600],
  },
  subTitle: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
    lineHeight: 18,
    color: colors.neutral[700],
  },
  inputs: {
    gap: 12,
  },
  lastInput: {
    gap: 8,
  },
  subtitleInputs: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 12,
    lineHeight: 14,
    color: colors.neutral[700],
    paddingRight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default styles;
