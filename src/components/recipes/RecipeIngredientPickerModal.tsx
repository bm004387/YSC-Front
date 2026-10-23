import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import styles from '../../styles/recipeApp';

export interface RecipePickerOption {
  groupCode: string;
  groupName: string;
  code: string;
  name: string;
}

interface RecipeIngredientPickerModalProps {
  visible: boolean;
  title: string;
  mode: 'ingredient' | 'unit';
  groups?: Array<{ code: string; name: string; items: RecipePickerOption[] }>;
  items?: RecipePickerOption[];
  onClose: () => void;
  onSelect: (item: RecipePickerOption) => void;
}

function RecipeIngredientPickerModal({
  visible,
  title,
  mode,
  groups = [],
  items = [],
  onClose,
  onSelect,
}: RecipeIngredientPickerModalProps) {
  const [selectedGroupCode, setSelectedGroupCode] = useState('');
  const [query, setQuery] = useState('');

  const activeGroup = groups.find(group => group.code === selectedGroupCode) ?? groups[0];
  const visibleItems = useMemo(() => {
    const source = mode === 'ingredient' ? activeGroup?.items ?? [] : items;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return source;
    return source.filter(item => item.name.toLocaleLowerCase().includes(normalizedQuery));
  }, [activeGroup, items, mode, query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  const select = (item: RecipePickerOption) => {
    setQuery('');
    onSelect(item);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.ingredientModalBackdrop}>
        <Pressable style={styles.ingredientModalDismissArea} onPress={close} />
        <View style={styles.ingredientModalSheet}>
          <View style={styles.ingredientModalHeading}>
            <View>
              <Text style={styles.ingredientModalTitle}>{title}</Text>
              <Text style={styles.ingredientModalCaption}>
                {mode === 'ingredient' ? '공통코드에 등록된 항목을 선택해 주세요.' : '계량 단위를 선택해 주세요.'}
              </Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={close} style={styles.ingredientModalClose}>
              <Text style={styles.ingredientModalCloseText}>×</Text>
            </Pressable>
          </View>

          {mode === 'ingredient' && groups.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ingredientTabRow}>
              {groups.map(group => {
                const active = (activeGroup?.code ?? '') === group.code;
                return (
                  <Pressable
                    key={group.code}
                    onPress={() => { setSelectedGroupCode(group.code); setQuery(''); }}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}>
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{group.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          <View style={styles.ingredientSearchInputWrap}>
            <Text style={styles.ingredientSearchGlyph}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={mode === 'ingredient' ? '재료 검색' : '단위 검색'}
              placeholderTextColor="#A99B90"
              style={styles.ingredientSearchInput}
              returnKeyType="search"
            />
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.ingredientOptionList}>
            {visibleItems.length > 0 ? visibleItems.map(item => (
              <Pressable key={`${item.groupCode}:${item.code}`} onPress={() => select(item)} style={styles.ingredientOptionRow}>
                <Text style={styles.ingredientOptionName}>{item.name}</Text>
                <Text style={styles.ingredientOptionArrow}>›</Text>
              </Pressable>
            )) : (
              <View style={styles.ingredientOptionEmpty}>
                <Text style={styles.ingredientOptionEmptyTitle}>
                  {mode === 'ingredient' && groups.length === 0
                    ? '등록된 재료 공통코드가 없어요'
                    : mode === 'unit' && items.length === 0
                      ? '등록된 계량 공통코드가 없어요'
                      : '검색 결과가 없어요'}
                </Text>
                <Text style={styles.ingredientOptionEmptyCaption}>
                  {mode === 'ingredient' && groups.length === 0
                    ? 'RCP_INGR_로 시작하는 분류별 공통코드를 등록해 주세요.'
                    : mode === 'unit' && items.length === 0
                      ? 'RCP_UNIT 공통코드에 단위를 등록해 주세요.'
                      : '다른 이름으로 다시 검색해 주세요.'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default RecipeIngredientPickerModal;
