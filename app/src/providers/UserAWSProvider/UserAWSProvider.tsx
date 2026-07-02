import { 
  signIn, 
  fetchAuthSession, 
  getCurrentUser, 
  resetPassword, 
  confirmResetPassword, 
  updateUserAttributes, 
  confirmUserAttribute, 
  sendUserAttributeVerificationCode, 
  updatePassword as updatePasswordAuth, 
  signOut, 
  deleteUser,
  AuthUser,
  JWT,
  AuthSession,
  SignInOutput,
  UpdateUserAttributesInput,
  UpdateUserAttributesOutput,
  ConfirmUserAttributeInput,
  SendUserAttributeVerificationCodeInput
} from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { captureException } from '@sentry/react-native';
import React, {
  createContext,
  FunctionComponent,
  useContext,
  useMemo,
  useState,
} from 'react';

import { customShowError } from 'utils/other';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';

// mock mode (local UI testing without Cognito)
import { MOCK_ENABLED } from 'mocks/mock.config';
import {
  MOCK_AUTH_SESSION,
  MOCK_AUTH_USER,
  MOCK_JWT,
  MOCK_SIGN_IN_OUTPUT,
  mockSignedIn,
  setMockSignedIn,
} from 'mocks/mock.auth';

type UserAWSContext = {
  userAWS: AuthUser | null;
  jwtTokenUser: JWT | null;
  checkCurrentUserAWS: () => Promise<{
    authSession: AuthSession;
    currentUser: AuthUser;
  } | null>;
  authAWS: (
    email: string,
    password: string,
  ) => Promise<SignInOutput | null>;
  forgotPassword: (params: Authentication.ForgotPasswordParams) => Promise<any>;
  updatePassword: (
    params: Authentication.ForgotPasswordSubmitParams,
  ) => Promise<any>;
  updateUserAttributesAWS: (
    data: UpdateUserAttributesInput,
  ) => Promise<UpdateUserAttributesOutput | null>;
  handleConfirmUserAttribute: (
    data: ConfirmUserAttributeInput,
  ) => Promise<boolean>;
  handleSendUserAttributeVerificationCode: (
    data: SendUserAttributeVerificationCodeInput,
  ) => Promise<boolean>;
  updatePasswordAWS: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<boolean | string>;
  signOutAWS: () => Promise<boolean>;
  deleteAWS: () => Promise<boolean>;
};

type UserAWSProviderProps = {
  children: React.ReactNode;
};

export const userAWSContext = createContext({} as UserAWSContext);

const UserAWSProvider: FunctionComponent<UserAWSProviderProps> = ({
  children,
}) => {
  const { showToast } = useToastProvider();
  const [userAWS, setUserAWS] = useState<AuthUser | null>(null);
  const [jwtTokenUser, setJwtTokenUser] = useState<JWT | null>(null);

  const checkCurrentUserAWS = async () => {
    if (MOCK_ENABLED) {
      if (!mockSignedIn) return null;
      setJwtTokenUser(MOCK_JWT);
      setUserAWS(MOCK_AUTH_USER);
      return { authSession: MOCK_AUTH_SESSION, currentUser: MOCK_AUTH_USER };
    }
    try {
      console.log('👤 checkCurrentUserAWS: Fetching auth session...');
      const authSession = await fetchAuthSession();
      console.log('👤 checkCurrentUserAWS: Auth session fetched, has tokens:', !!authSession.tokens);

      if (!authSession.tokens) return null;

      console.log('👤 checkCurrentUserAWS: Getting current user...');
      const currentUser = await getCurrentUser();
      console.log('👤 checkCurrentUserAWS: Current user fetched:', currentUser.userId);

      setJwtTokenUser(authSession.tokens.accessToken);
      setUserAWS(currentUser);
      console.log('👤 checkCurrentUserAWS: State updated with user');
      return {
        authSession,
        currentUser,
      };
    } catch (error) {
      console.log('👤 checkCurrentUserAWS: Error:', error);
      customShowError({ error, showToast });
      captureException(error);
      return null;
    }
  };

  const authAWS = async (email: string, password: string, getUserDB = true) => {
    if (MOCK_ENABLED) {
      // Any credentials sign in as the mock user.
      setMockSignedIn(true);
      setJwtTokenUser(MOCK_JWT);
      setUserAWS(MOCK_AUTH_USER);
      return MOCK_SIGN_IN_OUTPUT;
    }
    try {
      console.log('🔐 authAWS: Starting sign in...');
      const result = await signIn({
        username: email,
        password: password,
      });
      console.log('🔐 authAWS: Sign in result:', { isSignedIn: result.isSignedIn, nextStep: result.nextStep });
      if (result.isSignedIn) {
        console.log('🔐 authAWS: Fetching current user...');
        await checkCurrentUserAWS();
        console.log('🔐 authAWS: Current user fetched successfully');
      }
      return result;
    } catch (error) {
      console.log('🔐 authAWS: Error during sign in:', error);
      customShowError({ error, showToast });
      captureException(error);
      return null;
    }
  };

  const forgotPassword = async ({
    email,
  }: Authentication.ForgotPasswordParams) => {
    if (MOCK_ENABLED) return { isPasswordReset: true } as any;
    return resetPassword({
      username: email,
    });
  };

  const updatePassword = async ({
    email,
    verificationCode,
    newPassword,
  }: Authentication.ForgotPasswordSubmitParams) => {
    return confirmResetPassword({
      username: email,
      newPassword,
      confirmationCode: verificationCode,
    });
  };

  const updateUserAttributesAWS = async (
    data: UpdateUserAttributesInput,
  ) => {
    if (MOCK_ENABLED) return {} as any;
    try {
      const result = await updateUserAttributes(data);
      return result;
    } catch (error) {
      customShowError({ error, showToast });
      captureException(error);
      return null;
    }
  };

  const handleConfirmUserAttribute = async (
    data: ConfirmUserAttributeInput,
  ) => {
    if (MOCK_ENABLED) return true;
    try {
      await confirmUserAttribute(data);
      await checkCurrentUserAWS();
      return true;
    } catch (error) {
      customShowError({ error, showToast });
      captureException(error);
      return false;
    }
  };

  const handleSendUserAttributeVerificationCode = async (
    data: SendUserAttributeVerificationCodeInput,
  ) => {
    if (MOCK_ENABLED) return true;
    try {
      await sendUserAttributeVerificationCode(data);
      return true;
    } catch (error) {
      customShowError({ error, showToast });
      captureException(error);
      return false;
    }
  };

  const updatePasswordAWS = async (
    oldPassword: string,
    newPassword: string,
  ) => {
    if (MOCK_ENABLED) return true;
    try {
      await updatePasswordAuth({
        oldPassword,
        newPassword,
      });
      return true;
    } catch (error: any) {
      customShowError({ error, showToast });
      return error.name;
    }
  };

  const signOutAWS = async () => {
    if (MOCK_ENABLED) {
      setMockSignedIn(false);
      setUserAWS(null);
      setJwtTokenUser(null);
      return true;
    }
    try {
      await signOut();
      setUserAWS(null);
      setJwtTokenUser(null);
      return true;
    } catch (error) {
      customShowError({ error, showToast });
      captureException(error);
      return false;
    }
  };

  const deleteAWS = async () => {
    if (MOCK_ENABLED) {
      setMockSignedIn(false);
      setUserAWS(null);
      setJwtTokenUser(null);
      return true;
    }
    try {
      await deleteUser();
      setUserAWS(null);
      setJwtTokenUser(null);
      return true;
    } catch (error) {
      customShowError({ error, showToast });
      captureException(error);
      return false;
    }
  };

  const value = useMemo(
    () => ({
      userAWS,
      jwtTokenUser,
      checkCurrentUserAWS,
      authAWS,
      updateUserAttributesAWS,
      handleConfirmUserAttribute,
      handleSendUserAttributeVerificationCode,
      updatePasswordAWS,
      signOutAWS,
      deleteAWS,
      forgotPassword,
      updatePassword,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userAWS, jwtTokenUser, showToast],
  );

  return (
    <userAWSContext.Provider value={value}>
      {children}
    </userAWSContext.Provider>
  );
};
export const useUserAWSProvider = () => useContext(userAWSContext);

export default UserAWSProvider;
