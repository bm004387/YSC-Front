import React from 'react';
import {Pressable, Text, View} from 'react-native';
import type {MenuItem} from '../../api/menuApi';
import styles from '../../styles/bottomNavigation';
import useMsg from '../../hooks/useMsg';

interface BottomNavigationProps {
  items: MenuItem[];
  activeRoute: string;
  loading: boolean;
  error: string | null;
  onSelect: (item: MenuItem) => void;
  onRetry: () => void;
}

const iconGlyphs: Record<string, string> = {
  home: '⌂',
  user: '●',
  settings: '⚙',
  community: '◎',
};

function BottomNavigation({
  items,
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
        <Text style={styles.message}>{getMsg('COMMON', '053')}</Text>
      ) : error ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.message}>{error}  {getMsg('COMMON', '044')}</Text>
        </Pressable>
      ) : (
        items.map(item => {
          const active = item.programUrl === activeRoute;
          const label = item.programUrl === 'settings' ? '전체메뉴' : item.menuName;
          return (
            <Pressable
              key={item.menuId}
              accessibilityRole="tab"
              accessibilityState={{selected: active}}
              onPress={() => onSelect(item)}
              style={styles.item}>
              <Text style={[styles.icon, active && styles.activeText]}>
                {iconGlyphs[item.iconName ?? ''] ?? '•'}
              </Text>
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
