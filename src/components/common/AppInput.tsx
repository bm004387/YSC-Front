import React, {useState} from 'react';

import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';

import commonStyles from '../../styles/common';

interface AppInputProps
  extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  inputStyle?: StyleProp<TextStyle>;
}

const AppInput = ({
  label,
  required = false,
  error,
  success,
  inputStyle,
  placeholder,
  onFocus,
  onBlur,
  ...props
}: AppInputProps) => {
  const [isFocused, setIsFocused] =
    useState(false);

  return (
    <View
      style={commonStyles.inputGroup}>

      <Text style={commonStyles.label}>
        {label}

        {required && (
          <Text
            style={commonStyles.required}>
            {' '}*
          </Text>
        )}
      </Text>

      <TextInput
        {...props}
        style={[
          commonStyles.input,
          isFocused &&
            commonStyles.inputFocused,
          error &&
            commonStyles.inputError,
          inputStyle,
        ]}
        placeholder={
          isFocused ? '' : placeholder
        }
        placeholderTextColor={
          '#999999'
        }
        onFocus={event => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setIsFocused(false);
          onBlur?.(event);
        }}
      />

      {error && (
        <Text
          style={commonStyles.errorText}>
          {error}
        </Text>
      )}

      {success && (
        <Text
          style={
            commonStyles.availableText
          }>
          {success}
        </Text>
      )}

    </View>
  );
};

export default AppInput;