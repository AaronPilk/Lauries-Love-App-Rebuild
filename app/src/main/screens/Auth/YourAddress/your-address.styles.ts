import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_BEHIND_THE_NINETIES_500, FONT_RALEWAY_500 } from 'styles/fonts';

const HEIGH = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    gap: 24,
    paddingHorizontal: 16,
  },
  topSection: {
    gap: 21,
    marginTop: 23,
  },
  progressContainer: {
    gap: 21,
  },
  chevronIcon: {
    marginTop: 23,
  },
  title: {
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 36,
    color: colors.primary[600],
  },
  subtitle: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
    color: colors.neutral[700],
  },
  formSection: {
    gap: 12,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalContainer: {
    gap: 20,
    height: HEIGH * 0.8,
    paddingLeft: 12,
    paddingRight: 17,
  },
  headerModal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextModal: {
    flex: 1,
    paddingRight: 30,
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 24,
    color: colors.primary[600],
    textAlign: 'center',
  },
  listContainer: { gap: 24, paddingBottom: 60 },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.quaternary[200],
    borderRadius: 10,
    paddingLeft: 13,
    paddingRight: 14,
    height: 50,
  },
  countryText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT_RALEWAY_500,
  },
  modalText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    color: colors.neutral[1000],
  },
});
