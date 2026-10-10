import { API_BASE_URL } from '../config/environment';
import { getCommonCodeName } from '../utils/commonCodeUtil';

export interface UserProfile {
  usrId: string;
  usrNm: string;
  hpNo: string;
  adr: string;
  dtlAdr: string;
  profileImageUrl: string | null;
}

interface NativeUploadFile {
  uri: string;
  name: string;
  type: string;
}

export async function getMyProfile(token: string): Promise<UserProfile> {
  return request<UserProfile>('/api/user/me', token);
}

export async function changeMyPassword(
  token: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{success: boolean; message: string}> {
  return request<{success: boolean; message: string}>('/api/user/me/password', token, {
    method: 'PUT',
    body: JSON.stringify({currentPassword, newPassword, confirmPassword}),
  });
}

export async function changeMyPin(token: string, pin: string): Promise<{message: string}> {
  return request<{message: string}>('/api/user/me/pin', token, {
    method: 'PUT',
    body: JSON.stringify({pin}),
  });
}

export async function verifyCurrentPassword(token: string, currentPassword: string) {
  return request<{valid: boolean; message: string}>(
    '/api/user/me/password/verify',
    token,
    {
      method: 'POST',
      body: JSON.stringify({currentPassword}),
    },
  );
}

export async function changeMyAddress(token: string, adr: string, dtlAdr: string) {
  return request('/api/user/me/address', token, {
    method: 'PUT',
    body: JSON.stringify({adr, dtlAdr}),
  });
}

export async function saveMyProfileImage(
  token: string,
  file: NativeUploadFile,
): Promise<{message: string; profileImageUrl: string}> {
  const form = new FormData();
  form.append('filTyp', await getCommonCodeName('FIL_TYP', '002'));
  form.append('filCd', await getCommonCodeName('FIL_CD', '002'));
  form.append('file', file);
  const response = await fetch(`${API_BASE_URL}/api/user/me/profile-image`, {
    method: 'PUT',
    headers: {Authorization: `Bearer ${token}`},
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(getResponseMessage(data) ?? `파일 저장에 실패했습니다. (${response.status})`);
  return data;
}

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getResponseMessage(data) ?? `요청에 실패했습니다. (${response.status})`);
  }
  return data;
}

function getResponseMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const body = data as {message?: unknown; detail?: unknown};
  if (typeof body.message === 'string') return body.message;
  if (typeof body.detail === 'string') return body.detail;
  return undefined;
}
