import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import AppInput from '../components/common/AppInput';
import commonStyles from '../styles/common';
import {getRememberedUserId} from '../storage/tokenStorage';
import useMsg from '../hooks/useMsg';

interface PinEnrollmentScreenProps {
  onContinue: (usrId: string, password: string) => void;
  onBack: () => void;
}

/** 기존 계정의 비밀번호를 받은 뒤 PIN 등록 단계로 이동합니다. */
function PinEnrollmentScreen({onContinue, onBack}: PinEnrollmentScreenProps) {
  const [usrId, setUsrId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {getMsg} = useMsg();

  useEffect(() => {
    void getRememberedUserId()
      .then(value => setUsrId(value ?? ''))
      .catch(e => console.warn('저장된 계정 아이디 조회 실패:', e));
  }, []);

  const proceed = () => {
    if (!usrId.trim()) {
      setError(getMsg('COMMON', '001'));
      return;
    }
    if (!password) {
      setError(getMsg('COMMON', '002'));
      return;
    }
    onContinue(usrId.trim(), password);
  };

  return (
    <View style={commonStyles.safeArea}>
      <ScrollView contentContainerStyle={commonStyles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={commonStyles.backButton} onPress={onBack}>
          <Text style={commonStyles.backText}>‹ 로그인으로</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>PIN 등록</Text>
        <Text style={commonStyles.subtitle}>
          기존 계정 비밀번호를 확인한 뒤 PIN 번호를 설정합니다.
        </Text>
        <AppInput
          label="아이디"
          required
          value={usrId}
          onChangeText={setUsrId}
          placeholder="아이디를 입력해주세요"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <AppInput
          label="기존 비밀번호"
          required
          value={password}
          onChangeText={setPassword}
          placeholder="기존 비밀번호를 입력해주세요"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={commonStyles.primaryButton} onPress={proceed}>
          <Text style={commonStyles.primaryButtonText}>PIN 설정 계속</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default PinEnrollmentScreen;
