import { StyleSheet } from 'react-native';

import colors from 'styles/colors';
import { FONT_BEHIND_THE_NINETIES_500, FONT_RALEWAY_500 } from 'styles/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'space-between',
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
  mainSection: {
    gap: 12,
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  selectedCheckbox: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxWrapper: {
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  checkboxText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    color: colors.primary[600],
  },
  checkboxTextLink: {
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
