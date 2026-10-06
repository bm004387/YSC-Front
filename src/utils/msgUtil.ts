export const getMsg = (
  messages: Record<string, string>,
  menuId: string,
  msgCd: string,
  ...args: string[]
): string => {

  const key = `${menuId}:${msgCd}`;

  let message = messages[key];

  if (!message) {
    return `${menuId}_${msgCd}`;
  }

  args.forEach((arg, index) => {
    message = message.replace(
      `{${index}}`,
      arg,
    );
  });

  return message;
};