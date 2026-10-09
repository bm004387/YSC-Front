import React, { useEffect, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import commonStyles from '../../styles/common';
import TextInput from '../common/NoAutofillTextInput';

interface SmsVerifyInputProps {
  hpNo: string;
  verificationCode: string;
  isSending: boolean;
  isSent: boolean;
  isVerified: boolean;
  verifiedMsg: string;
  errorMsg?: string;
  expiredMsg: string;

  onHpNoChange: (value: string) => void;

  onVerificationCodeChange: (value: string) => void;

  onSend: () => Promise<boolean>;

  onVerify: (code: string) => void;
}

const SmsVerifyInput = ({
  hpNo,
  verificationCode,
  isSending,
  isSent,
  isVerified,
  verifiedMsg,
  errorMsg,
  expiredMsg,
  onHpNoChange,
  onVerificationCodeChange,
  onSend,
  onVerify,
}: SmsVerifyInputProps) => {
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  /*
   * 인증번호 발송 성공 후
   * 180초 카운트다운
   */
  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [remainingSeconds]);

  /*
   * 전화번호가 변경되면
   * 기존 인증상태 초기화
   */
  useEffect(() => {
    setRemainingSeconds(0);
    setIsExpired(false);
  }, [hpNo]);

  /*
   * 인증 성공
   */
  useEffect(() => {
    if (isVerified) {
      setRemainingSeconds(0);
      setIsExpired(false);
    }
  }, [isVerified]);

  /*
   * 인증번호 발송
   */
  const handleSend = async () => {
    const success = await onSend();
    /*
     * 실제 SMS 발송 성공했을 때만
     * 3분 시작
     */
    if (success) {
      setRemainingSeconds(180);
      setIsExpired(false);
    }
  };

  /*
   * 180초 → 03:00
   */
  const formatTime = (seconds: number) => {
    const minute = Math.floor(seconds / 60);
    const second = seconds % 60;

    return `${String(minute).padStart(2, '0')}:${String(second).padStart(
      2,
      '0',
    )}`;
  };

  return (
    <View style={commonStyles.inputGroup}>
      {/* 휴대폰 번호 */}
      <Text style={commonStyles.label}>
        휴대폰 번호
        <Text style={commonStyles.required}> *</Text>
      </Text>
      <View style={commonStyles.phoneInputArea}>
        <TextInput
          style={[
            commonStyles.input,
            commonStyles.phoneInput,
            isPhoneFocused && commonStyles.inputFocused,
          ]}
          placeholder={isPhoneFocused ? '' : '휴대폰 번호를 입력해주세요'}
          placeholderTextColor="#999999"
          value={hpNo}
          onChangeText={onHpNoChange}
          onFocus={() => setIsPhoneFocused(true)}
          onBlur={() => setIsPhoneFocused(false)}
          keyboardType="phone-pad"
          maxLength={11}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
        />

        <TouchableOpacity
          style={commonStyles.smsButton}
          onPress={handleSend}
          disabled={isSending}
          activeOpacity={0.8}
        >
          <Text style={commonStyles.smsButtonText}>
            {isSending ? '발송중' : isSent ? '재발송' : '인증번호 발송'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 인증번호 */}
      {isSent && (
        <>
          <View style={commonStyles.verifyInputArea}>
            <TextInput
              style={[
                commonStyles.input,
                commonStyles.verifyInput,
                isCodeFocused && commonStyles.inputFocused,
                errorMsg && commonStyles.inputError,
                isExpired && commonStyles.inputError,
              ]}
              placeholder={isCodeFocused ? '' : '인증번호 6자리를 입력해주세요'}
              placeholderTextColor="#999999"
              value={verificationCode}
              onChangeText={value => {
                const code = value.replace(/[^0-9]/g, '');
                onVerificationCodeChange(code);
                if (
                  code.length === 6 &&
                  !isVerified &&
                  !isExpired &&
                  remainingSeconds > 0
                ) {
                  onVerify(code);
                }
              }}
              onFocus={() => setIsCodeFocused(true)}
              onBlur={() => setIsCodeFocused(false)}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />
          </View>
        </>
      )}

      {/* 타이머 */}
      {remainingSeconds > 0 && !isVerified && (
        <Text style={commonStyles.errorText}>
          인증번호 유효시간 {formatTime(remainingSeconds)}
        </Text>
      )}

      {/* 만료 */}
      {isExpired && !isVerified && (
        <Text style={commonStyles.errorText}>{expiredMsg}</Text>
      )}

      {/* 인증 성공 */}
      {isVerified && (
        <Text style={commonStyles.availableText}>{verifiedMsg}</Text>
      )}

      {/* 인증 오류 */}
      {!isVerified && !isExpired && errorMsg && (
        <Text style={commonStyles.errorText}>{errorMsg}</Text>
      )}
    </View>
  );
};

export default SmsVerifyInput;
