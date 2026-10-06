import React from 'react';

import {Modal, Text, TouchableOpacity, View} from 'react-native';

import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
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

  const postcodeHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta
      name="viewport"
      content="width=device-width,
              initial-scale=1.0,
              maximum-scale=1.0,
              minimum-scale=1.0,
              user-scalable=no"
    >

    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #FFFFFF;
      }

      #container {
        width: 100%;
        height: 100%;
      }

    </style>
  </head>
  <body>

    <div id="container"></div>

    <script
      src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js">
    </script>

    <script>

      function init() {
        new daum.Postcode({
          oncomplete: function(data) {
            var address =
              data.roadAddress ||
              data.jibunAddress ||
              '';

            if (address) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                  address: address
                })
              );

            }
          },

          width: '100%',
          height: '100%',

          animation: true,
          hideMapBtn: true

        }).embed(
          document.getElementById('container')
        );
      }

      window.addEventListener(
        'DOMContentLoaded',
        init
      );

    </script>
  </body>
  </html>
`;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data,) as {address?: string};

      if (data.address) {
        onSelect(data.address);
      }
    } catch (e) {
      console.error('주소 검색 결과 처리 실패:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>

      <SafeAreaProvider>
        <SafeAreaView
          style={{flex: 1, backgroundColor: '#FFFFFF'}}
          edges={['top', 'bottom']}>

          {/* 헤더 */}
          <View
            style={{
              height: 56,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E5E5',
              backgroundColor: '#FFFFFF',
            }}>

            <Text style={commonStyles.modalTitle}>
              주소 검색
            </Text>
            <TouchableOpacity
              style={{
                minWidth: 60,
                minHeight: 44,
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}
              onPress={onClose}
              activeOpacity={0.7}>

              <Text style={commonStyles.modalClose}>
                닫기
              </Text>
            </TouchableOpacity>
          </View>

          {/* 주소 검색 */}
          <View
            style={{
              flex: 1,
              width: '100%',
              overflow: 'hidden',
            }}>

            <WebView
              source={{html: postcodeHTML, baseUrl: 'https://postcode.map.daum.net'}}
              onMessage={handleMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
              automaticallyAdjustContentInsets={false}
              bounces={false}
              scrollEnabled={false}
              style={{flex: 1,width: '100%'}}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default AddressSearchModal;