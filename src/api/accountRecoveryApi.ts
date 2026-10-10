import {API_BASE_URL} from '../config/environment';

export interface RecoveryResult {
  success: boolean;
  message: string;
}

export interface FoundAccountResult extends RecoveryResult {
  usrId: string | null;
}

export function sendIdRecoveryCode(hpNo: string) {
  return request<RecoveryResult>('/api/auth/recovery/id/send', {hpNo});
}

export function findAccountId(hpNo: string, code: string) {
  return request<FoundAccountResult>('/api/auth/recovery/id/find', {hpNo, code});
}

export function sendPasswordRecoveryCode(usrId: string, hpNo: string) {
  return request<RecoveryResult>('/api/auth/recovery/password/send', {usrId, hpNo});
}

export function verifyPasswordRecoveryCode(usrId: string, hpNo: string, code: string) {
  return request<RecoveryResult>('/api/auth/recovery/password/verify', {usrId, hpNo, code});
}

export function resetPassword(usrId: string, hpNo: string, newPassword: string, confirmPassword: string) {
  return request<RecoveryResult>('/api/auth/recovery/password/reset', {
    usrId,
    hpNo,
    newPassword,
    confirmPassword,
  });
}

async function request<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? data.detail ?? `요청에 실패했습니다. (${response.status})`);
  }
  return data as T;
}
