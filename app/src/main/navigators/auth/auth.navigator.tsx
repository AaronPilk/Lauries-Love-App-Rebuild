import React, { useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// types
import { AuthenticationStackParamList } from 'types/navigation';

// providers
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';

// screens
// import { SignUpConfirmScreen, ChangePassword } from 'main/screens';
import LoginScreen from 'main/screens/Auth/Login/Login';
import VerifyEmailScreen from 'main/screens/Auth/VerifyEmail/verify-email.screen';
import CreateAccountScreen from 'main/screens/Auth/CreateAccount/create-account.screen';
import CreatePasswordScreen from 'main/screens/Auth/CreatePassword/create-password.screen';
import YourAddressScreen from 'main/screens/Auth/YourAddress/your-address.screen';
import UserTypeScreen from 'main/screens/Auth/UserType/user-type.screen';
import CancerTypeScreen from 'main/screens/Auth/CancerType/cancer-type.screen';
import SubCancerTypeScreen from 'main/screens/Auth/SubCancerType/sub-cancer-type.screen';
import ForgotPasswordScreen from 'main/screens/Auth/Forgot/ForgotPassword';
import YourAgeScreen from 'main/screens/Auth/YourAge/your-age.screen';
import YourGenderScreen from 'main/screens/Auth/YourGender/your-gender.screen';
import DiagnosedYearScreen from 'main/screens/Auth/DiagnosedYear/diagnosed-year.screen';
import RecommendedGroupsScreen from 'main/screens/Auth/RecommendedGroups/recommended-groups.screen';

const AuthenticationStack =
  createStackNavigator<AuthenticationStackParamList>();

const AuthenticationNavigator = () => {
  const { userDB } = useUserDBProvider();

  const initialRouteName = useMemo(() => {
    if (!userDB) return 'login';
    if (!userDB.city || !userDB.country || !userDB.zipCode)
      return 'YourAddress';
    if (!userDB.diagnosisTypes) return 'CancerType';
    if (!userDB.role) return 'UserType';
    if (!userDB.age) return 'YourAge';
    if (!userDB.gender) return 'YourGender';
    return 'login';
  }, [userDB]);

  return (
    <AuthenticationStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthenticationStack.Screen name="login" component={LoginScreen} />
      <AuthenticationStack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
      />
      <AuthenticationStack.Screen
        name="CreatePassword"
        component={CreatePasswordScreen}
      />
      <AuthenticationStack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
      />
      <AuthenticationStack.Screen
        name="YourAddress"
        component={YourAddressScreen}
      />
      <AuthenticationStack.Screen name="UserType" component={UserTypeScreen} />
      <AuthenticationStack.Screen
        name="CancerType"
        component={CancerTypeScreen}
      />
      <AuthenticationStack.Screen
        name="SubCancerType"
        component={SubCancerTypeScreen}
      />
      <AuthenticationStack.Screen name="YourAge" component={YourAgeScreen} />
      <AuthenticationStack.Screen
        name="YourGender"
        component={YourGenderScreen}
      />
      <AuthenticationStack.Screen
        name="RecommendedGroups"
        component={RecommendedGroupsScreen}
      />
      <AuthenticationStack.Screen
        name="DiagnosedYear"
        component={DiagnosedYearScreen}
      />
      <AuthenticationStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      {/* <AuthenticationStack.Screen
        name="SignUpConfirm"
        component={SignUpConfirmScreen}
      />
      <AuthenticationStack.Screen
        name="ChangePassword"
        component={ChangePassword}
      /> */}
    </AuthenticationStack.Navigator>
  );
};
export default AuthenticationNavigator;
