import * as Auth from 'aws-amplify/auth';
import { Authentication } from 'domain/usecases';

export class RemoteAuthentication implements Authentication {
  async resendSignUp(email: string) {
    //return Auth.resendSignUp(email);
    return Auth.resendSignUpCode({
      username: email,
    });
  }
  async confirmCustomChallenge(params: Authentication.MfaParams) {
    //return Auth.confirmSignIn(params.user, params.verificationCode);
    return Auth.confirmSignIn({
      challengeResponse: params.verificationCode,
      options: {
        userAttributes: params.user,
      },
    });
  }

  async auth(params: Authentication.Params) {
    //return Auth.signIn(params.email, params.password);
    return Auth.signIn({
      username: params.email,
      password: params.password,
    });
  }

  async initForgotPassword(params: Authentication.ForgotPasswordParams) {
    //return Auth.forgotPassword(params.email);
    return Auth.resetPassword({
      username: params.email,
    });
  }

  async forgotPasswordSubmit(
    params: Authentication.ForgotPasswordSubmitParams,
  ) {
    /* return Auth.forgotPasswordSubmit(
      params.email,
      params.verificationCode,
      params.newPassword,
    ); */
    return Auth.confirmResetPassword({
      username: params.email,
      newPassword: params.newPassword,
      confirmationCode: params.verificationCode,
    });
  }

  async signUp(params: Authentication.SignUpParams) {
    return Auth.signUp({ ...params });
  }

  async confirmSignUp(params: Authentication.ConfirmSignUpParams) {
    //return Auth.confirmSignUp(params.username, params.code);
    return Auth.confirmSignUp({
      username: params.username,
      confirmationCode: params.code,
    });
  }

  async setNewPassword(params: Authentication.SetNewPasswordParams) {
    //return Auth.completeNewPassword(params.user, params.password);
    return Auth.confirmSignIn({
      challengeResponse: params.password,
      options: {
        userAttributes: params.user,
      },
    });
  }
  async checkCurrentUser() {
    //return Auth.currentAuthenticatedUser();
    const authSession = await Auth.fetchAuthSession();
    if (!authSession.tokens) return null;

    const currentUser = await Auth.getCurrentUser();
    return {
      authSession,
      currentUser,
    };
  }
  async signOut(): Promise<any> {
    return Auth.signOut();
  }
  async changePassword(params: Authentication.ChangePasswordParams) {
    /* return Auth.changePassword(
      params.user,
      params.oldPassword,
      params.newPassword,
    ); */
    return Auth.updatePassword({
      oldPassword: params.oldPassword,
      newPassword: params.newPassword,
    });
  }

  async currentCredentials() {
    //return Auth.currentCredentials();
    return Auth.fetchAuthSession();
  }

  async completePassword(params: Authentication.CompleteNewPasswordParams) {
    //return Auth.completeNewPassword(params.user, params.password);
    return Auth.confirmSignIn({
      challengeResponse: params.password,
    });
  }
}
