import React from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import {API_BASE_URL} from '../../config/environment';
import type {MenuItem} from '../../api/menuApi';
import styles from '../../styles/bottomNavigation';
import BrandLoader from './BrandLoader';
import useMsg from '../../hooks/useMsg';

interface BottomNavigationProps {
  items: MenuItem[];
  accessToken: string;
  activeRoute: string;
  loading: boolean;
  error: string | null;
  onSelect: (item: MenuItem) => void;
  onRetry: () => void;
}

function BottomNavigation({
  items,
  accessToken,
  activeRoute,
  loading,
  error,
  onSelect,
  onRetry,
}: BottomNavigationProps) {
  const {getMsg} = useMsg();

  return (
    <View style={styles.container}>
      {loading ? (
        <BrandLoader mode="compact" visible />
      ) : error ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.message}>{error}  {getMsg('COMMON', '044')}</Text>
        </Pressable>
      ) : (
        items.map(item => {
          const active = item.programUrl === activeRoute;
          const label = item.programUrl === 'settings' ? '전체메뉴' : item.menuName;
          const hasFileIcon = typeof item.icoFilSeq === 'number' && item.icoFilSeq > 0;
          return (
            <Pressable
              key={item.menuId}
              accessibilityRole="tab"
              accessibilityState={{selected: active}}
              onPress={() => onSelect(item)}
              style={styles.item}>
              {hasFileIcon ? (
                <Image
                  source={{
                    uri: `${API_BASE_URL}/api/menu/icons/${item.icoFilSeq}`,
                    headers: {Authorization: `Bearer ${accessToken}`},
                  }}
                  style={[styles.iconImage, active && styles.activeIconImage]}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={[styles.icon, active && styles.activeText]}>
                  •
                </Text>
              )}
              <Text style={[styles.label, active && styles.activeText]}>
                {label}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

export default BottomNavigation;
