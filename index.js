/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

if (getApps().length > 0) {
  setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
    console.log('백그라운드 푸시 알림 수신:', remoteMessage.messageId);
  });
}

AppRegistry.registerComponent(appName, () => App);
