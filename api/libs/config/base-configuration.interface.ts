export interface BaseConfiguration {
  paramsEnv: string;
  dbHost: string;
  dbDatabase: string;
  dbUsername: string;
  dbPassword: string;
  dbPort: number;
  cognitoUserPoolId: string;
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsS3Bucket: string;
  authorizeTransactionId: string;
  authorizeApiLoginId: string;
  intercomSecreyKey: string;
}
