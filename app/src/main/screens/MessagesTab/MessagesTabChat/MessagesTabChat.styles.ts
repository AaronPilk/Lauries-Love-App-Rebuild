import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500, FONT_RALEWAY_600 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: {
    flex: 1,
    width: WIDTH,
    height: HEIGHT,
    position: 'relative',
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 16,
  },
  buttonHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userName: {
    flex: 1,
    fontFamily: FONT_RALEWAY_600,
    fontSize: 20,
    lineHeight: 24,
    color: colors.black,
  },
  //messages
  messages: {
    flex: 1,
  },
  messagesContainer: {
    paddingTop: 100,
  },
  date: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 22,
    color: colors.primary[600],
    textAlign: 'center',
    paddingVertical: 22,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 16,
    paddingRight: 20,
    paddingBottom: 22,
  },
  messageContainerMine: {
    justifyContent: 'flex-end',
    paddingRight: 16,
    paddingLeft: 20,
  },
  messageContainerMineNext: {
    paddingBottom: 8,
  },
  messageContainerOtherDay: {
    paddingTop: 0,
  },
  message: {
    position: 'relative',
    minWidth: 85,
    padding: 16,
    backgroundColor: colors.neutral[300],
    borderRadius: 20,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 18,
  },
  messageMine: {
    backgroundColor: colors.primary[500],
  },
  messageText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 22,
    color: colors.primary[600],
    paddingBottom: 6,
  },
  messageTextMine: {
    color: colors.neutral[100],
    textAlign: 'left',
  },
  messageDate: {
    position: 'absolute',
    bottom: 7,
    right: 8,
    color: colors.neutral[700],
    fontSize: 12,
    lineHeight: 14,
  },
  messageDateMine: {
    color: colors.neutral[400],
  },
  documentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 2,
    backgroundColor: colors.neutral[300],
    borderRadius: 20,
  },
  documentName: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 22,
    color: colors.primary[600],
  },

  //footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 19,
    paddingHorizontal: 0,
    paddingLeft: 0,
  },
  input: {
    paddingHorizontal: 11,
    paddingVertical: 11,
  },
  buttonSend: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    backgroundColor: colors.primary[500],
  },
  loaderContainer: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[900] + '80',
  },
});

export default styles;
