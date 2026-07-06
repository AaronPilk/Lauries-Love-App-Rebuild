import { StyleSheet } from 'react-native';
import colors from 'styles/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 24,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
  },
  progressDotActive: {
    backgroundColor: colors.primary[500],
  },
  stepLabel: {
    fontSize: 13,
    color: colors.neutral[700],
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 20,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
    marginBottom: 12,
  },
  categoryItemActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  categoryText: {
    fontSize: 16,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    padding: 14,
    fontSize: 16,
    color: colors.neutral[900],
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 6,
    fontSize: 12,
    color: colors.neutral[600],
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  summaryRow: {
    marginBottom: 4,
    fontSize: 14,
    color: colors.neutral[800],
  },
  summaryLabel: {
    fontWeight: '700',
    color: colors.neutral[900],
  },
});
