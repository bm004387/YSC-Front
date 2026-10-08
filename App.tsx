import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import styles from './src/styles/common';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MainScreen from './src/screens/MainScreen';
import MyInfoScreen from './src/screens/MyInfoScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BottomNavigation from './src/components/common/BottomNavigation';
import {getBottomMenuList} from './src/api/menuApi';
import type {MenuItem} from './src/api/menuApi';

import {MsgProvider} from './src/context/MsgContext';

type Screen = 'login' | 'signup' | 'main' | 'myInfo' | 'settings';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const loadMenus = async () => {
    setMenuLoading(true);
    setMenuError(null);
    try {
      const items = await getBottomMenuList();
      setMenuItems(items);
      if (items.length === 0) {
        setMenuError('등록된 메뉴가 없습니다.');
      }
    } catch (error) {
      console.error('하단 메뉴 조회 실패:', error);
      setMenuItems([]);
      setMenuError('메뉴 조회 실패.');
      Alert.alert('메뉴 조회 실패', '서버 배포와 메뉴 초기 데이터를 확인해주세요.');
    } finally {
      setMenuLoading(false);
    }
  };

  const handleMenuSelect = (item: MenuItem) => {
    if (item.programUrl === 'main' || item.programUrl === 'myInfo' || item.programUrl === 'settings') {
      setScreen(item.programUrl);
    }
  };

  const handleLogout = () => {
    setMenuItems([]);
    setScreen('login');
  };

  return (
    <SafeAreaProvider>
      <MsgProvider>
        <SafeAreaView
          style={styles.safeArea}
          edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding': undefined}>
            {screen === 'login' && (
              <LoginScreen
                onSignup={() => setScreen('signup')}
                onLoginSuccess={() => {
                  setScreen('main');
                  void loadMenus();
                }}
              />
            )}

            {screen === 'signup' && (
              <SignupScreen
                onLogin={() => setScreen('login')}
              />
            )}

            {(screen === 'main' || screen === 'myInfo' || screen === 'settings') && (
              <View style={{flex: 1}}>
                {screen === 'main' && <MainScreen onLogout={handleLogout} />}
                {screen === 'myInfo' && <MyInfoScreen onBack={() => setScreen('main')} />}
                {screen === 'settings' && <SettingsScreen />}
                <BottomNavigation
                  items={menuItems}
                  activeRoute={screen}
                  loading={menuLoading}
                  error={menuError}
                  onSelect={handleMenuSelect}
                  onRetry={() => void loadMenus()}
                />
              </View>
            )}

          </KeyboardAvoidingView>
        </SafeAreaView>
      </MsgProvider>
    </SafeAreaProvider>
  );
}

export default App;
