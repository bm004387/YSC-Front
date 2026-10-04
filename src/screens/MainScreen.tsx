import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import styles from '../styles/common';

function MainScreen() {

  return (
    <View style={styles.mainContainer}>

      <Text style={styles.mainTitle}>
        YSC
      </Text>

      <Text style={styles.mainMessage}>
        로그인되었습니다.
      </Text>

      <Text style={styles.mainSubMessage}>
        메인 화면입니다.
      </Text>

    </View>
  );
}

export default MainScreen;