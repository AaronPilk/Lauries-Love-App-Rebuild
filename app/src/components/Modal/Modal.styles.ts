import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_BEHIND_THE_NINETIES_500 } from 'styles/fonts';

const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
  },
  keyboardAvoidingView: { flex: 1, justifyContent: 'flex-end' },
  container: {
    gap: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    maxHeight: HEIGHT * 0.93,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
    paddingRight: 30,
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 24,
    color: colors.primary[600],
    textAlign: 'center',
  },
});

export default styles;
