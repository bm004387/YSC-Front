import React, {useEffect, useState} from 'react';

import * as Keychain from 'react-native-keychain';

import {Alert, Pressable, Text, View} from 'react-native';
import mainStyles from '../styles/main';
import {logout} from '../api/authApi';
import {getMsgList} from '../api/msgApi';
import {getMsg} from '../utils/msgUtil';

interface MainScreenProps {
  onLogout: () => void;
}

function MainScreen({
  onLogout,
}: MainScreenProps) {

  const [messages, setMessages] = useState<Record<string, string>>({});

  /**
   * 메시지 조회
   */
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {

    try {
      const result = await getMsgList();
      setMessages(result);
    } catch (error) {
      console.error('메시지 조회 실패:',error);
    }
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {

    Alert.alert('로그아웃', getMsg(messages, 'AUTH', '004'),
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: processLogout,
        },
      ],
    );
  };

  /**
   * 실제 로그아웃
   */
  const processLogout = async () => {

    try {

      const credentials = await Keychain.getGenericPassword({service: 'ysc-auth'});

      if (credentials) {
        await logout(credentials.password);
      }

    } catch (error) {
      console.error('로그아웃 실패:',error);

    } finally {
      // 로컬 토큰 삭제
      await Keychain.resetGenericPassword({service: 'ysc-auth'});

      // 로그아웃 완료 메시지
      Alert.alert('로그아웃', getMsg(messages, 'AUTH', '005'),
        [
          {
            text: '확인',
            onPress: onLogout,
          },
        ],
      );
    }
  };

  return (
    <View style={mainStyles.container}>

      {/* Header */}
      <View style={mainStyles.header}>
        <Text style={mainStyles.logo}>
          YSC
        </Text>
        <Pressable style={mainStyles.menuButton} onPress={handleLogout}>
          <Text style={mainStyles.menuButtonText}>
            로그아웃
          </Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={mainStyles.content}>
        <Text style={mainStyles.title}>
          안녕하세요 👋
        </Text>
        <Text style={mainStyles.subtitle}>
          YSC 서비스에 오신 것을 환영합니다.
        </Text>
        <View style={mainStyles.welcomeCard}>
          <Text style={mainStyles.cardTitle}>
            YSC 서비스
          </Text>
          <Text style={mainStyles.cardText}>
            메뉴를 선택해서 원하는 서비스를
            이용해보세요.
          </Text>
        </View>
      </View>
    </View>
  );
}

export default MainScreen;
