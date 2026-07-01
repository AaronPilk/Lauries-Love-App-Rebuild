import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native';

import useMap from './useMap';
import styles from './map.styles';
import colors from 'styles/colors';
import Searchbar from 'components/Searchbar/Searchbar';
import UserCard from '../components/UserCard/UserCard';
import InfoModal from '../components/InfoModal/InfoModal';
import FiltersModal from '../components/FiltersModal/FiltersModal';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useGetUsersReq } from 'presentation/services/react-query/user.query';
import { useCountry } from 'presentation/hooks';
import {
  IconBars3,
  IconChevronDown,
  IconInformationCircle,
  IconPaperAirplane,
} from 'assets/icons-auto/components';
export interface User {
  id: string;
  email: string;
  cognitoId: string;
  profilePicture: string;
  firstName: string;
  age: string;
  country: string;
  city: string;
  gender: string;
  role: { description: string };
  diagnosisTypes: { description: string }[];
  diagnosisSubTypes: { description: string }[];
  diagnosisYear: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

const MIN_ZOOM_METERS = 3000;
const MIN_LONGITUDE_DELTA = MIN_ZOOM_METERS / 111000;

export interface Filters {
  city: string;
  country: { id: string; label: string }[];
  age: { id: string; label: string }[];
  designation: { id: string; label: string }[];
  diagnosisType: { id: string; label: string }[];
  gender: { id: string; label: string }[];
  diagnosisYear: { id: string; label: string }[];
}

export default function MapScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const { userDB } = useUserDBProvider();
  const { data: usersData } = useGetUsersReq();
  const { isWithinBounds } = useMap();
  const route =
    useRoute<
      RouteProp<
        { params: { user: User; search: string; filters: Filters } },
        'params'
      >
    >();

  const userParams = route.params;

  const { supportedCountries } = useCountry();

  const [city, setCity] = useState(userParams?.filters?.city || '');
  const [query, setQuery] = useState('');
  const [friends, setFriends] = useState<User[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [allFriends, setAllFriends] = useState<User[]>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [user, setUser] = useState<User | null>(userParams?.user);
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const [age, setAge] = useState<{ id: string; label: string }[]>(
    userParams?.filters?.age || [],
  );
  const [gender, setGender] = useState<{ id: string; label: string }[]>(
    userParams?.filters?.gender || [],
  );
  const [country, setCountry] = useState<{ id: string; label: string }[]>(
    userParams?.filters?.country ||
      supportedCountries.map(country => ({
        id: country.code,
        label: country.name,
      })),
  );
  const [designation, setDesignation] = useState<
    { id: string; label: string }[]
  >(userParams?.filters?.designation || []);
  const [diagnosisType, setDiagnosisType] = useState<
    { id: string; label: string }[]
  >(userParams?.filters?.diagnosisType || []);
  const [diagnosisYear, setDiagnosisYear] = useState<
    { id: string; label: string }[]
  >(userParams?.filters?.diagnosisYear || []);
  const [initialRegion, setInitialRegion] = useState<Region>({
    latitude: 37.0902,
    longitude: -95.7129,
    latitudeDelta: 30.0,
    longitudeDelta: 50.0,
  });
  const [region, setRegion] = useState<Region>();
  const [isShowMarkers, setIsShowMarkers] = useState(false);
  const [countRender, setCountRender] = useState(0);
  const [tracksView, setTracksView] = useState(true);

  function offsetOverlappingMarkers(users: User[]) {
    const locationGroups: { [key: string]: User[] } = {};

    users.forEach(user => {
      const key = `${user.geoLocation?.latitude.toFixed(
        6,
      )},${user.geoLocation?.longitude.toFixed(6)}`;
      if (!locationGroups[key]) {
        locationGroups[key] = [];
      }
      locationGroups[key].push(user);
    });

    return Object.values(locationGroups)
      .map(group => {
        if (group.length === 1) {
          return group;
        }

        const offsetDistance = 0.008;
        const angleStep = (2 * Math.PI) / group.length;

        return group.map((user, index) => {
          const angle = angleStep * index;
          const offsetLat = Math.sin(angle) * offsetDistance;
          const offsetLng = Math.cos(angle) * offsetDistance;

          return {
            ...user,
            location: {
              latitude: user.geoLocation!.latitude + offsetLat,
              longitude: user.geoLocation!.longitude + offsetLng,
            },
          };
        });
      })
      .flat();
  }

  const fetchUsersLocation = async () => {
    if (!usersData?.data) return;

    try {
      const usersWithLocation = (
        usersData.data.filter(
          user =>
            user.geoLocation &&
            user.id !== userDB?.id &&
            user.geoLocation.latitude &&
            user.geoLocation.longitude,
        ) as User[]
      ).filter(
        user =>
          user.geoLocation &&
          isWithinBounds(user.geoLocation.latitude, user.geoLocation.longitude),
      );

      const adjustedFriends = offsetOverlappingMarkers(usersWithLocation);

      setAllFriends(adjustedFriends);
      setFriends(adjustedFriends);
      setIsLoading(false);
    } catch (error) {
      if (__DEV__) console.warn('Error fetching users location', error);
    }
  };

  useEffect(() => {
    if (usersData?.data && usersData.data.length > 0) fetchUsersLocation();
  }, [usersData]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to use this feature',
          );
          setIsLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});

        const { latitude, longitude } = currentLocation.coords;

        const geoLocation = userParams?.user?.geoLocation
          ? {
              ...userParams.user.geoLocation,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }
          : {
              latitude: 37.0902,
              longitude: -95.7129,
              latitudeDelta: 30.0,
              longitudeDelta: 50.0,
            };

        const myLocation = { latitude, longitude };

        const region = {
          ...geoLocation,
        };

        const myRegion = {
          ...myLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setInitialRegion(region);
        setCurrentLocation(myRegion);
        setIsCurrentLocation(true);
        mapRef.current?.animateToRegion(region, 1000);
      } catch (error) {
        Alert.alert('Error', 'Unable to fetch your location');
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const filtered = allFriends?.filter(friend => {
      const matchesRole = designation.length
        ? designation.some(
            designation => friend.role?.description === designation.id,
          )
        : true;
      const matchesAge = age.length
        ? age.some(age => friend.age === age.id)
        : true;
      const matchesGender = gender.length
        ? gender.some(gender => friend.gender === gender.id)
        : true;
      const matchesDiagnosisType = diagnosisType.length
        ? diagnosisType.some(diagnosisType =>
            friend.diagnosisTypes.some(
              dt => dt.description === diagnosisType.id,
            ),
          )
        : true;
      const matchesDiagnosisYear = diagnosisYear.length
        ? diagnosisYear.some(
            diagnosisYear => friend.diagnosisYear === diagnosisYear.id,
          )
        : true;
      const matchesCountry = country.length
        ? country.some(country => friend.country === country.id)
        : true;
      const matchesCity = city
        ? friend.city?.toLowerCase().includes(city.toLowerCase())
        : true;

      return (
        matchesRole &&
        matchesAge &&
        matchesGender &&
        matchesDiagnosisType &&
        matchesDiagnosisYear &&
        matchesCountry &&
        matchesCity
      );
    });

    setTracksView(true);
    setFriends(filtered);
    setTimeout(() => setTracksView(false), 200);
  }, [
    designation,
    age,
    gender,
    diagnosisType,
    diagnosisYear,
    country,
    city,
    isLoading,
  ]);

  function countFilters() {
    let count = 0;

    if (city.trim() !== '') count++;
    if (age.length > 0) count++;
    if (designation.length > 0) count++;
    if (diagnosisType.length > 0) count++;
    if (gender.length > 0) count++;
    if (diagnosisYear.length > 0) count++;
    return count;
  }

  function handleView() {
    navigation.navigate('Connect', {
      screen: 'ListView',
      params: {
        search: query,
        filters: {
          country,
          city,
          age,
          designation,
          diagnosisType,
          gender,
          diagnosisYear,
        },
      },
    });
  }

  async function handleSearch(city: string) {
    if (!city.trim()) {
      throw new Error('Invalid search.');
    }

    try {
      const geocodedLocation = await Location.geocodeAsync(city);

      if (geocodedLocation && geocodedLocation.length > 0) {
        const { latitude, longitude } = geocodedLocation[0];

        const region = {
          latitude,
          longitude,
          latitudeDelta: 1.0922,
          longitudeDelta: 1.0421,
        };

        mapRef.current?.animateToRegion(region, 1000);
        setIsCurrentLocation(false);
      } else {
        throw new Error('Location not found.');
      }
    } catch (error) {
      throw new Error(`Failed to search for the location: ${error}`);
    }
  }

  function handleCurrentLocation() {
    if (currentLocation) {
      mapRef.current?.animateToRegion(currentLocation, 1000);
      setIsCurrentLocation(true);
    }
  }

  function isRegionOutOfThreshold(region: Region): boolean {
    if (!currentLocation) return false;

    const threshold = 0.01;
    const latitudeDiff = Math.abs(region.latitude - currentLocation.latitude);
    const longitudeDiff = Math.abs(
      region.longitude - currentLocation.longitude,
    );

    return latitudeDiff > threshold || longitudeDiff > threshold;
  }

  function handleRegionChangeComplete(newRegion: Region) {
    const isZoomedIn = newRegion.longitudeDelta < MIN_LONGITUDE_DELTA;
    if (isRegionOutOfThreshold(newRegion)) setIsCurrentLocation(false);
    if (!isZoomedIn) setRegion(newRegion);
    else if (region)
      mapRef.current?.animateToRegion(
        {
          ...region,
          longitudeDelta: isZoomedIn
            ? MIN_LONGITUDE_DELTA
            : region.longitudeDelta,
        },
        1000,
      );
  }

  useEffect(() => {
    if (!isFocused) {
      setIsShowMarkers(false);
      return;
    }
    const timeout = setTimeout(() => {
      setIsShowMarkers(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [isFocused]);

  useEffect(() => {
    if (isShowMarkers) setCountRender(countRender + 1);
  }, [isShowMarkers]);

  useEffect(() => {
    if (isFocused && mapRef.current && Platform.OS === 'android') {
      mapRef.current.animateToRegion(
        {
          latitude: 37.0902,
          longitude: -95.7129,
          latitudeDelta: 30.0,
          longitudeDelta: 50.0,
        },
        1000,
      );
    }

    setTracksView(true);
  }, [isFocused]);

  useEffect(() => {
    if (!isFiltersOpen) {
      setQuery(city);

      handleSearch(city);
    }
  }, [isFiltersOpen]);

  if (isLoading || !isFocused) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={() => setUser(null)}
          maxZoomLevel={14.5}
        >
          {isShowMarkers &&
            friends?.map(friend =>
              friend.location || friend.geoLocation ? (
                <Marker
                  key={friend.id}
                  tracksViewChanges={tracksView}
                  onLayout={() => [
                    setTracksView(true),
                    setTimeout(() => setTracksView(false), 200),
                  ]}
                  coordinate={{
                    latitude:
                      friend.location?.latitude ||
                      friend.geoLocation?.latitude ||
                      0,
                    longitude:
                      friend.location?.longitude ||
                      friend.geoLocation?.longitude ||
                      0,
                  }}
                  style={{
                    opacity: 1,
                    backgroundColor:
                      Platform.OS === 'ios'
                        ? colors.primary[600]
                        : colors.transparent,
                  }}
                  onPress={e => {
                    e.stopPropagation();
                    setUser(friend);
                  }}
                >
                  <Image
                    source={require('../../../../assets/images/user-pin.png')}
                    style={{ width: 32, height: 32 }}
                  />
                </Marker>
              ) : (
                []
              ),
            )}
        </MapView>
        <SafeAreaView style={styles.safeAreaTop}>
          <View style={styles.topContainer}>
            <Searchbar
              value={query}
              onChangeText={setQuery}
              onSubmit={() => handleSearch(query)}
              placeholder="Search city"
            />
            <View style={styles.searchContainer}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.locationButton,
                    {
                      backgroundColor: isCurrentLocation
                        ? colors.primary[200]
                        : colors.quaternary[200],
                    },
                  ]}
                  onPress={handleCurrentLocation}
                >
                  <IconPaperAirplane
                    width={14}
                    height={14}
                    stroke={
                      isCurrentLocation
                        ? colors.primary[600]
                        : colors.neutral[700]
                    }
                  />
                  <Text
                    style={[
                      styles.locationButtonText,
                      {
                        color: isCurrentLocation
                          ? colors.primary[600]
                          : colors.neutral[700],
                      },
                    ]}
                  >
                    My location
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFiltersOpen(true)}
                  style={[
                    styles.filterButton,
                    {
                      borderColor:
                        countFilters() > 0
                          ? colors.primary[300]
                          : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.filterText}>Filters</Text>
                  <IconChevronDown
                    width={20}
                    height={20}
                    stroke={colors.neutral[700]}
                  />

                  {countFilters() > 0 && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>
                        {countFilters()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setIsInfoOpen(!isInfoOpen)}>
                <IconInformationCircle width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <SafeAreaView style={styles.safeAreaBottom}>
          {user ? (
            <UserCard user={user} setInitialRegion={setInitialRegion} />
          ) : (
            <View style={styles.cardContainer}>
              <TouchableOpacity
                onPress={handleView}
                style={styles.listViewButton}
              >
                <IconBars3 width={18} height={18} />
                <Text style={styles.listViewText}>List view</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
        <FiltersModal
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          designation={designation}
          setDesignation={setDesignation}
          age={age}
          setAge={setAge}
          gender={gender}
          setGender={setGender}
          diagnosisType={diagnosisType}
          setDiagnosisType={setDiagnosisType}
          diagnosisYear={diagnosisYear}
          setDiagnosisYear={setDiagnosisYear}
          country={country}
          setCountry={setCountry}
          city={city}
          setCity={setCity}
        />
        <InfoModal isInfoOpen={isInfoOpen} setIsInfoOpen={setIsInfoOpen} />
      </View>
    </TouchableWithoutFeedback>
  );
}
