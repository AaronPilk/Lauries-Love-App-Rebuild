import { StyleSheet } from 'react-native';
import colors from 'styles/colors';

const borderWidth = 8;

export const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    margin: 16,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMark: {
    borderColor: colors.primary['500'],
    opacity: 0.8,
    borderWidth,
    borderRadius: 50,
    backgroundColor: colors.primary['500'],
    height: 16,
  },
  inactiveMark: {
    borderColor: colors.primary['500'],
    borderWidth,
    borderRadius: 100,
  },
  track: {
    borderRadius: 100,
    height: 4,
  },
  thumb: {
    width: 25,
    height: 25,
    borderRadius: 50,
  },
});

export const sliderStyles = {
  maximumTrackTintColor: 'rgba(137, 103, 128, 0.08)',
  thumbTintColor: colors.primary['500'],
  minimumTrackTintColor: colors.primary['500'],
  trackStyle: styles.track,
  thumbStyle: styles.thumb,
};
