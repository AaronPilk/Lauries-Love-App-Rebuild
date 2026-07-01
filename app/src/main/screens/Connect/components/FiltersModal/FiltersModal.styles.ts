import colors from 'styles/colors';
import { FONT_RALEWAY_500 } from 'styles/fonts';
import { Dimensions, StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  sectionGap: {
    gap: 12,
    paddingBottom: 20,
  },
  fieldGap: {
    gap: 8,
  },
  label: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    color: colors.primary[600],
  },
  inputGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
  },
  textInput: {
    padding: 12,
    height: 50,
    fontFamily: FONT_RALEWAY_500,
    fontSize: 16,
    borderRadius: 12,
    width: '100%',
    backgroundColor: colors.quaternary[200],
  },
  focusedTextInput: {
    width: screenWidth - 36,
    height: 46,
    padding: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
});

export default styles;
