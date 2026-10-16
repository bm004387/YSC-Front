import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import useMsg from '../../hooks/useMsg';
import styles from '../../styles/brandLoader';

interface BrandLoaderProps {
  mode?: 'modal' | 'compact';
  visible?: boolean;
  delayMs?: number;
  onClose?: () => void;
}

function BrandLoader({
  mode = 'modal',
  visible = false,
  delayMs = 500,
  onClose,
}: BrandLoaderProps) {
  const {getMsg} = useMsg();
  const [displayVisible, setDisplayVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setDisplayVisible(false);
      return undefined;
    }

    if (delayMs <= 0) {
      setDisplayVisible(true);
      return undefined;
    }

    setDisplayVisible(false);
    const timer = setTimeout(() => setDisplayVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, visible]);

  useEffect(() => {
    if (!displayVisible) {
      return undefined;
    }

    progress.setValue(0);
    pulse.setValue(0);

    const progressAnimation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    const logoAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    progressAnimation.start();
    logoAnimation.start();

    return () => {
      progressAnimation.stop();
      logoAnimation.stop();
    };
  }, [displayVisible, mode, progress, pulse]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: mode === 'compact' ? [-44, 116] : [-64, 190],
  });
  const logoScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });
  const logoOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });

  const logo = (
    <Animated.View
      style={[
        mode === 'compact' ? styles.compactLogoFrame : styles.logoFrame,
        {opacity: logoOpacity, transform: [{scale: logoScale}]},
      ]}>
      <Animated.Image
        source={require('../../../assets/brand/ysc-y-transparent.png')}
        style={mode === 'compact' ? styles.compactLogo : styles.logo}
        resizeMode="contain"
        accessibilityLabel="YSC 로고"
      />
    </Animated.View>
  );

  const progressBar = (
    <View
      style={mode === 'compact' ? styles.compactProgressTrack : styles.progressTrack}
      accessibilityRole="progressbar"
      accessibilityLabel={getMsg('COMMON', '053')}>
      <Animated.View
        style={[
          mode === 'compact' ? styles.compactProgressFill : styles.progressFill,
          {transform: [{translateX}]},
        ]}
      />
    </View>
  );

  if (!displayVisible) {
    return null;
  }

  if (mode === 'compact') {
    return (
      <View style={styles.compactContainer}>
        {logo}
        <View style={styles.compactContent}>
          <Text style={styles.compactLabel}>{getMsg('COMMON', '053')}</Text>
          {progressBar}
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={displayVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      {onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="로딩 미리보기 닫기"
          onPress={onClose}
          style={styles.backdrop}>
          <View pointerEvents="none" style={styles.loadingContent}>
            {logo}
            <Text style={styles.title}>{getMsg('COMMON', '053')}</Text>
            {progressBar}
          </View>
        </Pressable>
      ) : (
        <View style={styles.backdrop}>
          <View style={styles.loadingContent}>
            {logo}
            <Text style={styles.title}>{getMsg('COMMON', '053')}</Text>
            {progressBar}
          </View>
        </View>
      )}
    </Modal>
  );
}

export default BrandLoader;
