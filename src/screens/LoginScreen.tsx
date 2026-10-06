import React, {useEffect, useState} from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

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

  const [userId, setUserId] = useState('');
  const [passwd, setPasswd] = useState('');

  const [messages, setMessages] =
    useState<Record<string, string>>({});

  const [userIdError, setUserIdError] = useState('');
  const [passwdError, setPasswdError] = useState('');

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

    setUserIdError('');
    setPasswdError('');

    // 아이디 검사
    if (!userId.trim()) {

      setUserIdError(
        getMsg(messages, 'COMMON', '001'),
      );

      isValid = false;
    }

    // 비밀번호 검사
    if (!passwd.trim()) {

      setPasswdError(
        getMsg(messages, 'COMMON', '002'),
      );

      isValid = false;
    }

    // 유효성 검사 실패
    if (!isValid) {
      return;
    }

    try {

      // Spring Boot 로그인 API 호출
      const response = await login(
        userId.trim(),
        passwd,
      );

      // Access Token을 iOS Keychain에 저장
      await Keychain.setGenericPassword(
        response.user.userId,
        response.accessToken,
        {
          service: 'ysc-auth',
        },
      );

      console.log(response);

      Alert.alert(
        '로그인 성공',
        getMsg(
          messages,
          'AUTH',
          '003',
          response.user.userNm,
        ),
        [
          {
            text: '확인',
            onPress: onLoginSuccess,
          },
        ],
      );

    } catch (error) {

      if (error instanceof Error) {

        setPasswdError(error.message);

      } else {

        setPasswdError(
          getMsg(messages, 'AUTH', '001'),
        );
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
              userIdError
                ? styles.inputError
                : null,
            ]}
            placeholder="아이디를 입력해주세요"
            placeholderTextColor="#A0A0A0"
            value={userId}
            onChangeText={text => {

              setUserId(text);

              if (text.trim()) {
                setUserIdError('');
              }

            }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {userIdError ? (
            <Text style={styles.errorText}>
              {userIdError}
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
              passwdError
                ? styles.inputError
                : null,
            ]}
            placeholder="비밀번호를 입력해주세요"
            placeholderTextColor="#A0A0A0"
            value={passwd}
            onChangeText={text => {

              setPasswd(text);

              if (text.trim()) {
                setPasswdError('');
              }

            }}
            secureTextEntry
          />

          {passwdError ? (
            <Text style={styles.errorText}>
              {passwdError}
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

          <TouchableOpacity
            onPress={onSignup}>

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