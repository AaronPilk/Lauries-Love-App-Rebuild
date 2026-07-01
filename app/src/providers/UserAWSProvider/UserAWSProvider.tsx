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
  useState,
} from 'react';

import { customShowError } from 'utils/other';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';

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

  return (
    <userAWSContext.Provider
      value={{
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
      }}
    >
      {children}
    </userAWSContext.Provider>
  );
};
export const useUserAWSProvider = () => useContext(userAWSContext);

export default UserAWSProvider;
