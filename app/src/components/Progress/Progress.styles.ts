import { StyleSheet } from 'react-native';

import colors from 'styles/colors';

const styles = StyleSheet.create({
  container: {
    height: 4,
    borderRadius: 10,
    backgroundColor: colors.neutral[400],
  },
  progress: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: colors.primary[500],
  },
});

export default styles;
