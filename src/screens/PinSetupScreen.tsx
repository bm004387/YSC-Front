import React, {useEffect, useRef, useState} from 'react';
import {Text, View} from 'react-native';
import PinPad from '../components/auth/PinPad';
import commonStyles from '../styles/common';
import {setupPin} from '../api/authApi';
import {saveRememberedUserId} from '../storage/tokenStorage';
import useMsg from '../hooks/useMsg';
import pinSetupStyles from '../styles/pinSetup';

interface PinSetupScreenProps {
  usrId: string;
  password: string;
  confirmation: boolean;
  firstPin?: string;
  onNext: (pin: string) => void;
  onComplete: (pin: string) => void;
}

/** 최초 PIN 입력과 확인을 각각 독립 화면으로 보여줍니다. */
function PinSetupScreen({usrId, password, confirmation, firstPin = '', onNext, onComplete}: PinSetupScreenProps) {
  const {getMsg} = useMsg();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const processed = useRef(false);

  useEffect(() => {
    if (pin.length !== 4 || processed.current) return;
    processed.current = true;
    if (!confirmation) {
      onNext(pin);
      return;
    }
    if (pin !== firstPin) {
      setError(getMsg('COMMON', '003'));
      setPin('');
      processed.current = false;
      return;
    }
    void (async () => {
      try {
        setSaving(true);
        await setupPin(usrId, password, pin);
        await saveRememberedUserId(usrId);
        onComplete(pin);
      } catch (e) {
        setError(e instanceof Error ? e.message : getMsg('SIGNUP', '004'));
        setPin('');
        processed.current = false;
      } finally {
        setSaving(false);
      }
    })();
  }, [confirmation, firstPin, getMsg, onComplete, onNext, password, pin, usrId]);

  return (
    <View style={[commonStyles.safeArea, pinSetupStyles.screen]}>
      <Text style={pinSetupStyles.back} onPress={() => !confirmation && setPin('')}>YSC</Text>
      <Text style={pinSetupStyles.title}>{confirmation ? 'PIN 번호 확인' : 'PIN 번호 설정'}</Text>
      <Text style={pinSetupStyles.subtitle}>{confirmation ? '한 번 더 입력해주세요.' : '앞으로 사용할 숫자 4자리를 입력해주세요.'}</Text>
      <PinPad value={pin} onChange={value => {setPin(value); setError('');}} disabled={saving} />
      {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}
      {saving ? <Text style={pinSetupStyles.status}>PIN을 저장하고 있습니다…</Text> : null}
    </View>
  );
}

export default PinSetupScreen;
