declare namespace Authentication {
  export type Params = {
    email: string;
    password: string;
  };
  export type ResendSignUpCode = {
    email: string;
  };

  export type SetNewPasswordParams = {
    user: AccountModel;
    password: string;
  };
  export type ChangePasswordParams = {
    user: AccountModel;
    oldPassword: string;
    newPassword: string;
  };

  export type MfaParams = {
    user: AccountModel;
    verificationCode: string;
  };

  export type ForgotPasswordParams = {
    email: string;
  };

  export type ForgotPasswordSubmitParams = {
    email: string;
    verificationCode: string;
    newPassword: string;
  };

  export type SignUpParams = {
    username: string;
    password: string;
    attributes?: SignUpAttributesParams;
  };

  export type CompleteNewPasswordParams = {
    user: AccountModel;
    password: string;
  };

  export type SignUpAttributesParams = {
    email?: string;
    phone_number?: string;
    given_name: string;
    family_name: string;
  };

  export type ConfirmSignUpParams = {
    username: string;
    code: string;
  };

  export type Model = AccountModel;
}

declare namespace RemoteAuthentication {
  export type Model = Authentication.Model;
}
