import { getCurrentUser } from 'aws-amplify/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import useAuth from '../useAuth';
import colors from 'styles/colors';
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';
import { styles } from './diagnosed-year.styles';
import Progress from 'components/Progress/Progress';
import { useDBProvider } from 'providers/DBProvider/DBProvider';
import { IconArrowLeft, IconCheckbox } from 'assets/icons-auto/components';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';

export default function DiagnosedYearScreen() {
  const { userDB, updateUserDB } = useUserDBProvider();
  const {
    db: { designationTypes },
  } = useDBProvider();
  const { onPressBack } = useAuth();
  const navigation = useNavigation();
  const [diagnosedYear, setDiagnosedYear] = useState('');
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFriend = useMemo(() => {
    const selectRole = userDB
      ? designationTypes.find(item => {
          const roleId =
            typeof userDB.role === 'string'
              ? userDB.role
              : userDB.role?.id || null;
          if (!roleId) return false;
          return item.id === roleId;
        }) || null
      : null;

    return selectRole?.description.toLowerCase().includes('friend') || false;
  }, [userDB, designationTypes]);

  const isDisabled = useMemo(
    () =>
      (!isFriend && !diagnosedYear) ||
      !termsAccepted ||
      !privacyAccepted ||
      !!error ||
      loading,
    [diagnosedYear, termsAccepted, privacyAccepted, error, loading],
  );

  useEffect(() => {
    if (diagnosedYear) {
      const handler = setTimeout(() => {
        validateField();
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [diagnosedYear]);

  function validateField() {
    let error = '';

    if (diagnosedYear.trim() === '') {
      error = 'Year is required';
    } else {
      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 80;
      const enteredYear = parseInt(diagnosedYear);

      if (enteredYear > currentYear) {
        error = 'The year cannot be in the future';
      } else if (enteredYear < minYear) {
        error = 'Invalid year';
      }
    }

    setError(error);

    return error;
  }

  const handleOnPress = async () => {
    try {
      setLoading(true);
      const error = validateField();
      if (error && !isFriend) return;

      const { userId } = await getCurrentUser();
      await updateUserDB({
        cognitoId: userId,
        lastName: null,
        diagnosisYear: diagnosedYear,
        profilePicture: null,
        config: {
          notifications: {
            active: false,
            notificationToken: '',
            deviceType: Platform.OS,
          },
        },
      });

    } catch (error) {
      if (__DEV__) console.warn('Failed to update user', error);
    } finally {
      setLoading(false);
      navigation.navigate('Authentication', {
        screen: 'RecommendedGroups',
      });
    }
  };

  const onPressPrivacyTerms = (isPrivacy: boolean) => {
    const linkPrivacy = 'https://laurieslove.org/privacy-policy/';
    const linkTerms = 'https://laurieslove.org/terms-of-use/';
    Linking.openURL(isPrivacy ? linkPrivacy : linkTerms);
  };

  return (
    <LinearGradient
      colors={[
        'rgba(255, 227, 195, 0.70)',
        colors.neutral[100],
        colors.secondary[300],
      ]}
      locations={[0, 0.4, 1]}
      style={styles.linearGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            scrollEnabled={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.scrollContainer}>
              <View style={styles.contentContainer}>
                <View style={styles.topSection}>
                  <Progress value={90} />
                  <TouchableOpacity
                    onPress={onPressBack}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <IconArrowLeft
                      width={30}
                      height={30}
                      stroke={colors.neutral[1000]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ gap: 24 }}>
                  <View style={{ gap: 8 }}>
                    <Text style={styles.title}>
                      {isFriend ? 'Terms and Policy' : 'Diagnosed Year'}
                    </Text>
                  </View>
                  {!isFriend && (
                    <View style={styles.mainSection}>
                      <Input
                        value={diagnosedYear}
                        onChangeText={text => {
                          const numericValue = text.replace(/[^0-9]/g, '');
                          setDiagnosedYear(numericValue);
                        }}
                        placeholder="Enter year*"
                        textContentType="none"
                        keyboardType="numeric"
                        errorMessage={error}
                        onBlur={() => validateField()}
                        maxLength={24}
                      />
                    </View>
                  )}
                </View>
              </View>
              <View>
                <View style={styles.checkboxWrapper}>
                  <TouchableOpacity
                    onPress={() => setTermsAccepted(!termsAccepted)}
                    accessibilityRole="checkbox"
                    style={styles.checkboxContainer}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        termsAccepted && styles.selectedCheckbox,
                      ]}
                    >
                      {termsAccepted && (
                        <IconCheckbox
                          width={14}
                          height={14}
                          stroke={colors.neutral[100]}
                        />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>
                      I accept the {''}
                      <Text
                        style={styles.checkboxTextLink}
                        onPress={() => onPressPrivacyTerms(false)}
                      >
                        Terms of Use
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPrivacyAccepted(!privacyAccepted)}
                    accessibilityRole="checkbox"
                    style={styles.checkboxContainer}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        privacyAccepted && styles.selectedCheckbox,
                      ]}
                    >
                      {privacyAccepted && (
                        <IconCheckbox
                          width={14}
                          height={14}
                          stroke={colors.neutral[100]}
                        />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>
                      I accept the {''}
                      <Text
                        style={styles.checkboxTextLink}
                        onPress={() => onPressPrivacyTerms(true)}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                  <Button
                    title="Continue"
                    onPress={handleOnPress}
                    disabled={isDisabled}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}
