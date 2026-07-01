import { Dimensions, StyleSheet } from 'react-native';
import colors from 'styles/colors';
import { FONT_RALEWAY_500, FONT_RALEWAY_600 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    paddingHorizontal: 16,
    gap: 12,
  },
  groupNameContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[500],
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
    gap: 12,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.quaternary[200],
    opacity: 0.3,
  },
  camera: {
    backgroundColor: colors.neutral[500],
    padding: 12,
    borderRadius: 50,
    overflow: 'hidden',
  },
  cameraImage: {
    padding: 0,
    overflow: 'hidden',
  },
  groupImage: {
    width: 47,
    height: 47,
  },
  groupNameInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: FONT_RALEWAY_500,
    color: colors.primary[600],
    fontSize: 16,
    lineHeight: 22,
  },
  menu: {
    width: WIDTH - 32,
    top: 9,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.001,
    shadowRadius: 7.4,
  },
  permissionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral[500],
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  permissionsButtonGradient: {
    padding: 0,
    borderRadius: 12,
  },
  permissionsButtonGradientActive: {
    padding: 1,
  },
  permissionsButtonActive: {
    backgroundColor: colors.white,
    borderWidth: 0,
  },
  permissionsText: {
    fontFamily: FONT_RALEWAY_500,
    color: colors.neutral[800],
    fontSize: 16,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
  permissionsTextSelected: {
    color: colors.primary[600],
  },
  itemMenu: {
    maxWidth: WIDTH - 32,
    paddingHorizontal: 16,
    paddingLeft: 0,
  },
  separatorMenu: {
    height: 1,
    backgroundColor: colors.neutral[400],
    width: '100%',
  },
  titleItemMenu: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 22,
    color: colors.primary[600],
  },
  permissionsContainer: {
    gap: 12,
  },
  permissionsTitle: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    lineHeight: 22,
    color: colors.neutral[800],
  },
  membersContainer: {
    padding: 16,
  },
  listMembers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  member: {
    position: 'relative',
    maxWidth: 74,
    alignItems: 'center',
    gap: 4,
  },
  memberImageContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    width: 47,
    height: 47,
  },
  memberImage: {
    width: '100%',
    height: '100%',
  },
  avatarLetterContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 18,
    lineHeight: 24,
    color: colors.neutral[100],
  },
  removeMember: {
    position: 'absolute',
    top: 2,
    right: 6,
    backgroundColor: colors.neutral[600],
    borderRadius: 50,
    padding: 4,
  },
  memberName: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primary[600],
  },
});

export default styles;
