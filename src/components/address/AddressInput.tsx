import React, {useState} from 'react';

import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import commonStyles from '../../styles/common';

import AddressSearchModal from './AddressSearchModal';

interface AddressInputProps {
  addr: string;
  dtlAddr: string;
  onAddrChange: (value: string) => void;
  onDtlAddrChange: (value: string) => void;
}

const AddressInput = ({
  addr,
  dtlAddr,
  onAddrChange,
  onDtlAddrChange,
}: AddressInputProps) => {

  const [
    isSearchVisible,
    setIsSearchVisible,
  ] = useState(false);

  const [
    isDetailFocused,
    setIsDetailFocused,
  ] = useState(false);

  const handleSelect = (
    address: string,
  ) => {
    onAddrChange(address);
    setIsSearchVisible(false);
  };

  return (
    <View
      style={commonStyles.inputGroup}>

      <Text
        style={commonStyles.label}>

        주소

        <Text
          style={commonStyles.required}>
          {' '}*
        </Text>

      </Text>

      <View
        style={
          commonStyles.addressInputArea
        }>

        <TextInput
          style={[
            commonStyles.input,
            commonStyles.addressInput,
            commonStyles.inputDisabled,
          ]}
          placeholder="주소 검색을 이용해주세요"
          placeholderTextColor="#999999"
          value={addr}
          editable={false}
        />

        <TouchableOpacity
          style={
            commonStyles.addressButton
          }
          onPress={() =>
            setIsSearchVisible(true)
          }
          activeOpacity={0.8}>

          <Text
            style={
              commonStyles.addressButtonText
            }>
            주소 검색
          </Text>

        </TouchableOpacity>

      </View>

      <TextInput
        style={[
          commonStyles.input,
          commonStyles.subInput,
          isDetailFocused &&
            commonStyles.inputFocused,
        ]}
        placeholder={
          isDetailFocused
            ? ''
            : '상세주소를 입력해주세요 (선택)'
        }
        placeholderTextColor="#999999"
        value={dtlAddr}
        onChangeText={
          onDtlAddrChange
        }
        onFocus={() =>
          setIsDetailFocused(true)
        }
        onBlur={() =>
          setIsDetailFocused(false)
        }
      />

      <AddressSearchModal
        visible={isSearchVisible}
        onClose={() =>
          setIsSearchVisible(false)
        }
        onSelect={handleSelect}
      />

    </View>
  );
};

export default AddressInput;