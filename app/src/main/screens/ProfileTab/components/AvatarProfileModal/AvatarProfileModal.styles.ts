import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500 } from 'styles/fonts';

const styles = StyleSheet.create({
  handleIndicatorStyle: {
    backgroundColor: colors.neutral[300],
    width: 36,
    display: 'flex',
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  titleHeader: {
    color: colors.neutral[700],
    fontFamily: FONT_RALEWAY_500,
    fontSize: 20,
    lineHeight: 22,
  },
  buttonHeader: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    backgroundColor: colors.quaternary20070,
  },
  label: {
    color: colors.neutral[700],
  },
  labelRemove: {
    color: colors.error[500],
  },
  loaderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white + '80',
  },
});

export default styles;
