import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500 } from 'styles/fonts';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: colors.neutral[300],
    borderRadius: 6,
    padding: 2,
  },
  backgroundButton: {
    position: 'absolute',
    backgroundColor: colors.primary[300],
    borderRadius: 4,
    width: 63,
    height: 27,
    top: 2,
    left: 2,
  },
  button: {
    minWidth: 63,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 9.5,
  },
  title: {
    fontFamily: FONT_RALEWAY_500,
    color: colors.neutral[700],
    fontSize: 14,
    lineHeight: 18,
  },
  titleSelected: {
    color: colors.neutral[100],
  },
  line: {
    width: 1,
    backgroundColor: colors.neutral[500],
    height: '100%',
  },
});

export default styles;
