const AVATAR_COLORS = [
  '#90a9d8',
  '#a58bd4',
  '#d28ca6',
  '#d39b70',
  '#7eafa0',
  '#78a8bd',
  '#b39a67',
  '#8e9dc2',
];

/** Returns a stable fallback avatar color for the same user ID. */
export function getAvatarColor(userId?: string | null): string {
  if (!userId) return AVATAR_COLORS[0];

  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) | 0;
  }

  return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length];
}
