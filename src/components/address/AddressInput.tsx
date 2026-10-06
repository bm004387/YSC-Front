import React, {useState} from 'react';

import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import commonStyles from '../../styles/common';
import AddressSearchModal from './AddressSearchModal';

interface AddressInputProps {
  value: string;
  detailValue: string;
  onChangeText: (value: string) => void;
  onDetailChangeText: (value: string) => void;
}

const AddressInput = ({
  value,
  detailValue,
  onChangeText,
  onDetailChangeText,
}: AddressInputProps) => {

  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={commonStyles.inputGroup}>
      <Text style={commonStyles.label}>
        주소
        <Text style={commonStyles.required}> *</Text>
      </Text>

      {/* 주소 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          setIsModalVisible(true)
        }>

        <View pointerEvents="none">
          <TextInput
            style={commonStyles.input}
            placeholder="주소를 입력해주세요"
            placeholderTextColor="#999999"
            value={value}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      {/* 상세주소 */}
      <TextInput
        style={[commonStyles.input,
          {marginTop: 8}
        ]}
        placeholder="상세주소를 입력해주세요"
        placeholderTextColor="#999999"
        value={detailValue}
        onChangeText={onDetailChangeText}
      />

      <AddressSearchModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelect={(selectedAddress) => {
          onChangeText(selectedAddress);
          setIsModalVisible(false);
        }}
      />
    </View>
  );
};

export default AddressInput;