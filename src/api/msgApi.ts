import { API_BASE_URL } from '../config/environment';
import { getCachedMsg } from '../utils/msgUtil';

interface SmsResponse {
  success: boolean;
  message: string;
}

export const getMsgList = async (): Promise<Record<string, string>> => {
  const response = await fetch(`${API_BASE_URL}/api/msg/all`);
  if (!response.ok) {
    throw new Error(getCachedMsg('COMMON', '023'));
  }
  return response.json();
};

export const sendSms = async (hpNo: string): Promise<SmsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hpNo }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? getCachedMsg('SMS', '005'));
  }

  return data;
};

export const verifySms = async (hpNo: string, code: string): Promise<SmsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/sms/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hpNo, code }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? getCachedMsg('SMS', '003'));
  }

  return data;
};
