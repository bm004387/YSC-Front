import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/main';

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>YSC</Text>
        <Text style={styles.headerTitle}>설정</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtitle}>설정 메뉴를 준비하고 있습니다.</Text>
      </View>
    </View>
  );
}

export default SettingsScreen;
