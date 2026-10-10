import React, {useEffect, useState} from 'react';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import AppInput from '../components/common/AppInput';
import PinPad from '../components/auth/PinPad';
import styles from '../styles/common';
import loginStyles from '../styles/login';
import {loginWithPassword, loginWithPin} from '../api/authApi';
import {getMsgList} from '../api/msgApi';
import {getMsg} from '../utils/msgUtil';
import {getAuthCredentials, getRememberedUserId, saveAuthCredentials, saveRememberedUserId} from '../storage/tokenStorage';

interface LoginScreenProps {
  authMode: 'pin' | 'password';
  initialUsrId?: string;
  onSignup: () => void;
  onUsePassword: () => void;
  onLoginSuccess: (usrId: string, token: string) => void;
}

/** 세션 유지 중에는 PIN 키패드를, 로그아웃 상태에서는 계정 비밀번호 폼을 표시합니다. */
function LoginScreen({authMode, initialUsrId = '', onSignup, onUsePassword, onLoginSuccess}: LoginScreenProps) {
  const [usrId, setUsrId] = useState(initialUsrId);
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsrId(initialUsrId);
    setPin('');
    setPassword('');
    setError('');
  }, [authMode, initialUsrId]);

  useEffect(() => {
    void getRememberedUserId().then(value => {
      if (!initialUsrId && value) setUsrId(value);
    }).catch(e => console.warn('저장된 계정 아이디 조회 실패:', e));
    void getMsgList().then(setMessages).catch(e => console.warn('메시지 조회 실패:', e));
  }, [initialUsrId]);

  const submit = async () => {
    setError('');
    if (!usrId.trim()) {
      setError(getMsg(messages, 'COMMON', '001'));
      return;
    }
    if (authMode === 'pin' && !/^\d{4}$/.test(pin)) {
      setError(getMsg(messages, 'COMMON', '008'));
      return;
    }
    if (authMode === 'password' && !password) {
      setError(getMsg(messages, 'COMMON', '002'));
      return;
    }

    try {
      setLoading(true);
      const current = await getAuthCredentials();
      const sessionToken = current && typeof current !== 'boolean' ? current.password : undefined;
      const response = authMode === 'pin'
        ? await loginWithPin(usrId.trim(), pin, sessionToken)
        : await loginWithPassword(usrId.trim(), password);
      await saveAuthCredentials(response.user.usrId, response.accessToken);
      await saveRememberedUserId(response.user.usrId);
      onLoginSuccess(response.user.usrId, response.accessToken);
    } catch (e) {
      setPin('');
      setError(e instanceof Error ? e.message : getMsg(messages, 'AUTH', '001'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} scrollEnabled={false} bounces={false} alwaysBounceVertical={false} overScrollMode="never">
      <View style={[styles.content, styles.loginContent]}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/brand/ysc-y-transparent.png')} style={styles.loginLogo} resizeMode="contain" accessibilityLabel="YSC 로고" />
        </View>
        <Text style={styles.title}>{authMode === 'pin' ? 'PIN으로 로그인' : '다시 만나서 반가워요'}</Text>
        <Text style={styles.subtitle}>{authMode === 'pin' ? '설정한 숫자 4자리를 입력해주세요.' : '아이디와 비밀번호를 입력해주세요.'}</Text>

        {authMode === 'pin' ? (
          <>
            <Text style={loginStyles.account}>계정  {usrId}</Text>
            <PinPad value={pin} onChange={value => {setPin(value); setError('');}} disabled={loading} />
          </>
        ) : (
          <>
            <AppInput label="아이디" placeholder="아이디를 입력해주세요" value={usrId} onChangeText={setUsrId} autoCapitalize="none" autoCorrect={false} editable={!loading} />
          <AppInput label="비밀번호" placeholder="비밀번호를 입력해주세요" value={password} onChangeText={setPassword} secureTextEntry editable={!loading} />
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={[styles.primaryButton, loading && loginStyles.disabled]} onPress={() => void submit()} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? '확인 중…' : '로그인'}</Text>
        </TouchableOpacity>
        {authMode === 'pin' ? (
          <TouchableOpacity style={loginStyles.alternate} onPress={onUsePassword}>
            <Text style={styles.bottomText}>PIN을 잊으셨나요? 아이디·비밀번호로 로그인</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={loginStyles.alternate} onPress={onSignup}>
            <Text style={styles.bottomText}>아직 계정이 없으신가요? <Text style={styles.linkText}>회원가입</Text></Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

export default LoginScreen;
