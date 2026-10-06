import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import styles from './src/styles/common';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MainScreen from './src/screens/MainScreen';

import {MsgProvider} from './src/context/MsgContext';

type Screen =
  | 'login'
  | 'signup'
  | 'main';

function App() {
  const [screen, setScreen] =
    useState<Screen>('login');

  return (
    <SafeAreaProvider>
      <MsgProvider>
        <SafeAreaView
          style={styles.safeArea}
          edges={['top', 'bottom']}>

          <KeyboardAvoidingView
            style={styles.container}
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : undefined
            }>

            {screen === 'login' && (
              <LoginScreen
                onSignup={() =>
                  setScreen('signup')
                }
                onLoginSuccess={() =>
                  setScreen('main')
                }
              />
            )}

            {screen === 'signup' && (
              <SignupScreen
                onLogin={() =>
                  setScreen('login')
                }
              />
            )}

            {screen === 'main' && (
              <MainScreen />
            )}

          </KeyboardAvoidingView>
        </SafeAreaView>
      </MsgProvider>
    </SafeAreaProvider>
  );
}

export default App;