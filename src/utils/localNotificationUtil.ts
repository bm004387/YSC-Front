import { Platform } from 'react-native';

type NotifeeApi = typeof import('@notifee/react-native').default;

function loadNotifee(): NotifeeApi {
  try {
    return require('@notifee/react-native').default as NotifeeApi;
  } catch (error) {
    console.warn('[LocalNotification] Notifee native module is unavailable:', error);
    throw new Error(
      '로컬 알림 모듈을 찾지 못했습니다. Xcode에서 앱을 다시 빌드해 주세요.',
    );
  }
}

interface LocalMessageNotification {
  userId: string;
  nickname: string;
  message: string;
  profileImageUrl?: string;
}

/** Displays a device-local message notification without using FCM or APNs. */
export async function showLocalMessageNotification({
  userId,
  nickname,
  message,
  profileImageUrl,
}: LocalMessageNotification): Promise<void> {
  const notifee = loadNotifee();
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus === 0) {
    throw new Error('알림 권한이 꺼져 있습니다. iPhone 설정에서 YSC 알림을 허용해 주세요.');
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
