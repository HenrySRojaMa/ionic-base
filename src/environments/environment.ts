import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  apiUrl: '/api/',
  auth: {
    loginUrl: 'auth/login',
    refreshUrl: 'auth/refresh',
    logoutUrl: 'auth/logout',
  },
  mockApi: false,
};
