import React, { useCallback, useRef, useState } from 'react';
import {getMessaging, getToken} from '@react-native-firebase/messaging';
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import styles from './src/styles/common';

import LoginScreen from './src/screens/LoginScreen';
import AccountRecoveryScreen from './src/screens/AccountRecoveryScreen';
import SignupScreen from './src/screens/SignupScreen';
import PinSetupScreen from './src/screens/PinSetupScreen';
import MainScreen from './src/screens/MainScreen';
import MyInfoScreen from './src/screens/MyInfoScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import BottomNavigation from './src/components/common/BottomNavigation';
import { getBottomMenuList } from './src/api/menuApi';
import { loginWithPin, logout, validateSession } from './src/api/authApi';
import type { MenuItem } from './src/api/menuApi';
import {
  clearAuthCredentials,
  clearBackgroundTimestamp,
  clearRememberedUserId,
  getBackgroundTimestamp,
  getAuthCredentials,
  saveAuthCredentials,
  saveBackgroundTimestamp,
} from './src/storage/tokenStorage';
import { getRememberedUserId } from './src/storage/tokenStorage';
import { unregisterPushToken } from './src/api/pushApi';
import usePushNotifications from './src/hooks/usePushNotifications';

import { MsgProvider } from './src/context/MsgContext';

type AppRoute = 'main' | 'myInfo' | 'settings' | 'community';
type Screen = 'loading' | 'locked' | 'login' | 'signup' | 'recovery' | 'pinSetup' | 'pinConfirm' | AppRoute;

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
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('password');
  const [savedUsrId, setSavedUsrId] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [pinSetupCredentials, setPinSetupCredentials] = useState<{
    usrId: string;
    password: string;
  } | null>(null);
  const [firstPin, setFirstPin] = useState('');
  const screenRef = useRef<Screen>('loading');
  const backgroundSaveRef = useRef<Promise<unknown> | null>(null);
  const protectedScreenRef = useRef<AppRoute>('main');
  const initialisedRef = useRef(false);

  usePushNotifications(isAppRoute(screen));

  React.useLayoutEffect(() => {
    screenRef.current = screen;
  }, [screen]);

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
    let previousAppState = AppState.currentState;
    let disposed = false;
    const restoreOnLaunch = async () => {
      try {
        const [credentials, rememberedId, backgroundAt] = await Promise.all([
          getAuthCredentials(), getRememberedUserId(), getBackgroundTimestamp(),
        ]);
        if (disposed) return;
        if (!credentials) {
          setSavedUsrId(rememberedId ?? '');
          setAuthMode('password');
          setScreen('login');
          return;
        }
        setSavedUsrId(credentials.username);
          const launchElapsed = backgroundAt === null ? Infinity : Date.now() - backgroundAt;
          if (launchElapsed >= 0 && launchElapsed < 10_000) {
          try {
            await validateSession(credentials.password);
            if (disposed) return;
            setAuthMode('pin');
            setScreen('main');
            void loadMenus();
          } catch {
            setAuthMode('pin');
            setScreen('login');
          }
        } else {
          setAuthMode('pin');
          setScreen('login');
        }
      } catch (error) {
        console.warn('로그인 상태 복원 실패:', error);
        setAuthMode('password');
        setScreen('login');
      } finally {
        initialisedRef.current = true;
      }
    };
    void restoreOnLaunch();

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      const leaving = nextAppState === 'background' || nextAppState === 'inactive';
      const returning = (previousAppState === 'background' || previousAppState === 'inactive') && nextAppState === 'active';
      previousAppState = nextAppState;

      if (leaving && isAppRoute(screenRef.current)) {
        protectedScreenRef.current = screenRef.current;
        backgroundSaveRef.current = saveBackgroundTimestamp(Date.now());
        setScreen('locked');
      } else if (returning && initialisedRef.current && screenRef.current === 'locked') {
        void (async () => {
          await backgroundSaveRef.current;
          const [credentials, backgroundAt] = await Promise.all([getAuthCredentials(), getBackgroundTimestamp()]);
          const elapsed = backgroundAt === null ? Infinity : Date.now() - backgroundAt;
          if (!credentials) {
            setAuthMode('password');
            setScreen('login');
            return;
          }
          setSavedUsrId(credentials.username);
          if (elapsed >= 0 && elapsed < 10_000) {
            try {
              await validateSession(credentials.password);
              setScreen(protectedScreenRef.current);
              return;
            } catch {
              // 만료 세션은 PIN 재인증 화면으로 보냅니다.
            }
          }
          setAuthMode('pin');
          setScreen('login');
        })();
      }
    });

    return () => {
      disposed = true;
      appStateSubscription.remove();
    };
  }, []);

  const handleMenuSelect = (item: MenuItem) => {
    if (isAppRoute(item.programUrl)) {
      setScreen(item.programUrl);
    }
  };

  const handleLogout = useCallback(() => {
    void (async () => {
      const credentials = await getAuthCredentials();
      if (credentials) {
        try {
          const pushToken = await getToken(getMessaging());
          await unregisterPushToken(credentials.password, pushToken);
        } catch (error) {
          console.warn('푸시 토큰 해제 실패:', error);
        }
        await logout(credentials.password).catch(error => {
          console.warn('서버 세션 종료 실패:', error);
        });
      }
      await Promise.all([clearAuthCredentials(), clearRememberedUserId(), clearBackgroundTimestamp()]);
    })();
    setSavedUsrId('');
    setAuthMode('password');
    setMenuItems([]);
    setScreen('login');
  }, []);

  const handleLoginSuccess = useCallback(() => {
    void clearBackgroundTimestamp();
    setAuthMode('pin');
    setScreen('main');
    void loadMenus();
  }, []);

  const completePinSetup = async (pin: string) => {
    if (!pinSetupCredentials) return;
    try {
      const response = await loginWithPin(pinSetupCredentials.usrId, pin);
      await saveAuthCredentials(response.user.usrId, response.accessToken);
      await clearBackgroundTimestamp();
      setSavedUsrId(response.user.usrId);
      setPinSetupCredentials(null);
      setFirstPin('');
      handleLoginSuccess();
    } catch (error) {
      setSavedUsrId(pinSetupCredentials.usrId);
      setAuthMode('pin');
      setPinSetupCredentials(null);
      setFirstPin('');
      setScreen('login');
      Alert.alert('로그인 실패', error instanceof Error ? error.message : 'PIN 설정은 완료되었지만 로그인하지 못했습니다. PIN으로 다시 로그인해주세요.');
    }
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
                authMode={authMode}
                initialUsrId={savedUsrId}
                onSignup={() => setScreen('signup')}
                onUsePassword={() => setAuthMode('password')}
                onRecoverAccount={() => setScreen('recovery')}
                onLoginSuccess={usrId => {
                  setSavedUsrId(usrId);
                  handleLoginSuccess();
                }}
              />
            )}

            {screen === 'signup' && (
              <SignupScreen
                onLogin={() => setScreen('login')}
                onSignupComplete={(usrId, password) => {
                  setPinSetupCredentials({usrId, password});
                  setFirstPin('');
                  setScreen('pinSetup');
                }}
              />
            )}

            {screen === 'recovery' && (
              <AccountRecoveryScreen onBack={() => setScreen('login')} />
            )}

            {(screen === 'pinSetup' || screen === 'pinConfirm') && pinSetupCredentials && (
              <PinSetupScreen
                key={screen}
                usrId={pinSetupCredentials.usrId}
                password={pinSetupCredentials.password}
                confirmation={screen === 'pinConfirm'}
                firstPin={firstPin}
                onNext={pin => {setFirstPin(pin); setScreen('pinConfirm');}}
                onComplete={pin => {void completePinSetup(pin);}}
              />
            )}

            {(screen === 'loading' || screen === 'locked') && <View style={styles.container} />}

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
