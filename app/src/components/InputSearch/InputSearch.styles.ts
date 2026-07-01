import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500 } from 'styles/fonts';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[300],
    borderRadius: 10,
    paddingHorizontal: 21,
    gap: 15,
    paddingLeft: 15,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  containerFocus: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderBottomColor: colors.neutral[300],
  },
  withClearContainer: {
    paddingRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 18,
    color: colors.black,
    paddingVertical: 15,
  },
  clearIcon: {
    backgroundColor: colors.neutral[300],
    padding: 4,
    borderRadius: 50,
  },
});

export default styles;
