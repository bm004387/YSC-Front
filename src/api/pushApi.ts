import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/environment';
import { authenticatedFetch } from './apiClient';
import { getCachedMsg } from '../utils/msgUtil';

type PushTokenPayload = {
  token: string;
  platform: string;
};

async function sendPushTokenRequest(accessToken: string, payload: PushTokenPayload,
                                    method: 'POST' | 'DELETE'): Promise<void> {
  const endpoint = `${API_BASE_URL}/api/notifications/devices`;
  const response = await authenticatedFetch(endpoint, accessToken, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.message || getCachedMsg('COMMON', '023'));
  }
}

export async function registerPushToken(accessToken: string, token: string): Promise<void> {
  const platformCode =
    Platform.OS === 'ios'
      ? (Platform as typeof Platform & { isPad?: boolean }).isPad
        ? '003'
        : '001'
      : '002';
  await sendPushTokenRequest(accessToken, { token, platform: platformCode }, 'POST');
}

export async function unregisterPushToken(accessToken: string, token: string): Promise<void> {
  const platformCode =
    Platform.OS === 'ios'
      ? (Platform as typeof Platform & { isPad?: boolean }).isPad
        ? '003'
        : '001'
      : '002';
  await sendPushTokenRequest(accessToken, { token, platform: platformCode }, 'DELETE');
}
