import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_BEHIND_THE_NINETIES_500, FONT_HANKEN_GROTESK_400, FONT_HANKEN_GROTESK_700, FONT_RALEWAY_500, FONT_RALEWAY_600 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderColor: "#EFEFEF",
    borderWidth: 1,
    padding: 20,
  },
  inactive: {
    backgroundColor: colors.neutral[300],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: FONT_HANKEN_GROTESK_700,
    fontSize: 32,
    lineHeight: 48,
    color: colors.black,
  },
  cardType: {
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 16,
    lineHeight: 24,
    color: "#7B7B7B",
    backgroundColor: "#EBEBEB",
    paddingHorizontal: 13,
    borderRadius: 16,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  accountText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 24,
    color: colors.primary[600],
  },
  accountNumber: {
    fontFamily: FONT_HANKEN_GROTESK_400,
    fontSize: 16,
    lineHeight: 24,
    color: colors.primary[600],
  },
  cancelledDonation: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
    lineHeight: 24,
    color: colors.error[500],
  },
});

export default styles;
