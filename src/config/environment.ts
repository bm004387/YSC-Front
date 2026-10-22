import { API_BASE_URL as configuredApiBaseUrl } from '@env';

/** Shared API configuration injected from .env when Metro bundles JavaScript. */
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, '');

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is missing from the frontend .env file.');
}

if (!__DEV__ && !API_BASE_URL.startsWith('https://')) {
  throw new Error('Release builds require an HTTPS API_BASE_URL.');
}
