export interface CognitoPayload {
  sub: string;
  email_verified: boolean;
  iss: string;
  'cognito:username': string;
  'cognito:groups'?: string[];
  given_name: string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
  family_name: string;
  jti: string;
  email: string;
}
