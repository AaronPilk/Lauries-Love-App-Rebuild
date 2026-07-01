import { Dimensions, Platform, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import {
  FONT_BEHIND_THE_NINETIES_500,
  FONT_RALEWAY_500,
  FONT_RALEWAY_600,
  FONT_RALEWAY_700,
} from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    position: 'relative',
  },
  contentContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 112 : 64,
  },
  screen: {
    flex: 1,
    gap: 10,
    width: WIDTH,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
  },
  headerText: {
    flex: 1,
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 32,
    color: colors.primary[600],
    lineHeight: 40,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.quaternary[200],
    borderRadius: 30,
  },
  buttonSelected: {
    backgroundColor: colors.primary[200],
  },
  buttonText: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral[700],
  },
  buttonTextSelected: {
    color: colors.primary[600],
  },
  listScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 180,
  },
  loadingLine: {
    width: '100%',
    height: 2,
  },
  loaderContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notListContainer: {
    paddingTop: 108,
    paddingBottom: 60,
    alignItems: 'center',
    gap: 20,
  },
  notListTextContainer: {
    gap: 8,
    alignItems: 'center',
  },
  notListText: {
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 24,
    lineHeight: 28,
    color: colors.primary[600],
    textAlign: 'center',
  },
  notListSubText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primary[600],
    textAlign: 'center',
    paddingHorizontal: 70,
  },
  buttonAdd: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 60,
    right: 18,
    padding: 13,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIntercom: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 180 : 130,
    right: 18,
    padding: 13,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countIntercom: {
    position: 'absolute',
    top: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    width: 20,
    borderRadius: 16,
    backgroundColor: colors.error[500],
  },
  unreadIntercom: {
    color: colors.neutral[100],
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  inputSearchContainer: {
    borderRadius: 28,
    gap: 12,
  },
  inputSearch: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 14,
  },
});

export default styles;
