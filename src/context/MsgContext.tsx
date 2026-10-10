import React, { createContext, useEffect, useMemo, useState } from 'react';

import { getMsgList } from '../api/msgApi';

interface MsgContextValue {
  getMsg: (
    menuId: string,
    msgCd: string,
    ...args: Array<string | number>
  ) => string;
}

export const MsgContext = createContext<MsgContextValue | null>(null);

interface MsgProviderProps {
  children: React.ReactNode;
}

export const MsgProvider = ({ children }: MsgProviderProps) => {
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await getMsgList();

        setMessages(data);
      } catch (e) {
        console.error('메시지 조회 실패:', e);
      }
    };

    loadMessages();
  }, []);

  const getMsg = (
    menuId: string,
    msgCd: string,
    ...args: Array<string | number>
  ): string => {
    const key = `${menuId}:${msgCd}`;

    const message = messages[key];

    if (!message) {
      console.warn(`메시지를 찾을 수 없습니다: ${key}`);

      return key;
    }

    return message.replace(/\{(\d+)\}/g, (placeholder, index) =>
      args[Number(index)] === undefined
        ? placeholder
        : String(args[Number(index)]),
    );
  };

  const value = useMemo(
    () => ({
      getMsg,
    }),
    [messages],
  );

  return <MsgContext.Provider value={value}>{children}</MsgContext.Provider>;
};
