import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_BEHIND_THE_NINETIES_500, FONT_HANKEN_GROTESK_500, FONT_HANKEN_GROTESK_700, FONT_RALEWAY_500 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  donationType: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    gap: 8,
  },
  invoiceDetailsContainer: {
    paddingVertical: 20,
  },
  invoiceDetails: {
    backgroundColor: colors.white,
    borderRadius: 16,
  },
  invoiceDetailTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invoiceDetailsTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONT_RALEWAY_500,
    paddingBottom: 4,
  },
  invoiceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  invoiceIcon: {
    color: colors.primary[400],
  },
  donationTypeText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FONT_RALEWAY_500,
    color: colors.primary[600],
  },
  invoiceDetailTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONT_RALEWAY_500,
  },
  invoiceDetailValue: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.neutral[700],
    fontFamily: FONT_RALEWAY_500,
  },
  numeric: {
    fontFamily: FONT_HANKEN_GROTESK_500,
  }
});

export default styles;
