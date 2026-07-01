import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  closeButton: {
    paddingHorizontal: 16,
  },
  closeButtonHidden: {
    opacity: 0,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONT_RALEWAY_500,
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    color: colors.primary[600],
    textTransform: 'uppercase',
  },
  document: {
    width: '100%',
    height: '100%',
  },
  documentLoad: {
    backgroundColor: colors.white,
  },
  notDocument: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentTitle: {
    fontFamily: FONT_RALEWAY_500,
    color: colors.neutral[800],
    fontSize: 20,
    lineHeight: 27,
    textAlign: 'center',
  },
  documentMessage: {
    fontFamily: FONT_RALEWAY_500,
    color: colors.neutral[600],
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  footer: {
    width: WIDTH,
    gap: 9,
    backgroundColor: colors.white,
  },
  inputContainer: {
    borderRadius: 19,
    paddingHorizontal: 0,
    paddingLeft: 0,
  },
  input: {
    paddingHorizontal: 11,
    paddingVertical: 11,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonFooter: {
    paddingHorizontal: 16,
  },
});

export default styles;
