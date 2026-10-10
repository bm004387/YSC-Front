import * as Keychain from 'react-native-keychain';

export const AUTH_SERVICE = 'ysc-auth';
export const REMEMBER_ID_SERVICE = 'ysc-remember-id';
export const APP_STATE_SERVICE = 'ysc-app-state';

export function getAuthCredentials() {
  return Keychain.getGenericPassword({service: AUTH_SERVICE});
}

export function saveAuthCredentials(username: string, token: string) {
  return Keychain.setGenericPassword(username, token, {service: AUTH_SERVICE});
}

export function clearAuthCredentials() {
  return Keychain.resetGenericPassword({service: AUTH_SERVICE});
}

export function clearRememberedUserId() {
  return Keychain.resetGenericPassword({service: REMEMBER_ID_SERVICE});
}

export async function getRememberedUserId(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({
    service: REMEMBER_ID_SERVICE,
  });
  return credentials ? credentials.username : null;
}

export function saveRememberedUserId(userId: string) {
  return Keychain.setGenericPassword(userId, 'remembered', {
    service: REMEMBER_ID_SERVICE,
  });
}

export async function saveBackgroundTimestamp(timestamp: number) {
  return Keychain.setGenericPassword(String(timestamp), 'background', {service: APP_STATE_SERVICE});
}

export async function getBackgroundTimestamp(): Promise<number | null> {
  const value = await Keychain.getGenericPassword({service: APP_STATE_SERVICE});
  if (!value) return null;
  const timestamp = Number(value.username);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function clearBackgroundTimestamp() {
  return Keychain.resetGenericPassword({service: APP_STATE_SERVICE});
}
