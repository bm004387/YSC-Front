const BASE_URL = 'https://ysc-dev.duckdns.org';

export const getMsgList = async (): 
  Promise<Record<string, string>> => {
    const response = await fetch(`${BASE_URL}/api/msg/all`);
    if (!response.ok) {
      throw new Error(
        `메시지 조회에 실패했습니다. (${response.status})`,
      );
    }
    return await response.json();
  };

  export const sendSms = async (hpNo: string):
    Promise<{success: boolean;message: string;}> => {
      const response = await fetch(`${BASE_URL}/api/sms/send`,
      {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          hpNo,
        }),
      },
    );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? `인증번호 발송에 실패했습니다. (${response.status})`);
  }

  return data;
};

export const verifySms = async (
  hpNo: string,
  code: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await fetch(`${BASE_URL}/api/sms/verify`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          hpNo,
          code,
        }),
      },
    );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? `인증번호 확인에 실패했습니다. (${response.status})`);
  }

  return data;
};