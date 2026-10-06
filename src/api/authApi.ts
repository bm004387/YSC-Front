const BASE_URL = 'https://ysc-dev.duckdns.org';

interface LoginUser {
  userId: string;
  userNm: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: LoginUser;
}

export async function login(
  userId: string,
  passwd: string,
): Promise<LoginResponse> {
  return request<LoginResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        userId,
        passwd,
      }),
    },
  );
}

export const checkUserId =
  async (
    userId: string,
  ): Promise<{
    available: boolean;
  }> => {

    const response =
      await fetch(
        `${BASE_URL}/api/auth/check-user-id?userId=${encodeURIComponent(userId,)}`,
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
    userId: string,
    passwd: string,
    userNm: string,
    hpNo: string,
    addr: string,
    dtlAddr: string,
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
            userId,
            passwd,
            userNm,
            hpNo,
            addr,
            dtlAddr,
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