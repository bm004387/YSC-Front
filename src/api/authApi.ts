const BASE_URL = 'https://ysc-dev.duckdns.org';

interface LoginUser {
  usrId: string;
  usrNm: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: LoginUser;
}

export async function login(
  usrId: string,
  pwd: string,
): Promise<LoginResponse> {
  return request<LoginResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        usrId,
        pwd,
      }),
    },
  );
}

export const logout = async (
  accessToken: string,
): Promise<{
  message: string;
}> => {

  const response = await fetch(
    `${BASE_URL}/api/auth/logout`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? `로그아웃에 실패했습니다. (${response.status})`);
  }

  return data;
};

export const checkUsrId =
  async (
    usrId: string,
  ): Promise<{
    available: boolean;
  }> => {

    const response =
      await fetch(
        `${BASE_URL}/api/auth/check-user-id?usrId=${encodeURIComponent(usrId,)}`,
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ??
          `아이디 중복확인에 실패했습니다. (${response.status})`,
      );
    }

    return data;
  };

export const signup =
  async (
    usrId: string,
    pwd: string,
    usrNm: string,
    hpNo: string,
    adr: string,
    dtlAdr: string,
  ) => {

    const response =
      await fetch(
        `${BASE_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            usrId,
            pwd,
            usrNm,
            hpNo,
            adr,
            dtlAdr,
          }),
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ??
          `회원가입에 실패했습니다. (${response.status})`,
      );
    }

    return data;
  };

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {

  const response =
    await fetch(
      `${BASE_URL}${path}`,
      {
        ...options,
        headers: {
          'Content-Type':
            'application/json',
          ...(options.headers ?? {}),
        },
      },
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        `요청에 실패했습니다. (${response.status})`,
    );
  }

  return data as T;
}