import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// types
import { RootProfileTabParamList } from 'main/navigators/ProfileTabStacks/ProfileTabStacks.types';

// providers
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderTabScreen from '../../../../components/HeaderTabScreen/HeaderTabScreen';
import Button from 'components/Button/Button';

// hooks
import { Country, useCountry } from 'presentation/hooks';

// styles
import styles from './ProfileTabUpdatePhone.styles';
import { PhoneInput } from 'components/PhoneInput/PhoneInput';

type ProfileTabUpdatePhoneProps = {
  navigation: NativeStackNavigationProp<RootProfileTabParamList>;
};

const ProfileTabUpdatePhone: FunctionComponent<ProfileTabUpdatePhoneProps> = ({
  navigation,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { userDB, updateUserDB } = useUserDBProvider();

  const { supportedCountries, defaultCountry } = useCountry();

  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>();
  const [error, setError] = useState('');

  const isChangingPhone = useMemo(
    () => phone.replace(/\D/g, '') !== userDB?.phoneNumber,
    [phone, userDB?.phoneNumber],
  );

  const handleContinue = async () => {
    const error = validatePhone();
    if (error) {
      return;
    }

    const clearPhone = phone.replace(/\D/g, '');
    const result = await updateUserDB({
      phoneNumber: clearPhone,
      phoneNumberLocation: selectedCountry?.code ?? defaultCountry.code,
    });
    if (result) navigation.goBack();
  };

  useEffect(() => {
    setPhone(userDB?.phoneNumber || '');
    const country =
      supportedCountries.find(c => c.code === userDB?.phoneNumberLocation) ||
      defaultCountry;
    setSelectedCountry(country);
  }, []);

  const handlePhoneChange = (phoneText: string, selectedCountry: Country) => {
    setError('');
    setPhone(phoneText);
    setSelectedCountry(selectedCountry);
  };

  function validatePhone() {
    let error = '';

    const clearPhone = phone.replace(/\D/g, '');
    const format = selectedCountry?.format;
    if (format) {
      const expectedLength = (format.match(/X/g) || []).length;
      if (clearPhone.length !== expectedLength) {
        error = `Invalid phone number, e.g ${format.replaceAll('X', '5')}`;
      }
    } else {
      if (clearPhone.length < 6) {
        error = 'Invalid phone number';
      }
    }
    setError(error);

    return error;
  }

  return (
    <BackgroundScreen type="updateProfile">
      <HeaderTabScreen onPressLeft={() => navigation.goBack()} />
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.screen}>
          <View style={styles.titles}>
            <Text style={styles.title}>Update Phone Number</Text>
            <Text style={styles.subTitle}>Enter your phone number</Text>
          </View>
          <PhoneInput
            value={phone}
            onChange={(phoneText: string, selectedCountry: any) => {
              handlePhoneChange(phoneText, selectedCountry);
            }}
            countryList={supportedCountries}
            defaultCountryCode={
              userDB?.phoneNumberLocation ?? defaultCountry.code
            }
            errorMessage={error}
            onBlur={() => validatePhone()}
          />
        </View>
        <View
          style={[
            styles.buttonContainer,
            {
              paddingBottom: bottom + 10,
            },
          ]}
        >
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!isChangingPhone || !!error}
          />
        </View>
      </ScrollView>
    </BackgroundScreen>
  );
};

export default ProfileTabUpdatePhone;
