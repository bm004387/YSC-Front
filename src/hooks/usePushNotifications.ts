import {useEffect} from 'react';
import {Platform} from 'react-native';
import {getApps} from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import {getAuthCredentials} from '../storage/tokenStorage';
import {registerPushToken} from '../api/pushApi';

type NotifeeApi = typeof import('@notifee/react-native').default;

/** 이전 설치 바이너리에 Notifee 네이티브 모듈이 없더라도 앱 시작을 막지 않습니다. */
function loadNotifee(): NotifeeApi | null {
  try {
    return require('@notifee/react-native').default as NotifeeApi;
  } catch (error) {
    console.warn('Notifee 네이티브 모듈을 사용할 수 없습니다. foreground 알림 표시를 건너뜁니다.', error);
    return null;
  }
}

/** 인증된 세션에서 알림 권한을 요청하고 FCM 토큰을 백엔드에 등록합니다. */
export default function usePushNotifications(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    if (Platform.OS === 'ios') {
      console.info(
        '[Push] iOS 원격 푸시는 Apple Developer Program 및 APNs 설정 후 사용할 수 있습니다. 로컬 알림은 계속 사용할 수 있습니다.',
      );
      return;
    }
    if (getApps().length === 0) {
      console.warn(
        '[Push] Firebase 앱 구성이 없어 푸시 토큰 등록을 건너뜁니다. 플랫폼별 Firebase 설정 파일을 추가해야 합니다.',
      );
      return;
    }
    let active = true;
    const messaging = getMessaging();
    const notifee = loadNotifee();

    const registerCurrentToken = async (token?: string) => {
      const credentials = await getAuthCredentials();
      if (!active || !credentials) return;
      const currentToken = token ?? (await getToken(messaging));
      await registerPushToken(credentials.password, currentToken);
    };

    const initializePush = async () => {
      const status = await requestPermission(messaging);
      if (
        status !== AuthorizationStatus.AUTHORIZED &&
        status !== AuthorizationStatus.PROVISIONAL
      ) {
        return;
      }

      if (Platform.OS === 'android' && notifee) {
        await notifee.createChannel({id: 'default', name: '한끼모아 알림'});
      }
      await registerCurrentToken();
    };

    const unsubscribeToken = onTokenRefresh(messaging, token => {
      void registerCurrentToken(token).catch(error => {
        console.warn('푸시 토큰 갱신 저장 실패:', error);
      });
    });
    const unsubscribeForeground = onMessage(messaging, async message => {
      if (!message.notification || !notifee) return;
      const androidChannelId = Platform.OS === 'android'
        ? await notifee.createChannel({id: 'default', name: '한끼모아 알림'})
        : undefined;
      await notifee.displayNotification({
        title: message.notification.title,
        body: message.notification.body,
        data: message.data,
        android: androidChannelId
          ? {channelId: androidChannelId, pressAction: {id: 'default'}}
          : undefined,
        ios: {sound: 'default'},
      });
    });

    void initializePush().catch(error => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[Push] 푸시 알림 초기화 실패: ${errorMessage}`);
    });

    return () => {
      active = false;
      unsubscribeToken();
      unsubscribeForeground();
    };
  }, [enabled]);
}
