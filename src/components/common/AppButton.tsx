import React from 'react';

import {
  Text,
  TouchableOpacity,
} from 'react-native';

import commonStyles from '../../styles/common';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const AppButton = ({
  title,
  onPress,
  disabled = false,
}: AppButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        commonStyles.primaryButton,
        disabled &&
          commonStyles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>

      <Text
        style={[
          commonStyles.primaryButtonText,
          disabled &&
            commonStyles.disabledButtonText,
        ]}>
        {title}
      </Text>

    </TouchableOpacity>
  );
};

export default AppButton;