import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_600 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    width: WIDTH - 32,
  },
  image: {
    width: 141,
    height: 124,
  },
  textContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: WIDTH - 32 - 141,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 18,
    lineHeight: 24,
    color: colors.black,
  },
  linkButton: {
    flexDirection: 'row',
  },
  linkButtonText: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 14,
    lineHeight: 18,
    color: colors.neutral[600],
  },
  linkButtonIcon: {
    marginLeft: 4,
    color: colors.neutral[600],
  },
});

export default styles;
