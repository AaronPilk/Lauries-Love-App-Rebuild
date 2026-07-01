import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import {
  FONT_BEHIND_THE_NINETIES_500,
  FONT_RALEWAY_600,
  FONT_RALEWAY_700,
} from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  cancelText: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary[600],
  },
  title: {
    width: WIDTH * 0.4,
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 24,
    lineHeight: 32,
    color: colors.primary[600],
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  nextButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'flex-end',
  },
  nextText: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary[500],
  },
  nextTextDisabled: {
    color: colors.neutral[600],
  },
});

export default styles;
