export const formatMsg = (
  message: string,
  ...args: string[]
): string => {

  if (!message) {
    return '';
  }

  return message.replace(
    /\{(\d+)\}/g,
    (_, index: string) => {
      return args[Number(index)] ?? '';
    },
  );
};

export const getMsg = (
  messages: Record<string, string>,
  msgCd: string,
  ...args: string[]
): string => {

  const message = messages[msgCd] ?? '';

  return formatMsg(message, ...args);
};