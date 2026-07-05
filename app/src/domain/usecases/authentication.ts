// aws-amplify removed — structural aliases for the old Cognito output types.
type ResetPasswordOutput = any;
type SignUpOutput = any;
type ConfirmSignUpOutput = any;
type ConfirmSignInOutput = any;

export interface Authentication {
  resendSignUp(email: string): Promise<unknown>;
  auth(params: Authentication.Params): Promise<Authentication.Model>;
  checkCurrentUser(): Promise<Authentication.Model>;
  confirmCustomChallenge(
    params: Authentication.MfaParams,
  ): Promise<Authentication.Model>;
  initForgotPassword(
    params: Authentication.ForgotPasswordParams,
  ): Promise<ResetPasswordOutput>;
  forgotPasswordSubmit(
    params: Authentication.ForgotPasswordSubmitParams,
  ): Promise<void>;
  signUp(params: Authentication.SignUpParams): Promise<SignUpOutput>;
  signOut(): Promise<void>;
  confirmSignUp(
    params: Authentication.ConfirmSignUpParams,
  ): Promise<ConfirmSignUpOutput>;
  setNewPassword(
    params: Authentication.SetNewPasswordParams,
  ): Promise<ConfirmSignInOutput>;
  changePassword(params: Authentication.ChangePasswordParams): Promise<void>;
  completePassword(
    params: Authentication.CompleteNewPasswordParams,
  ): Promise<Authentication.Model>;
}
