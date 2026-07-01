import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500, FONT_RALEWAY_700 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.black,
    opacity: 0.4,
  },
  modalContent: {
    width: WIDTH - 32,
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  modalHeader: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  modalTitle: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 20,
    lineHeight: 24,
    color: colors.primary[600],
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 22,
    color: colors.primary[600],
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  modalButtons: {
    gap: 12,
  },
});

export default styles;
