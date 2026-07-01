import { StyleSheet } from 'react-native';

import colors from 'styles/colors';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    borderRadius: 30,
    backgroundColor: colors.neutral[300],
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.primary[600],
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: colors.neutral[500],
  },
});

export default styles;
