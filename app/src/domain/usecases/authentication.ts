import * as Auth from 'aws-amplify/auth';

export interface Authentication {
  resendSignUp(email: string): Promise<unknown>;
  auth(params: Authentication.Params): Promise<Authentication.Model>;
  checkCurrentUser(): Promise<Authentication.Model>;
  confirmCustomChallenge(
    params: Authentication.MfaParams,
  ): Promise<Authentication.Model>;
  initForgotPassword(
    params: Authentication.ForgotPasswordParams,
  ): Promise<Auth.ResetPasswordOutput>;
  forgotPasswordSubmit(
    params: Authentication.ForgotPasswordSubmitParams,
  ): Promise<void>;
  signUp(params: Authentication.SignUpParams): Promise<Auth.SignUpOutput>;
  signOut(): Promise<void>;
  confirmSignUp(
    params: Authentication.ConfirmSignUpParams,
  ): Promise<Auth.ConfirmSignUpOutput>;
  setNewPassword(
    params: Authentication.SetNewPasswordParams,
  ): Promise<Auth.ConfirmSignInOutput>;
  changePassword(params: Authentication.ChangePasswordParams): Promise<void>;
  completePassword(
    params: Authentication.CompleteNewPasswordParams,
  ): Promise<Authentication.Model>;
}
