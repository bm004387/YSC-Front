import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getAllMenuList } from '../api/menuApi';
import { AuthRequiredError, getRequiredAccessToken } from '../api/apiClient';
import type { MenuItem } from '../api/menuApi';
import { API_BASE_URL } from '../config/environment';
import colors from '../styles/colors';
import mainStyles from '../styles/main';
import useMsg from '../hooks/useMsg';
import BrandLoader from '../components/common/BrandLoader';

interface SettingsScreenProps {
  onMenuSelect: (item: MenuItem) => void;
}

function SettingsScreen({ onMenuSelect }: SettingsScreenProps) {
  const { getMsg } = useMsg();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMenus = async () => {
    setLoading(true);
    setError('');
    try {
      const accessToken = await getRequiredAccessToken();
      setAccessToken(accessToken);
      setMenus(await getAllMenuList(accessToken));
    } catch (loadError) {
      setError(loadError instanceof AuthRequiredError
        ? getMsg('MYINFO', '009')
        : getMsg('COMMON', '023'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMenus();
  }, []);

  const groups = useMemo(() =>
    menus
      .filter(parent => parent.programUrl !== 'settings')
      .map(parent => ({
        parent,
        children: menus.filter(item => item.upperMenuId === parent.menuId),
      }))
      .filter(group => group.children.length > 0),
  [menus]);

  return (
    <View style={mainStyles.container}>
      <View style={mainStyles.header}>
        <Image
          source={require('../../assets/brand/recipe-logo-transparent.png')}
          style={mainStyles.logo}
          resizeMode="contain"
          accessibilityLabel="레시피 로고"
        />
        <Text style={mainStyles.headerTitle}>전체메뉴</Text>
      </View>
      {loading ? (
        <BrandLoader mode="compact" visible />
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
                    {renderMenuIcon(parent.icoFilSeq, accessToken, styles.groupIcon)}
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
                        {renderMenuIcon(item.icoFilSeq, accessToken, styles.menuIcon)}
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

function renderMenuIcon(icoFilSeq: number | null | undefined, accessToken: string, textStyle: object) {
  if (typeof icoFilSeq === 'number' && icoFilSeq > 0) {
    return (
      <Image
        source={{
          uri: `${API_BASE_URL}/api/menu/icons/${icoFilSeq}`,
          headers: {Authorization: `Bearer ${accessToken}`},
        }}
        style={styles.menuImage}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <Text style={textStyle}>
      •
    </Text>
  );
}

const styles = StyleSheet.create({
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
  menuImage: { width: 18, height: 18, tintColor: colors.gray700 },
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
