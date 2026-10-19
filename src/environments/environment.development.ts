import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  apiUrl: 'https://localhost:5001/api/',
  auth: {
    loginUrl: 'auth/login',
    refreshUrl: 'auth/refresh',
    logoutUrl: 'auth/logout',
  },
  mockApi: true,
};
