import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getAllMenuList } from '../api/menuApi';
import type { MenuItem } from '../api/menuApi';
import colors from '../styles/colors';
import mainStyles from '../styles/main';
import useMsg from '../hooks/useMsg';

interface SettingsScreenProps {
  onMenuSelect: (item: MenuItem) => void;
}

const menuIconGlyphs: Record<string, string> = {
  folder: '📁',
  document: '📄',
  search: '🔍',
  image: '🖼️',
  calendar: '📅',
  file: '📎',
  settings: '⚙️',
  list: '☰',
  chart: '📊',
  bell: '🔔',
  map: '📍',
  star: '★',
  help: '❔',
  user: '👤',
};

function SettingsScreen({ onMenuSelect }: SettingsScreenProps) {
  const { getMsg } = useMsg();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMenus = async () => {
    setLoading(true);
    setError('');
    try {
      setMenus(await getAllMenuList());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : getMsg('COMMON', '023'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMenus();
  }, []);

  const groups = useMemo(
    () =>
      menus
        .filter(parent => parent.programUrl !== 'settings')
        .map(parent => ({
          parent,
          children: menus.filter(item => item.upperMenuId === parent.menuId),
        }))
        .filter(group => group.children.length > 0),
    [menus],
  );

  return (
    <View style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Text style={mainStyles.logo}>YSC</Text>
        <Text style={mainStyles.headerTitle}>전체메뉴</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loading} color="#3867D6" />
      ) : error ? (
        <Pressable onPress={() => void loadMenus()} style={styles.statusArea}>
          <Text style={styles.statusText}>
            {error} {getMsg('COMMON', '044')}
          </Text>
        </Pressable>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {groups.length ? (
            groups.map(({ parent, children }) => (
              <View key={parent.menuId} style={styles.group}>
                <View style={styles.groupHeading}>
                  <View style={styles.groupIconSlot}>
                    <Text style={styles.groupIcon}>
                      {menuIconGlyphs[parent.iconName?.toLowerCase() ?? ''] ??
                        '•'}
                    </Text>
                  </View>
                  <Text style={styles.groupTitle}>{parent.menuName}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.grid}>
                  {children.map(item => (
                    <Pressable
                      key={item.menuId}
                      accessibilityRole="button"
                      onPress={() => onMenuSelect(item)}
                      style={styles.menuItem}
                    >
                      <View style={styles.menuIconSlot}>
                        <Text style={styles.menuIcon}>
                          {menuIconGlyphs[item.iconName?.toLowerCase() ?? ''] ??
                            '•'}
                        </Text>
                      </View>
                      <Text numberOfLines={2} style={styles.menuLabel}>
                        {item.menuName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{getMsg('COMMON', '027')}</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  group: { marginBottom: 30 },
  groupHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIconSlot: { width: 25, alignItems: 'center', marginRight: 6 },
  groupIcon: { fontSize: 15 },
  groupTitle: { fontSize: 17, fontWeight: '700', color: colors.gray900 },
  divider: { height: 1, backgroundColor: colors.gray200, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  menuItem: {
    width: '50%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 6,
  },
  menuIconSlot: { width: 24, alignItems: 'center', marginRight: 6 },
  menuIcon: { fontSize: 14, lineHeight: 20 },
  menuLabel: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.gray700 },
  statusArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusText: { color: colors.error, textAlign: 'center' },
  emptyText: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default SettingsScreen;
