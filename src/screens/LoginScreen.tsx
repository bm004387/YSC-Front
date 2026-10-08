import React, {useEffect, useState} from 'react';
import {Alert, View, Text, TextInput, TouchableOpacity, ScrollView} from 'react-native';

import * as Keychain from 'react-native-keychain';

import styles from '../styles/common';
import {login} from '../api/authApi';
import {getMsgList} from '../api/msgApi';
import {getMsg} from '../utils/msgUtil';

interface LoginScreenProps {
  onSignup: () => void;
  onLoginSuccess: () => void;
}

function LoginScreen({
  onSignup,
  onLoginSuccess,
}: LoginScreenProps) {

  const [usrId, setUsrId] = useState('');
  const [pwd, setPwd] = useState('');

  const [messages, setMessages] = useState<Record<string, string>>({});
  const [usrIdError, setUsrIdError] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  /**
   * 전체 메시지 조회
   */
  const loadMessages = async () => {

    try {

      const result = await getMsgList();
      setMessages(result);
    } catch (error) {
      console.error('메시지 조회 실패:', error);
    }
  };

  /**
   * 로그인
   */
  const handleLogin = async () => {

    let isValid = true;

    setUsrIdError('');
    setPwdError('');

    // 아이디 검사
    if (!usrId.trim()) {
      // 아이디를 입력해주세요
      setUsrIdError(getMsg(messages, 'COMMON', '001'));
      isValid = false;
    }

    // 비밀번호 검사
    if (!pwd.trim()) {
      // 비밀번호를 입력해주세요
      setPwdError(getMsg(messages, 'COMMON', '002'));
      isValid = false;
    }

    // 유효성 검사 실패
    if (!isValid) {
      return;
    }

    try {
      // Spring Boot 로그인 API 호출
      const response = await login(usrId.trim(), pwd);

      // Access Token을 iOS Keychain에 저장
      await Keychain.setGenericPassword(
        response.user.usrId,
        response.accessToken,
        {
          service: 'ysc-auth',
        },
      );

      // console.log(response);

      Alert.alert('로그인 성공', getMsg(messages,'AUTH','003',response.user.usrNm),
        [
          {
            text: '확인',
            onPress: onLoginSuccess,
          },
        ],
      );

    } catch (error) {

      if (error instanceof Error) {
        setPwdError(error.message);
      } else {
        setPwdError(getMsg(messages, 'AUTH', '001'));
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled">

      <View style={styles.content}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>
              M
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          다시 만나서 반가워요
        </Text>

        <Text style={styles.subtitle}>
          계정에 로그인하고 서비스를 시작해보세요.
        </Text>

        {/* 아이디 */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>
            아이디
          </Text>

          <TextInput
            style={[
              styles.input,
              usrIdError
                ? styles.inputError
                : null,
            ]}
            placeholder="아이디를 입력해주세요"
            placeholderTextColor="#A0A0A0"
            value={usrId}
            onChangeText={text => {setUsrId(text);
              if (text.trim()) {
                setUsrIdError('');
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {usrIdError ? (
            <Text style={styles.errorText}>
              {usrIdError}
            </Text>
          ) : null}

        </View>

        {/* 비밀번호 */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>
            비밀번호
          </Text>

          <TextInput
            style={[
              styles.input,
              pwdError
                ? styles.inputError
                : null,
            ]}
            placeholder="비밀번호를 입력해주세요"
            placeholderTextColor="#A0A0A0"
            value={pwd}
            onChangeText={text => {setPwd(text);
              if (text.trim()) {
                setPwdError('');
              }
            }}
            secureTextEntry
          />

          {pwdError ? (
            <Text style={styles.errorText}>
              {pwdError}
            </Text>
          ) : null}
        </View>

        {/* 로그인 버튼 */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}>

          <Text style={styles.primaryButtonText}>
            로그인
          </Text>

        </TouchableOpacity>
        {/* 회원가입 */}
        <View style={styles.bottomArea}>

          <Text style={styles.bottomText}>
            아직 계정이 없으신가요?
          </Text>

          <TouchableOpacity onPress={onSignup}>
            <Text style={styles.linkText}>
              회원가입
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default LoginScreen;