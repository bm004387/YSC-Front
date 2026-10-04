import React, {useState} from 'react';

import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import styles from '../styles/common';

import {
  signup,
  checkUserId,
} from '../api/authApi';

interface SignupScreenProps {
  onLogin: () => void;
}

function SignupScreen({
  onLogin,
}: SignupScreenProps) {

  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [passwd, setPasswd] = useState('');
  const [passwdConfirm, setPasswdConfirm] = useState('');

  // 주소
  const [address, setAddress] = useState('');

  // 아이디 중복체크 여부
  const [isUserIdChecked, setIsUserIdChecked] =
    useState(false);

  // 아이디 사용 가능 여부
  const [isUserIdAvailable, setIsUserIdAvailable] =
    useState(false);

  const [error, setError] = useState('');


  /**
   * 회원가입 버튼 활성화 여부
   *
   * 모든 조건을 만족해야 true
   */
  const isSignupEnabled =
    userId.trim().length > 0 &&
    isUserIdChecked &&
    isUserIdAvailable &&
    userName.trim().length > 0 &&
    passwd.length > 0 &&
    passwdConfirm.length > 0 &&
    passwd === passwdConfirm;


  /**
   * 아이디 중복체크
   */
  const handleCheckUserId = async () => {

  setError('');

  if (!userId.trim()) {

    Alert.alert(
      '알림',
      '아이디를 입력해주세요.',
    );

    return;
  }

  try {

    const response = await checkUserId(
      userId.trim(),
    );

    setIsUserIdChecked(true);
    setIsUserIdAvailable(
      response.available,
    );

  } catch (error) {

    setIsUserIdChecked(false);
    setIsUserIdAvailable(false);

    Alert.alert(
      '오류',
      error instanceof Error
        ? error.message
        : '아이디 중복체크에 실패했습니다.',
    );
  }
};


  /**
   * 회원가입
   */
  const handleSignup = async () => {

    setError('');

    /*
     * 버튼은 disabled 처리하지만
     * 혹시 모를 직접 호출에 대비해서
     * 한 번 더 체크한다.
     */
    if (!isSignupEnabled) {
      return;
    }

    try {

      await signup(
        userId.trim(),
        passwd,
        userName.trim(),
      );

      Alert.alert(
        '회원가입 완료',
        '회원가입이 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: onLogin,
          },
        ],
      );

    } catch (error) {

      Alert.alert(
        '회원가입 실패',
        error instanceof Error
          ? error.message
          : '회원가입 중 오류가 발생했습니다.',
      );
    }
  };


  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled">

      <View style={styles.content}>

        {/* 뒤로가기 */}
        <TouchableOpacity
          onPress={onLogin}
          style={styles.backButton}>

          <Text style={styles.backText}>
            ‹ 뒤로
          </Text>

        </TouchableOpacity>


        {/* Title */}
        <Text style={styles.title}>
          회원가입
        </Text>

        <Text style={styles.subtitle}>
          간단한 정보만 입력하고 시작해보세요.
        </Text>


        {/* =================================================
         * 아이디
         * ================================================= */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>
            아이디
            <Text style={styles.required}>
              {' '}*
            </Text>
          </Text>

          <View style={styles.idInputArea}>

            <TextInput
              style={[
                styles.input,
                styles.idInput,
              ]}
              placeholder="아이디를 입력해주세요"
              placeholderTextColor="#A0A0A0"
              value={userId}
              onChangeText={text => {

                setUserId(text);

                // 아이디가 변경되면
                // 기존 중복체크 결과 무효화
                setIsUserIdChecked(false);
                setIsUserIdAvailable(false);

              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleCheckUserId}>

              <Text style={styles.checkButtonText}>
                중복체크
              </Text>

            </TouchableOpacity>

          </View>

          {isUserIdChecked && (
            <Text
              style={
                isUserIdAvailable
                  ? styles.availableText
                  : styles.errorText
              }>

              {isUserIdAvailable
                ? '사용 가능한 아이디입니다.'
                : '이미 사용 중인 아이디입니다.'}

            </Text>
          )}

        </View>


        {/* =================================================
         * 이름
         * ================================================= */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>
            이름
            <Text style={styles.required}>
              {' '}*
            </Text>
          </Text>

          <TextInput
            style={styles.input}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#A0A0A0"
            value={userName}
            onChangeText={setUserName}
          />

        </View>


        {/* =================================================
         * 비밀번호
         * ================================================= */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>
            비밀번호
            <Text style={styles.required}>
              {' '}*
            </Text>
          </Text>

          <TextInput
            style={styles.input}
            placeholder="8자 이상 입력해주세요"
            placeholderTextColor="#A0A0A0"
            value={passwd}
            onChangeText={setPasswd}
            secureTextEntry
          />

        </View>


        {/* =================================================
         * 비밀번호 확인
         * ================================================= */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>
            비밀번호 확인
            <Text style={styles.required}>
              {' '}*
            </Text>
          </Text>

          <TextInput
            style={[
              styles.input,
              passwdConfirm.length > 0 &&
              passwd !== passwdConfirm
                ? styles.inputError
                : null,
            ]}
            placeholder="비밀번호를 다시 입력해주세요"
            placeholderTextColor="#A0A0A0"
            value={passwdConfirm}
            onChangeText={setPasswdConfirm}
            secureTextEntry
          />

          {passwdConfirm.length > 0 &&
          passwd !== passwdConfirm ? (
            <Text style={styles.errorText}>
              비밀번호가 일치하지 않습니다.
            </Text>
          ) : null}

        </View>


        {/* =================================================
         * 주소
         * ================================================= */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>
            주소
          </Text>

          <View style={styles.addressInputArea}>

            <TextInput
              style={[
                styles.input,
                styles.addressInput,
              ]}
              placeholder="주소를 입력해주세요"
              placeholderTextColor="#A0A0A0"
              value={address}
              onChangeText={setAddress}
            />

            <TouchableOpacity
              style={styles.addressButton}
              onPress={() => {

                /*
                 * TODO:
                 * 추후 카카오 주소 API 연결
                 */

                Alert.alert(
                  '알림',
                  '추후 주소 검색 API가 연결될 예정입니다.',
                );

              }}>

              <Text style={styles.addressButtonText}>
                주소 검색
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* 에러 메시지 */}
        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}


        {/* =================================================
         * 회원가입 버튼
         * ================================================= */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isSignupEnabled
              ? styles.disabledButton
              : null,
          ]}
          onPress={handleSignup}
          disabled={!isSignupEnabled}>

          <Text
            style={[
              styles.primaryButtonText,
              !isSignupEnabled
                ? styles.disabledButtonText
                : null,
            ]}>

            회원가입

          </Text>

        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

export default SignupScreen;