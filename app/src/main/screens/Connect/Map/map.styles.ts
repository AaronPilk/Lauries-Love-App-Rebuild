import colors from 'styles/colors';
import { StyleSheet, Dimensions } from 'react-native';
import { FONT_RALEWAY_500, FONT_RALEWAY_600 } from 'styles/fonts';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeAreaTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: colors.neutral[100],
  },
  topContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 40,
  },
  locationButtonText: {
    fontFamily: FONT_RALEWAY_600,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 40,
    backgroundColor: colors.quaternary[200],
    borderWidth: 1,
  },
  filterText: {
    fontFamily: FONT_RALEWAY_600,
    color: colors.neutral[1000],
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: colors.primary[300],
  },
  filterBadgeText: {
    fontFamily: FONT_RALEWAY_500,
    fontSize: 12,
    color: colors.primary[600],
  },
  safeAreaBottom: {
    position: 'absolute',
    bottom: 112,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 13,
    width: screenWidth - 26,
  },
  cardContainer: {
    borderRadius: 80,
    backgroundColor: colors.neutral[100],
    boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.25)',
  },
  listViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listViewText: {
    fontFamily: FONT_RALEWAY_600,
    fontSize: 16,
    color: colors.primary[600],
  },
  // Map markers
  pin: {
    width: 32,
    height: 32,
  },
  // Highlight for the marker the user tapped: a coloured halo behind a
  // scaled-up pin so it clearly stands out from the rest.
  selectedPinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
    borderWidth: 2,
    borderRadius: 26,
    padding: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  selectedPin: {
    width: 40,
    height: 40,
  },
});

export default styles;
