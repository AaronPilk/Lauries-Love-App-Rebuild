import { StyleSheet } from 'react-native';

import colors from 'styles/colors';
import { FONT_BEHIND_THE_NINETIES_500, FONT_RALEWAY_500 } from 'styles/fonts';

export const styles = StyleSheet.create({
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 50,
  },
  checkboxText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    color: colors.primary[600],
  },
});
