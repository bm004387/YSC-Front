import React, { useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import commonStyles from '../../styles/common';
import TextInput from '../common/NoAutofillTextInput';

interface IdCheckInputProps {
  value: string;
  checked: boolean;
  available: boolean;
  onChangeText: (value: string) => void;
  onCheck: () => void;
  availableMsg: string;
  unavailableMsg: string;
}

const IdCheckInput = ({
  value,
  checked,
  available,
  onChangeText,
  onCheck,
  availableMsg,
  unavailableMsg,
}: IdCheckInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={commonStyles.inputGroup}>
      <Text style={commonStyles.label}>
        아이디
        <Text style={commonStyles.required}> *</Text>
      </Text>

      <View style={commonStyles.idInputArea}>
        <TextInput
          style={[
            commonStyles.input,
            commonStyles.idInput,
            isFocused && commonStyles.inputFocused,
            checked && !available && commonStyles.inputError,
          ]}
          placeholder={isFocused ? '' : '아이디를 입력해주세요'}
          placeholderTextColor="#999999"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          returnKeyType="next"
        />

        <TouchableOpacity
          style={commonStyles.checkButton}
          onPress={onCheck}
          activeOpacity={0.8}
        >
          <Text style={commonStyles.checkButtonText}>중복확인</Text>
        </TouchableOpacity>
      </View>

      {checked && available && (
        <Text style={commonStyles.availableText}>{availableMsg}</Text>
      )}

      {checked && !available && (
        <Text style={commonStyles.errorText}>{unavailableMsg}</Text>
      )}
    </View>
  );
};

export default IdCheckInput;
