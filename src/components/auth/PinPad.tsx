import React from 'react';
import { Pressable, Text, View } from 'react-native';
import styles from '../../styles/pinPad';

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** PIN 4자리 표시와 숫자 키패드를 공통으로 제공합니다. */
function PinPad({value, onChange, disabled = false}: PinPadProps) {
  const append = (digit: string) => {
    if (!disabled && value.length < 4) onChange(value + digit);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map(index => (
          <View key={index} style={[styles.dot, index < value.length && styles.dotFilled]} />
        ))}
      </View>
      <View style={styles.keypad}>
        {['1','2','3','4','5','6','7','8','9','','0','delete'].map((key, index) => (
          <Pressable
            key={`${key}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={key === 'delete' ? '마지막 숫자 지우기' : `${key} 입력`}
            disabled={disabled || !key}
            style={styles.key}
            onPress={() => key === 'delete' ? onChange(value.slice(0, -1)) : key && append(key)}>
            <Text style={styles.keyText}>{key === 'delete' ? '⌫' : key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default PinPad;
