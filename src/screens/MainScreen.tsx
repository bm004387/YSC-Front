import React, {useEffect, useState} from 'react';

import {Alert, Image, Pressable, Text, View} from 'react-native';
import mainStyles from '../styles/main';
import BrandLoader from '../components/common/BrandLoader';
import {logout} from '../api/authApi';
import {getMsgList} from '../api/msgApi';
import {getMsg} from '../utils/msgUtil';
import {clearAuthCredentials, getAuthCredentials} from '../storage/tokenStorage';

interface MainScreenProps {
  onLogout: () => void;
}

function MainScreen({
  onLogout,
}: MainScreenProps) {

  const [messages, setMessages] = useState<Record<string, string>>({});
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLoaderPreview, setShowLoaderPreview] = useState(false);

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
    } finally {
      setMessagesLoading(false);
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

    setLoggingOut(true);
    try {

      const credentials = await getAuthCredentials();

      if (credentials) {
        await logout(credentials.password);
      }

    } catch (error) {
      console.error('로그아웃 실패:',error);

    } finally {
      setLoggingOut(false);
      // 로컬 토큰 삭제
      await clearAuthCredentials();

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
        <Image
          source={require('../../assets/brand/recipe-logo-transparent.png')}
          style={mainStyles.logo}
          resizeMode="contain"
          accessibilityLabel="레시피 로고"
        />
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
          한끼모아에 오신 것을 환영합니다.
        </Text>
        <View style={mainStyles.welcomeCard}>
          <Text style={mainStyles.cardTitle}>
            한끼모아
          </Text>
          <Text style={mainStyles.cardText}>
            메뉴를 선택해서 원하는 서비스를
            이용해보세요.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={mainStyles.loaderPreviewButton}
          onPress={() => setShowLoaderPreview(true)}>
          <Text style={mainStyles.loaderPreviewButtonText}>
            로딩 애니메이션 보기
          </Text>
        </Pressable>
      </View>
      <BrandLoader
        visible={showLoaderPreview || messagesLoading || loggingOut}
        delayMs={showLoaderPreview ? 0 : 500}
        onClose={
          messagesLoading || loggingOut
            ? undefined
            : () => setShowLoaderPreview(false)
        }
      />
    </View>
  );
}

export default MainScreen;
