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
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
  },
  image: {
    width: 34,
    height: 34,
    borderRadius: 34,
  },
  nameAndType: {
    flexDirection: 'row',
    gap: 4,
  },
  fullNameText: {
    fontFamily: FONT_RALEWAY_700,
    maxWidth: 96,
    color: colors.primary[600],
  },
  typeText: {
    fontFamily: FONT_RALEWAY_500,
    color: colors.primary[600],
  },
  timeText: {
    fontFamily: FONT_HANKEN_GROTESK_400,
    color: colors.neutral[600],
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  messageText: {
    maxWidth: 240,
    fontFamily: FONT_RALEWAY_500,
    color: colors.primary[600],
  },
});

export default styles;
