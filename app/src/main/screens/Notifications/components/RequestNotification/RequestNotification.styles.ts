import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import {
  FONT_HANKEN_GROTESK_400,
  FONT_RALEWAY_500,
  FONT_RALEWAY_700,
} from 'styles/fonts';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: "center",
    gap: 12,
  },
  image: {
    width: 34,
    height: 34,
    borderRadius: 34,
  },
  textContainer: {
    maxWidth: 117,
  },
  fullNameText: {
    fontFamily: FONT_RALEWAY_700,
    color: colors.primary[600],
  },
  requestText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 12,
    color: colors.primary[600],
  },
  timeText: {
    fontFamily: FONT_HANKEN_GROTESK_400,
    color: colors.neutral[600],
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[100],
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral[400],
  },
  confirmText: {
    fontFamily: FONT_RALEWAY_500,
    color: colors.primary[500],
  },
  deleteText: {
    fontFamily: FONT_RALEWAY_500,
    color: colors.neutral[700],
  },
});

export default styles;
