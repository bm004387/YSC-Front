import React, {useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import AppInput from '../components/common/AppInput';
import SmsVerifyInput from '../components/auth/SmsVerifyInput';
import {findAccountId, resetPassword, sendIdRecoveryCode, sendPasswordRecoveryCode, verifyPasswordRecoveryCode} from '../api/accountRecoveryApi';
import commonStyles from '../styles/common';
import recoveryStyles from '../styles/accountRecovery';
import useMsg from '../hooks/useMsg';

interface AccountRecoveryScreenProps {
  onBack: () => void;
}

type RecoveryTab = 'id' | 'password';

/** 휴대폰 인증으로 아이디를 찾거나 비밀번호를 재설정합니다. */
function AccountRecoveryScreen({onBack}: AccountRecoveryScreenProps) {
  const {getMsg} = useMsg();
  const [tab, setTab] = useState<RecoveryTab>('id');
  const [usrId, setUsrId] = useState('');
  const [hpNo, setHpNo] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [foundUsrId, setFoundUsrId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [completed, setCompleted] = useState(false);
  const [busy, setBusy] = useState(false);

  const changeTab = (nextTab: RecoveryTab) => {
    setTab(nextTab);
    setUsrId('');
    setHpNo('');
    setCode('');
    setIsSent(false);
    setIsVerified(false);
    setVerifiedMessage('');
    setErrorMessage('');
    setFoundUsrId('');
    setNewPassword('');
    setConfirmPassword('');
    setCompleted(false);
  };

  const sendCode = async (): Promise<boolean> => {
    setErrorMessage('');
    if (tab === 'password' && !usrId.trim()) {
      setErrorMessage(getMsg('COMMON', '001'));
      return false;
    }
    try {
      setIsSending(true);
      const result = tab === 'id'
        ? await sendIdRecoveryCode(hpNo)
        : await sendPasswordRecoveryCode(usrId.trim(), hpNo);
      if (!result.success) {
        setErrorMessage(result.message);
        return false;
      }
      setIsSent(true);
      setCode('');
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : getMsg('SMS', '005'));
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (value: string) => {
    setErrorMessage('');
    setCode(value);
    try {
      setBusy(true);
      if (tab === 'id') {
        const result = await findAccountId(hpNo, value);
        if (!result.success || !result.usrId) {
          setErrorMessage(result.message);
          return;
        }
        setFoundUsrId(result.usrId);
        setVerifiedMessage(result.message);
      } else {
        const result = await verifyPasswordRecoveryCode(usrId.trim(), hpNo, value);
        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }
        setVerifiedMessage(result.message);
      }
      setIsVerified(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : getMsg('SMS', '003'));
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async () => {
    setErrorMessage('');
    if (newPassword.length < 8) {
      setErrorMessage(getMsg('MYINFO', '002'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(getMsg('COMMON', '003'));
      return;
    }
    try {
      setBusy(true);
      const result = await resetPassword(usrId.trim(), hpNo, newPassword, confirmPassword);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setVerifiedMessage(result.message);
      setCompleted(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : getMsg('MYINFO', '008'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={commonStyles.safeArea}>
      <View style={recoveryStyles.header}>
        <TouchableOpacity onPress={onBack} style={recoveryStyles.backButton}>
          <Text style={recoveryStyles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={recoveryStyles.headerTitle}>아이디·비밀번호 찾기</Text>
      </View>
      <ScrollView contentContainerStyle={recoveryStyles.content} keyboardShouldPersistTaps="handled">
        <View style={recoveryStyles.tabs}>
          <TouchableOpacity style={[recoveryStyles.tab, tab === 'id' && recoveryStyles.activeTab]} onPress={() => changeTab('id')}>
            <Text style={[recoveryStyles.tabText, tab === 'id' && recoveryStyles.activeTabText]}>아이디 찾기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[recoveryStyles.tab, tab === 'password' && recoveryStyles.activeTab]} onPress={() => changeTab('password')}>
            <Text style={[recoveryStyles.tabText, tab === 'password' && recoveryStyles.activeTabText]}>비밀번호 변경</Text>
          </TouchableOpacity>
        </View>

        <Text style={recoveryStyles.description}>
          {tab === 'id' ? '가입할 때 등록한 휴대폰 번호로 아이디를 찾습니다.' : '아이디와 가입한 휴대폰 번호를 인증한 뒤 비밀번호를 변경합니다.'}
        </Text>

        {tab === 'password' ? (
          <AppInput label="아이디" required value={usrId} onChangeText={value => {setUsrId(value); setIsSent(false); setIsVerified(false); setErrorMessage('');}} placeholder="아이디를 입력해주세요" autoCapitalize="none" autoCorrect={false} editable={!isVerified && !busy} />
        ) : null}

        {!completed ? (
          <>
            <SmsVerifyInput
              hpNo={hpNo}
              verificationCode={code}
              isSending={isSending}
              isSent={isSent}
              isVerified={isVerified}
              verifiedMsg={verifiedMessage}
              errorMsg={errorMessage}
              expiredMsg={getMsg('SMS', '006')}
              onHpNoChange={value => {setHpNo(value.replace(/\D/g, '').slice(0, 11)); setIsSent(false); setIsVerified(false); setCode(''); setErrorMessage('');}}
              onVerificationCodeChange={setCode}
              onSend={sendCode}
              onVerify={value => {if (!busy) void verifyCode(value);}}
            />
            {isVerified && tab === 'id' && foundUsrId ? (
              <View style={recoveryStyles.resultCard}>
                <Text style={recoveryStyles.resultLabel}>가입된 아이디</Text>
                <Text style={recoveryStyles.resultValue}>{foundUsrId}</Text>
              </View>
            ) : null}
            {isVerified && tab === 'password' ? (
              <>
                <AppInput label="새 비밀번호" required value={newPassword} onChangeText={setNewPassword} placeholder="8자 이상 입력해주세요" secureTextEntry autoCapitalize="none" />
                <AppInput label="새 비밀번호 확인" required value={confirmPassword} onChangeText={setConfirmPassword} placeholder="비밀번호를 다시 입력해주세요" secureTextEntry autoCapitalize="none" />
                {errorMessage ? <Text style={commonStyles.errorText}>{errorMessage}</Text> : null}
                <TouchableOpacity style={[commonStyles.primaryButton, busy && recoveryStyles.disabled]} onPress={() => void submitPassword()} disabled={busy}>
                  <Text style={commonStyles.primaryButtonText}>{busy ? '변경 중…' : '비밀번호 변경'}</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        ) : (
          <View style={recoveryStyles.completeArea}>
            <Text style={recoveryStyles.completeText}>{verifiedMessage}</Text>
            <TouchableOpacity style={commonStyles.primaryButton} onPress={onBack}>
              <Text style={commonStyles.primaryButtonText}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default AccountRecoveryScreen;
