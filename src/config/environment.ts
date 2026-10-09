import { API_BASE_URL as configuredApiBaseUrl } from '@env';

/** Shared API configuration injected from .env when Metro bundles JavaScript. */
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, '');

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is missing from the frontend .env file.');
}
