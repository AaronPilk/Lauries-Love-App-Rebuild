import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_HANKEN_GROTESK_700, FONT_RALEWAY_500, FONT_RALEWAY_600 } from 'styles/fonts';

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
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT_RALEWAY_600,
    color: colors.primary[500],
  },
  paddedContainer: {
    padding: 20,
    backgroundColor: "#F1F1EC",
    flexDirection: 'column',
    borderRadius: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FONT_RALEWAY_500,
    color: colors.neutral[700],
  },
  supportText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONT_RALEWAY_600,
    textAlign: 'center',
    padding: 20,
    color: colors.primary[600],
  },
  daysContainer: {
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  daysAmount: {
    fontSize: 40,
    paddingVertical: 20,
    lineHeight: 44,
    fontFamily: FONT_HANKEN_GROTESK_700,
    color: colors.primary[600],
  },
  daysText: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONT_RALEWAY_600,
    color: colors.primary[600],
  },
});

export default styles;
