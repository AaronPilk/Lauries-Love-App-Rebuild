import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import {
  FONT_BEHIND_THE_NINETIES_500,
  FONT_HANKEN_GROTESK_400,
  FONT_RALEWAY_500,
  FONT_RALEWAY_600,
  FONT_RALEWAY_700,
} from 'styles/fonts';

const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: 40,
  },
  titleJoinButton: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
    lineHeight: 20,
  },
  container: {
    position: 'relative',
    flex: 1,
    paddingTop: 8,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  inputSearchContainer: {
    flex: 1,
    borderRadius: 28,
    gap: 12,
  },
  inputSearch: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 14,
    lineHeight: 18,
  },
  cancel: {
    paddingLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
  },
  listContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContainerTitle: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 22,
    lineHeight: 28,
    color: colors.primary[600],
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[400],
  },
  infoTopBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[400],
  },
  titlesItem: {
    flex: 1,
    gap: 4,
  },
  titleItem: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary[600],
  },
  subtitleItem: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primary[600],
  },
  highlight: {
    fontFamily: FONT_RALEWAY_700,
  },
  dateContainer: {
    gap: 5,
    alignItems: 'flex-end',
  },
  dateItem: {
    fontFamily: FONT_HANKEN_GROTESK_400,
    fontSize: 12,
    lineHeight: 14,
    color: colors.primary[600],
  },
  dataItemIsNew: {
    color: colors.primary[400],
  },
  newMessagesContainer: {
    width: 24,
    height: 24,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[400],
  },
  newMessages: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
    lineHeight: 18,
    color: colors.neutral[100],
  },

  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 100,
  },
  emptyListContainerNoResults: {
    height: HEIGHT - 200,
  },
  titlesEmptyList: {
    gap: 8,
    paddingHorizontal: 82,
  },
  titleEmptyList: {
    fontFamily: FONT_BEHIND_THE_NINETIES_500,
    fontSize: 24,
    lineHeight: 28,
    color: colors.primary[600],
    textAlign: 'center',
  },
  subtitleEmptyList: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primary[600],
    textAlign: 'center',
  },
  subtitleEmptyListBold: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primary[600],
    textAlign: 'center',
  },
  buttonNewChat: {
    position: 'absolute',
    right: 16,
    bottom: 122,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.primary[500],
    borderRadius: 40,
  },
  titleButtonNewChat: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
    lineHeight: 20,
    color: colors.neutral[100],
  },
  loadingLine: {
    width: '100%',
    height: 2,
  },
});

export default styles;
