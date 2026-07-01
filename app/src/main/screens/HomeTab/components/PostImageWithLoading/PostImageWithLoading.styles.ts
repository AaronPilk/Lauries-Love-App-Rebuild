import { StyleSheet } from 'react-native';
import colors from 'styles/colors';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
  },
});

export default styles;
