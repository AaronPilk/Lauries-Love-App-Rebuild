import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500 } from 'styles/fonts';

const styles = StyleSheet.create({
  iconContainer: {
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 12,
    lineHeight: 14,
    color: colors.neutral[600],
  },
  titleFocused: {
    color: colors.primary[500],
  },
});

export default styles;
