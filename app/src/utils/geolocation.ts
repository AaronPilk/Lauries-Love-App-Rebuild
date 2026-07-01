import * as Location from 'expo-location';
import { Platform } from 'react-native';

export const getLocationCity = async (city: string, country: string) => {
  const address = `${city}, ${country}`;
  try {
    const { status } =
      Platform.OS === 'android'
        ? await Location.requestForegroundPermissionsAsync()
        : { status: 'granted' };
    if (status !== 'granted') return { latitude: 0, longitude: 0 };

    const geocodedLocation = await Location.geocodeAsync(address);

    if (geocodedLocation && geocodedLocation.length > 0) {
      const { latitude, longitude } = geocodedLocation[0];
      return { latitude, longitude };
    }
  } catch (error) {
    if (__DEV__) console.warn('Failed to get location', error);
    return { latitude: 0, longitude: 0 };
  }
};
