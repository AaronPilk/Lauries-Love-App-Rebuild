export type EventsPosthogType =
  | 'Login'
  | 'Logout'
  | 'SignUp'
  | 'ResetPassword'
  | 'ForgotPassword'
  | 'DeleteAccount';

export type EventLoginType = {
  typeEvent:
    | 'Login'
    | 'Logout'
    | 'ResetPassword'
    | 'ForgotPassword'
    | 'DeleteAccount';
  properties: {
    email: string;
    userId?: string;
  };
};

export type EventSignUpType = {
  typeEvent: 'SignUp';
  properties: {
    email: string;
    userId?: string;
  };
};

export type PosthogEventType = EventLoginType | EventSignUpType;
