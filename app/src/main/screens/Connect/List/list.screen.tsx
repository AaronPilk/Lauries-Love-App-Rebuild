import React, { useCallback, useEffect, useState } from 'react';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import colors from 'styles/colors';
import styles from './list.styles';
import { User, Filters } from '../Map/map.screen';
import Searchbar from 'components/Searchbar/Searchbar';
import UserCard from '../components/UserCard/UserCard';
import FiltersModal from '../components/FiltersModal/FiltersModal';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useGetUsersReq } from 'presentation/services/react-query/user.query';
import {
  IconChevronDown,
  IconMapPin,
  IconPaperAirplane,
} from 'assets/icons-auto/components';
import { useCountry } from 'presentation/hooks';

export default function ListScreen() {
  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<{ params: { search: string; filters: Filters } }, 'params'>
    >();

  const userParams = route.params;

  const { userDB } = useUserDBProvider();
  const { data: usersData } = useGetUsersReq();

  const { supportedCountryCodes } = useCountry();

  const [query, setQuery] = useState(userParams?.search);
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<User[]>();
  const [allFriends, setAllFriends] = useState<User[]>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [city, setCity] = useState(userParams?.filters.city);
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [age, setAge] = useState<{ id: string; label: string }[]>(
    userParams?.filters.age,
  );
  const [designation, setDesignation] = useState<
    { id: string; label: string }[]
  >(userParams?.filters.designation);
  const [diagnosisType, setDiagnosisType] = useState<
    { id: string; label: string }[]
  >(userParams?.filters.diagnosisType);
  const [gender, setGender] = useState<{ id: string; label: string }[]>(
    userParams?.filters.gender,
  );
  const [country, setCountry] = useState<{ id: string; label: string }[]>(
    userParams?.filters.country,
  );
  const [diagnosisYear, setDiagnosisYear] = useState<
    { id: string; label: string }[]
  >(userParams?.filters.diagnosisYear);

  useFocusEffect(
    useCallback(() => {
      async function fetchUsersLocation() {
        if (!usersData?.data)
          throw new Error('usersData is undefined or missing data');

        const usersWithLocation = usersData.data.filter(
          user =>
            user.geoLocation &&
            user.id !== userDB?.id &&
            supportedCountryCodes.includes(user.country),
        ) as User[];

        const adjustedFriends = offsetOverlappingMarkers(usersWithLocation);

        setAllFriends(adjustedFriends);
        setFriends(adjustedFriends);
        setIsLoading(false);
      }
      fetchUsersLocation();
    }, [usersData]),
  );

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
        ? friend.city.toLowerCase().includes(city.toLowerCase())
        : true;

      const matchesSearch = query
        ? friend.city.toLowerCase().includes(query.toLowerCase()) ||
          friend.firstName.toLowerCase().includes(query.toLowerCase())
        : true;

      return (
        matchesRole &&
        matchesAge &&
        matchesGender &&
        matchesDiagnosisType &&
        matchesDiagnosisYear &&
        matchesCountry &&
        matchesCity &&
        matchesSearch
      );
    });

    setFriends(filtered);
  }, [
    designation,
    age,
    gender,
    diagnosisType,
    diagnosisYear,
    country,
    city,
    query,
    allFriends,
  ]);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

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

        const offsetDistance = 0.04;
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
      screen: 'MapView',
      params: {
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

  function renderItem({ item }: { item: User }) {
    return <UserCard user={item} />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
          <Searchbar
            value={query}
            onChangeText={setQuery}
            placeholder="Search supporters"
          />
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  backgroundColor: isCurrentLocation
                    ? colors.primary[200]
                    : colors.quaternary[200],
                },
              ]}
              onPress={() => setIsCurrentLocation(!isCurrentLocation)}
            >
              <IconPaperAirplane
                width={14}
                height={14}
                stroke={
                  isCurrentLocation ? colors.primary[600] : colors.neutral[700]
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
                    countFilters() > 0 ? colors.primary[300] : 'transparent',
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
                <View style={styles.filterCount}>
                  <Text style={styles.filterCountText}>{countFilters()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={friends}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
          showsVerticalScrollIndicator={false}
        />
        {!isKeyboardVisible && (
          <View style={styles.mapViewButtonContainer}>
            <View style={styles.mapViewButton}>
              <TouchableOpacity
                onPress={handleView}
                style={styles.mapViewButtonContent}
              >
                <IconMapPin width={18} height={18} fill={colors.primary[600]} />
                <Text style={styles.mapViewText}>Map view</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
