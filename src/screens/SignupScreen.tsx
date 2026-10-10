import React, {useState} from 'react';

import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import IdCheckInput from '../components/auth/IdCheckInput';
import SmsVerifyInput from '../components/auth/SmsVerifyInput';
import AddressInput from '../components/address/AddressInput';
import commonStyles from '../styles/common';
import useMsg from '../hooks/useMsg';
import {checkUsrId, signup} from '../api/authApi';
import {sendSms, verifySms} from '../api/msgApi';

interface SignupScreenProps {
  onLogin: () => void;
  onSignupComplete: (usrId: string, pwd: string) => void;
}

const SignupScreen = ({onLogin, onSignupComplete}: SignupScreenProps) => {
  const {getMsg} = useMsg();

  /*
   * 회원정보
   */
  const [usrId,setUsrId] = useState('');
  const [usrNm,setUsrNm] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [hpNo, setHpNo] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [adr, setAddr] = useState('');
  const [dtlAddr, setDtlAddr] = useState('');

  /*
   * 아이디 중복확인
   */
  const [isUsrIdChecked, setIsUsrIdChecked] = useState(false);
  const [isUsrIdAvailable, setIsUsrIdAvailable] = useState(false);
  const [isSmsSending, setIsSmsSending] = useState(false);
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [isHpNoVerified, setIsHpNoVerified] = useState(false);
  const [smsError, setSmsError] = useState('');

  const handleUsrIdChange = (value: string,) => {
    setUsrId(value);
    setIsUsrIdChecked(false);
    setIsUsrIdAvailable(false);
  };

  /*
   * 아이디 중복확인
   */
  const handleUsrIdCheck = async () => {
      if (!usrId.trim()) {
        Alert.alert('알림', getMsg('COMMON','001'));
        return;
      }
      try {
        const result = await checkUsrId(usrId.trim());
        setIsUsrIdChecked(true);
        setIsUsrIdAvailable(result.available);
      } catch (e: any) {
        Alert.alert('알림',e?.message ?? getMsg('SIGNUP','004'),
        );
      }
    };

  /*
   * 휴대폰 번호 변경
   */
  const handleHpNoChange = (value: string) => {
    const normalized = value.replace(/[^0-9]/g, '');
    setHpNo(normalized);
    setVerificationCode('');
    setIsHpNoVerified(false);
    setSmsError('');
  };

  /*
   * 인증번호 발송
   *
   * return true
   *   -> 실제 발송 성공
   *
   * return false
   *   -> 발송 실패
   */
  const handleSmsSend = async (): Promise<boolean> => {
    setSmsError('');
    if (!hpNo.trim()) {
      setSmsError(getMsg('COMMON','004'));
      return false;
    }

    if (!/^01[0-9]{8,9}$/.test(hpNo)) {
      setSmsError(getMsg('COMMON','005'));
      return false;
    }

    try {
      setIsSmsSending(true);
      const result = await sendSms(hpNo);

      if (!result.success) {
        setSmsError(result.message);
        return false;
      }
      setIsSmsSent(true);

      Alert.alert('알림', result.message);
      return true;

    } catch (e: any) {
      setSmsError(e?.message ?? getMsg('SMS', '005'));
      return false;

    } finally {
      setIsSmsSending(false);
    }
  };

  /*
   * 인증번호 확인
   */
  const handleSmsVerify = async (code: string) => {
      setSmsError('');

      if (!verificationCode.trim()) {
        setSmsError(getMsg('COMMON', '006'));
        return;
      }

      try {
        /*
         * 전화번호 + 인증번호
         * 둘 다 백엔드로 전달
         */
        const result = await verifySms(hpNo, code);

        if (!result.success) {
          setIsHpNoVerified(false);
          setSmsError(result.message);
          return;
        }

        /*
         * 인증 성공
         */
        setIsHpNoVerified(true);
        setSmsError('');

      } catch (e: any) {
        setIsHpNoVerified(false);
        setSmsError(e?.message ?? getMsg('SMS', '003'));
      }
    };

  /*
   * 비밀번호 확인 오류
   */
  const pwdError = pwdConfirm.length > 0 && pwd !== pwdConfirm
      ? getMsg('COMMON','003') : undefined;

  /*
   * 회원가입 버튼 활성화
   */
  const isSignupEnabled = usrId.trim().length > 0 &&
                          isUsrIdChecked &&
                          isUsrIdAvailable &&
                          usrNm.trim().length > 0 &&
                          pwd.length > 0 &&
                          pwdConfirm.length > 0 &&
                          pwd === pwdConfirm &&
                          hpNo.trim().length > 0 &&
                          isHpNoVerified &&
                          adr.trim().length > 0;

  /*
   * 회원가입
   */
  const handleSignup = async () => {
      if (!isSignupEnabled) {
        return;
      }

      try {
        await signup(
                  usrId.trim(),
                  pwd,
                  usrNm.trim(),
                  hpNo.trim(),
                  adr.trim(),
                  dtlAddr.trim(),
                );

        onSignupComplete(usrId.trim(), pwd);

      } catch (e: any) {
        Alert.alert('알림', e?.message ?? getMsg('SIGNUP', '004'));
      }
    };

  return (
    <View
      style={commonStyles.safeArea}>

      <ScrollView
        contentContainerStyle={commonStyles.content}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={onLogin}
          activeOpacity={0.7}>
          <Text style={commonStyles.backText}>
            ‹ 뒤로
          </Text>
        </TouchableOpacity>
        <Text
          style={commonStyles.title}>
          회원가입
        </Text>
        <Text
          style={commonStyles.subtitle}>
          YSC 서비스 이용을 위해
          회원정보를 입력해주세요.
        </Text>

        {/* 아이디 */}
        <IdCheckInput
          value={usrId}
          checked={isUsrIdChecked}
          available={isUsrIdAvailable}
          onChangeText={handleUsrIdChange}
          onCheck={handleUsrIdCheck}
          availableMsg={getMsg('SIGNUP', '002')}
          unavailableMsg={getMsg('SIGNUP', '001')}
        />

        {/* 이름 */}
        <AppInput
          label="이름"
          required
          placeholder="이름을 입력해주세요"
          value={usrNm}
          onChangeText={setUsrNm}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* 비밀번호 */}
        <AppInput
          label="비밀번호"
          required
          placeholder="비밀번호를 입력해주세요"
          value={pwd}
          onChangeText={setPwd}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
        />

        {/* 비밀번호 확인 */}
        <AppInput
          label="비밀번호 확인"
          required
          placeholder="비밀번호를 다시 입력해주세요"
          value={pwdConfirm}
          onChangeText={setPwdConfirm}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          error={pwdError}
        />

        {/* 휴대폰 + SMS 인증 */}
        <SmsVerifyInput
          hpNo={hpNo}
          verificationCode={verificationCode}
          isSending={isSmsSending}
          isSent={isSmsSent}
          isVerified={isHpNoVerified}
          verifiedMsg={getMsg('SMS', '004')}
          errorMsg={smsError}
          expiredMsg={getMsg('SMS', '002')}
          onHpNoChange={handleHpNoChange}
          onVerificationCodeChange={value =>
            setVerificationCode(
              value.replace(/[^0-9]/g, ''),
            )
          }
          onSend={handleSmsSend}
          onVerify={handleSmsVerify}
        />

        {/* 주소 */}
        <AddressInput
          value={adr}
          detailValue={dtlAddr}
          onChangeText={setAddr}
          onDetailChangeText={setDtlAddr}
        />

        {/* 회원가입 */}
        <AppButton
          title="회원가입"
          onPress={handleSignup}
          disabled={!isSignupEnabled}
        />
      </ScrollView>

    </View>
  );
};

export default SignupScreen;
