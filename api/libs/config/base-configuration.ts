import { BaseConfiguration } from './base-configuration.interface';

export const loadApiConfiguration = (): BaseConfiguration => ({
  paramsEnv: process.env['PARAMS_ENV'] || '',
  awsRegion: process.env['AWS_REGION'] || '',
  awsS3Bucket: process.env['AWS_S3_BUCKET'] || '',
  awsAccessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
  awsSecretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || '',
  cognitoUserPoolId: process.env['COGNITO_USER_POOL_ID'] || '',
  dbHost: process.env['DB_HOST'] || '',
  dbUsername: process.env['DB_USERNAME'] || '',
  dbPassword: process.env['DB_PASSWORD'] || '',
  dbPort: +(process.env['DB_PORT'] ?? 3306),
  dbDatabase: process.env['DB_DATABASE'] || '',
  authorizeApiLoginId: process.env['AUTHORIZE_PAYMENT_API_LOGIN_ID'] || '',
  authorizeTransactionId: process.env['AUTHORIZE_TRANSACTION_KEY'] || '',
  intercomSecreyKey: process.env['INTERCOM_SECRET_KEY'] || '',
});
