import { StyleSheet } from 'react-native';
import colors from 'styles/colors';
import {
  FONT_HANKEN_GROTESK_400,
  FONT_RALEWAY_500,
  FONT_RALEWAY_600,
  FONT_RALEWAY_700,
} from 'styles/fonts';

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: 10,
  },
  loadingLine: {
    width: '100%',
    height: 2,
  },
  backButtonHide: {
    opacity: 0,
  },
  titleHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_RALEWAY_500,
    fontSize: 18,
    lineHeight: 22,
  },
  loaderContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    gap: 20,
    paddingBottom: 40,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.black14,
    gap: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postHeaderUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postHeaderUserName: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 18,
    lineHeight: 22,
    color: colors.primary[600],
  },
  postHeaderDate: {
    fontFamily: FONT_HANKEN_GROTESK_400,
    fontSize: 12,
    lineHeight: 22,
    color: colors.primary[600],
    paddingRight: 30,
  },
  postText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 18,
    lineHeight: 24,
    color: colors.primary[600],
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  postFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postFooterItemText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 18,
    lineHeight: 22,
    color: colors.primary[600],
  },
  commentsContainer: {
    gap: 20,
    paddingHorizontal: 24,
  },
  commentsTitle: {
    fontFamily: FONT_RALEWAY_700,
    fontSize: 16,
    lineHeight: 22,
    color: colors.neutral[700],
  },
  commentsList: {
    gap: 15,
    paddingBottom: 40,
  },
  commentContainer: {
    gap: 12,
  },
  commentContent: {
    flexDirection: 'row',
    gap: 12,
  },
  commentUser: {
    justifyContent: 'flex-start',
  },
  commentTextContainer: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentUserInfo: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary[600],
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 50,
    backgroundColor: colors.primary[600],
  },
  commentUserInfoDate: {
    fontFamily: FONT_HANKEN_GROTESK_400,
    fontSize: 12,
    lineHeight: 22,
    color: colors.primary[600],
  },
  commentText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 22,
    color: colors.primary[600],
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  commentFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentFooterItemText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary[600],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 22,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 18,
  },
  textInput: {
    flex: 1,
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary[600],
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonContainer: {
    width: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  commentButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.primary[500],
    borderRadius: 67,
  },
  containerSpinner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary[200] + '66',
  },
  image: {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    overflow: 'hidden',
    borderRadius: 8,
  },
  imageContainer: {
    borderRadius: 8,
  },
});

export default styles;
