import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import styles from './src/styles/common';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MainScreen from './src/screens/MainScreen';
import MyInfoScreen from './src/screens/MyInfoScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import BottomNavigation from './src/components/common/BottomNavigation';
import { getBottomMenuList } from './src/api/menuApi';
import type { MenuItem } from './src/api/menuApi';
import { validateSession } from './src/api/authApi';
import {
  getAuthCredentials,
  getRememberedUserId,
} from './src/storage/tokenStorage';

import { MsgProvider } from './src/context/MsgContext';

type AppRoute = 'main' | 'myInfo' | 'settings' | 'community';
type Screen = 'loading' | 'login' | 'signup' | AppRoute;

interface RouteScreenProps {
  onLogout: () => void;
  onBack: () => void;
  onMenuSelect: (item: MenuItem) => void;
}

const routeScreens: Record<
  AppRoute,
  (props: RouteScreenProps) => React.ReactNode
> = {
  main: ({ onLogout }) => <MainScreen onLogout={onLogout} />,
  myInfo: ({ onBack }) => <MyInfoScreen onBack={onBack} />,
  settings: ({ onMenuSelect }) => (
    <SettingsScreen onMenuSelect={onMenuSelect} />
  ),
  community: ({ onBack }) => <CommunityScreen onBack={onBack} />,
};

function isAppRoute(route: string | null): route is AppRoute {
  return (
    route !== null && Object.prototype.hasOwnProperty.call(routeScreens, route)
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('loading');
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
      Alert.alert(
        '메뉴 조회 실패',
        '서버 배포와 메뉴 초기 데이터를 확인해주세요.',
      );
    } finally {
      setMenuLoading(false);
    }
  };

  React.useEffect(() => {
    const restoreSession = async () => {
      try {
        const [rememberedUserId, credentials] = await Promise.all([
          getRememberedUserId(),
          getAuthCredentials(),
        ]);

        if (rememberedUserId && credentials) {
          await validateSession(credentials.password);
          setScreen('main');
          void loadMenus();
          return;
        }
      } catch (error) {
        // 서버 연결 실패 또는 만료된 토큰이면 로그인 화면으로 이동합니다.
        console.info('자동 로그인 세션 확인 실패:', error);
      }

      setScreen('login');
    };

    void restoreSession();
  }, []);

  const handleMenuSelect = (item: MenuItem) => {
    if (isAppRoute(item.programUrl)) {
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
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {screen === 'login' && (
              <LoginScreen
                onSignup={() => setScreen('signup')}
                onLoginSuccess={() => {
                  setScreen('main');
                  void loadMenus();
                }}
              />
            )}

            {screen === 'loading' && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size="small" />
              </View>
            )}

            {screen === 'signup' && (
              <SignupScreen onLogin={() => setScreen('login')} />
            )}

            {isAppRoute(screen) && (
              <View style={{ flex: 1 }}>
                {routeScreens[screen]({
                  onLogout: handleLogout,
                  onBack: () => setScreen('main'),
                  onMenuSelect: handleMenuSelect,
                })}
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
