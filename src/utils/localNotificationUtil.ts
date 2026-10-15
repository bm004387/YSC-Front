import { Platform } from 'react-native';

type NotifeeApi = typeof import('@notifee/react-native').default;

function loadNotifee(): NotifeeApi {
  try {
    return require('@notifee/react-native').default as NotifeeApi;
  } catch (error) {
    console.warn('[LocalNotification] Notifee native module is unavailable:', error);
    throw new Error('NOTIFEE_UNAVAILABLE');
  }
}

interface LocalMessageNotification {
  userId: string;
  nickname: string;
  message: string;
  profileImageUrl?: string;
  errors: {
    nativeModuleUnavailable: string;
    permissionDisabled: string;
  };
}

/** Displays a device-local message notification without using FCM or APNs. */
export async function showLocalMessageNotification({
  userId,
  nickname,
  message,
  profileImageUrl,
  errors,
}: LocalMessageNotification): Promise<void> {
  let notifee: NotifeeApi;
  try {
    notifee = loadNotifee();
  } catch {
    throw new Error(errors.nativeModuleUnavailable);
  }
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus === 0) {
    throw new Error(errors.permissionDisabled);
  }

  const androidChannelId =
    Platform.OS === 'android'
      ? await notifee.createChannel({
          id: 'message-test',
          name: '메시지 알림 테스트',
          importance: 4,
        })
      : undefined;

  await notifee.displayNotification({
    id: `message-test-${userId}`,
    title: nickname,
    body: message,
    android: androidChannelId
      ? {
          channelId: androidChannelId,
          pressAction: { id: 'default' },
          smallIcon: 'ic_launcher',
        }
      : undefined,
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        banner: true,
        list: true,
        sound: true,
      },
      communicationInfo: {
        conversationId: userId,
        body: message,
        sender: {
          id: userId,
          displayName: nickname,
          ...(profileImageUrl ? { avatar: profileImageUrl } : {}),
        },
      },
    },
  });
}
