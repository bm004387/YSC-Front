import React from 'react';

import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  WebView,
  WebViewMessageEvent,
} from 'react-native-webview';

import commonStyles from '../../styles/common';

interface AddressSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
}

const AddressSearchModal = ({
  visible,
  onClose,
  onSelect,
}: AddressSearchModalProps) => {

  const addressSearchHtml = `
<!DOCTYPE html>
<html>
<head>
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
/>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#postcode {
  width: 100%;
  height: 100%;
}
</style>
</head>

<body>
<div id="postcode"></div>

<script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>

<script>
new daum.Postcode({
  oncomplete: function(data) {
    var address =
      data.roadAddress ||
      data.jibunAddress ||
      '';

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        address: address
      })
    );
  }
}).embed(
  document.getElementById('postcode')
);
</script>

</body>
</html>
`;

  const handleMessage = (
    event: WebViewMessageEvent,
  ) => {
    try {
      const data = JSON.parse(
        event.nativeEvent.data,
      ) as {
        address?: string;
      };

      if (data.address) {
        onSelect(data.address);
      }
    } catch (e) {
      console.error(
        '주소 검색 결과 처리 실패:',
        e,
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>

      <View
        style={commonStyles.modalContainer}>

        <View
          style={commonStyles.modalHeader}>

          <Text
            style={commonStyles.modalTitle}>
            주소 검색
          </Text>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}>

            <Text
              style={commonStyles.modalClose}>
              닫기
            </Text>

          </TouchableOpacity>

        </View>

        <WebView
          source={{
            html: addressSearchHtml,
          }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          style={{
            flex: 1,
          }}
        />

      </View>

    </Modal>
  );
};

export default AddressSearchModal;