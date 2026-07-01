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
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';

// styles
import styles from './ProfileTabMainUpdateFullName.styles';

type ProfileTabMainUpdateFullNameProps = {
  navigation: NativeStackNavigationProp<RootProfileTabParamList>;
};

const ProfileTabMainUpdateFullName: FunctionComponent<
  ProfileTabMainUpdateFullNameProps
> = ({ navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const { userDB, updateUserDB } = useUserDBProvider();
  const [fullName, setFullName] = useState('');

  const oldFullName = useMemo(
    () =>
      userDB
        ? `${userDB.firstName}${userDB.lastName ? ` ${userDB.lastName}` : ''}`
        : '',
    [userDB?.firstName, userDB?.lastName],
  );

  const isChangingPhone = useMemo(
    () => fullName !== oldFullName && fullName.length > 0,
    [fullName, oldFullName],
  );

  const getFullName = () => {
    if (!userDB) return;
    setFullName(oldFullName);
  };

  const handleContinue = async () => {
    const [firstName, ...allLastName] = fullName.split(' ');
    const lastName = allLastName.join(' ');
    const result = await updateUserDB({ firstName, lastName });
    if (result) navigation.goBack();
  };

  useEffect(() => {
    getFullName();
  }, []);

  return (
    <BackgroundScreen type="updateProfile">
      <HeaderTabScreen onPressLeft={() => navigation.goBack()} />
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.screen}>
          <View style={styles.titles}>
            <Text style={styles.title}>Update Full Name</Text>
            <Text style={styles.subTitle}>Enter your full name</Text>
          </View>
          <Input
            value={fullName}
            onChangeText={setFullName}
            placeholder={'Name'}
            textContentType="telephoneNumber"
            keyboardType="name-phone-pad"
            maxLength={24}
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
            disabled={!isChangingPhone}
          />
        </View>
      </ScrollView>
    </BackgroundScreen>
  );
};

export default ProfileTabMainUpdateFullName;
