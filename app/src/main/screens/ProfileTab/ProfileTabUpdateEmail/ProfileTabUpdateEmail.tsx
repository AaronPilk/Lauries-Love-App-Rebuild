import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// types
import { RootProfileTabParamList } from 'main/navigators/ProfileTabStacks/ProfileTabStacks.types';

// providers
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useUserAWSProvider } from 'providers/UserAWSProvider/UserAWSProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderTabScreen from '../../../../components/HeaderTabScreen/HeaderTabScreen';
import OTPInput from 'components/OTPInput/OTPInput';
import Input from 'components/Input/Input';
import Button from 'components/Button/Button';

// constants
import { REGEX_EMAIL } from 'constants/regexp';

// styles
import styles from './ProfileTabUpdateEmail.styles';

type ProfileTabUpdateEmailProps = {
  navigation: NativeStackNavigationProp<RootProfileTabParamList>;
};

const WIDTH = Dimensions.get('window').width;

const ProfileTabUpdateEmail: FunctionComponent<ProfileTabUpdateEmailProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const { userDB, updateUserDB } = useUserDBProvider();
  const {
    updateUserAttributesAWS,
    handleConfirmUserAttribute,
    handleSendUserAttributeVerificationCode,
  } = useUserAWSProvider();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [index, setIndex] = useState(0);
  const refScrollView = useRef<ScrollView>(null);

  const isChangingEmail = useMemo(() => {
    return index === 0
      ? email !== userDB?.email &&
          email !== '' &&
          email.includes('@') &&
          REGEX_EMAIL.test(email)
      : code.join('').length === 6;
  }, [code, email, index, userDB?.email]);

  const onPressBack = () => {
    if (index === 0) navigation.goBack();
    else setIndex(0);
  };

  const sendEmail = async () => {
    try {
      setLoading(true);
      const result = await updateUserAttributesAWS({
        userAttributes: {
          email,
        },
      });
      if (!result) setErrorCode('There was an error sending the code');

      const resultUpdate = await updateUserDB({ email });
      if (resultUpdate) setIndex(1);
      else
        setErrorCode('There was an error updating the email in the database');
    } catch (error) {
      setErrorCode('There was an error sending the code');
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async () => {
    try {
      setLoading(true);
      const result = await handleConfirmUserAttribute({
        userAttributeKey: 'email',
        confirmationCode: code.join(''),
      });
      if (!result) {
        setErrorCode('Invalid code');
        return;
      }

      navigation.goBack();
    } catch (error) {
      setErrorCode('Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (index === 0) sendEmail();
    else if (index === 1) sendCode();
  };

  const resendCode = async () => {
    try {
      await handleSendUserAttributeVerificationCode({
        userAttributeKey: 'email',
      });
    } catch (error) {
      setErrorCode('There was an error sending the code');
    }
  };

  useEffect(() => {
    refScrollView.current?.scrollTo({ x: index * WIDTH, animated: true });
  }, [index]);

  useEffect(() => {
    if (userDB?.email) setEmail(userDB?.email);
  }, [userDB?.email]);

  return (
    <BackgroundScreen type="updateProfile">
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.container}
      >
        <HeaderTabScreen onPressLeft={onPressBack} />
        <ScrollView
          ref={refScrollView}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <View style={styles.titles}>
              <Text style={styles.title}>Update Email</Text>
              <Text style={styles.subTitle}>
                Enter the email where you can be contacted
              </Text>
            </View>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder={'Email e.g. yourname@example.com'}
              textContentType="emailAddress"
              maxLength={40}
            />
          </View>
          <View style={styles.screen}>
            <View style={styles.titles}>
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subTitle}>
                Please enter 6 digit code sent to {email}
              </Text>
            </View>
            {index === 1 && (
              <OTPInput
                code={code}
                setCode={setCode}
                error={errorCode}
                setError={setErrorCode}
              />
            )}
            <Text style={styles.resendText}>
              Didn’t Receive a code ?{' '}
              <Text onPress={resendCode} style={styles.resendLink}>
                Resend code
              </Text>
            </Text>
          </View>
        </ScrollView>
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
            disabled={!isChangingEmail || loading}
          />
        </View>
      </ScrollView>
    </BackgroundScreen>
  );
};

export default ProfileTabUpdateEmail;
