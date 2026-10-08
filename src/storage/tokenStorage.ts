import * as Keychain from 'react-native-keychain';

export const AUTH_SERVICE = 'ysc-auth';
export const REMEMBER_ID_SERVICE = 'ysc-remember-id';

export function getAuthCredentials() {
  return Keychain.getGenericPassword({service: AUTH_SERVICE});
}

export function saveAuthCredentials(username: string, token: string) {
  return Keychain.setGenericPassword(username, token, {service: AUTH_SERVICE});
}

export function clearAuthCredentials() {
  return Keychain.resetGenericPassword({service: AUTH_SERVICE});
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

export function clearRememberedUserId() {
  return Keychain.resetGenericPassword({service: REMEMBER_ID_SERVICE});
}
