import { RemoteAuthentication } from 'data/usecases';

export const makeRemoteAuthenticationAdapter = (): RemoteAuthentication => {
  return new RemoteAuthentication();
};
