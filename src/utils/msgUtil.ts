let cachedMessages: Record<string, string> = {};

/** Stores messages loaded from the API for use by non-React helpers. */
export const setMsgCache = (messages: Record<string, string>): void => {
  cachedMessages = messages;
};

/** Resolves database messages outside React components. */
export const getCachedMsg = (
  menuId: string,
  msgCd: string,
  ...args: Array<string | number>
): string => getMsg(cachedMessages, menuId, msgCd, ...args);

export const getMsg = (
  messages: Record<string, string>,
  menuId: string,
  msgCd: string,
  ...args: Array<string | number>
): string => {

  const key = `${menuId}:${msgCd}`;

  let message = messages[key];

  if (!message) {
    return `${menuId}_${msgCd}`;
  }

  message = message.replace(/\{(\d+)\}/g, (placeholder, index) =>
    args[Number(index)] === undefined
      ? placeholder
      : String(args[Number(index)]),
  );

  return message;
};
