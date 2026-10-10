import {Platform} from 'react-native';
import {API_BASE_URL} from '../config/environment';

type PushTokenPayload = {
  token: string;
  platform: 'IOS' | 'ANDROID';
};

async function sendPushTokenRequest(
  accessToken: string,
  payload: PushTokenPayload,
  method: 'POST' | 'DELETE',
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notifications/devices`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.message || `푸시 토큰 처리 실패 (${response.status})`);
  }
}

export async function registerPushToken(
  accessToken: string,
  token: string,
): Promise<void> {
  await sendPushTokenRequest(
    accessToken,
    {token, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID'},
    'POST',
  );
}

export async function unregisterPushToken(
  accessToken: string,
  token: string,
): Promise<void> {
  await sendPushTokenRequest(
    accessToken,
    {token, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID'},
    'DELETE',
  );
}
