import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500, FONT_RALEWAY_600 } from 'styles/fonts';

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    alignItems: 'center',
    justifyContent: "center",
    borderRadius: 13,
    paddingVertical: 16,
  },
  secondaryContainer: {
    backgroundColor: colors.neutral[100],
  },
  rounded: {
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  containerPrimary: {
    backgroundColor: colors.primary[500],
  },
  containerSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  containerInvalid: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error[500],
  },
  disabledPrimary: {
    backgroundColor: colors.neutral[500],
  },
  disabledSecondary: {
    backgroundColor: 'transparent',
    borderColor: colors.neutral[500],
    backgroundColor: 'transparent',
  },
  disabledInvalid: {
    borderColor: colors.neutral[500],
    backgroundColor: 'transparent',
  },
  title: {
    fontFamily: FONT_RALEWAY_600,
  },
  titlePrimary: {
    color: colors.neutral[100],
  },
  titleSecondary: {
    color: colors.primary[500],
  },
  titleSecondaryDisabled: {
    color: colors.neutral[500],
  },
  titleInvalid: {
    color: colors.error[500],
  },
  titleInvalidDisabled: {
    color: colors.neutral[500],
  },
  titleLg: {
    fontSize: 20,
    lineHeight: 24,
  },
  secondaryTitle: {
    fontSize: 16,
    color: colors.primary[600],
  },
  roundedTitle: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
  },
  titleMd: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONT_RALEWAY_500,
  },
  titleSm: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default styles;
