import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import RecipeCategories from '../../components/recipes/RecipeCategories';
import RecipeHeader from '../../components/recipes/RecipeHeader';
import RecipeIngredientPickerModal, { type RecipePickerOption } from '../../components/recipes/RecipeIngredientPickerModal';
import type { CommonCodeItem } from '../../api/commonCodeApi';
import type { RecipeDraft, RecipeIngredientDraft } from '../../types/recipe';
import styles from '../../styles/recipeApp';

const INGREDIENT_GROUP_PREFIX = 'RCP_INGR_';
const UNIT_GROUP_CODE = 'RCP_UNIT';

function isIngredientCodeGroup(code: string): boolean {
  const normalizedCode = code.trim().toUpperCase();
  return normalizedCode === 'RCP_INGR'
    || normalizedCode === 'INGR'
    || normalizedCode.startsWith(INGREDIENT_GROUP_PREFIX)
    || normalizedCode.startsWith('INGR_');
}

function RecipeCreateScreen({
  onBack,
  onSubmit,
  commonCodes,
  commonCodesLoading,
  categories,
}: {
  onBack: () => void;
  onSubmit: (draft: RecipeDraft) => void;
  commonCodes: CommonCodeItem[];
  commonCodesLoading: boolean;
  categories: Array<{ code: string; name: string }>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('집밥');
  const [cookingMinutes, setCookingMinutes] = useState('20');
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([]);
  const [steps, setSteps] = useState('');
  const [titleError, setTitleError] = useState('');
  const [ingredientError, setIngredientError] = useState('');
  const [pickerMode, setPickerMode] = useState<'ingredient' | 'unit' | null>(null);
  const [unitTargetIndex, setUnitTargetIndex] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);

  const ingredientGroups = useMemo(() => {
    const groups = new Map<string, { code: string; name: string; items: RecipePickerOption[]; sortOrd: number }>();
    commonCodes.forEach(item => {
      const code = item.comCd.trim().toUpperCase();
      if (!isIngredientCodeGroup(code)) return;
      const group = groups.get(code) ?? {
        code,
        name: item.comCdNm || '재료',
        items: [],
        sortOrd: item.comCdSortOrd ?? Number.MAX_SAFE_INTEGER,
      };
      group.items.push({
        groupCode: code,
        groupName: group.name,
        code: item.comDtlCd,
        name: item.comDtlDesc || item.comDtlNm,
      });
      groups.set(code, group);
    });
    return [...groups.values()]
      .sort((left, right) => left.sortOrd - right.sortOrd || left.code.localeCompare(right.code))
      .map(({ sortOrd: _sortOrd, ...group }) => group);
  }, [commonCodes]);

  const unitOptions = useMemo(() => commonCodes
    .filter(item => item.comCd.trim().toUpperCase() === UNIT_GROUP_CODE)
    .map(item => ({
      groupCode: UNIT_GROUP_CODE,
      groupName: item.comCdNm || '계량 단위',
      code: item.comDtlCd,
      name: item.comDtlDesc || item.comDtlNm,
    })), [commonCodes]);

  const submit = () => {
    if (!title.trim()) {
      setTitleError('레시피 이름을 입력해 주세요.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      requestAnimationFrame(() => titleInputRef.current?.focus());
      return;
    }
    if (ingredients.some(item => item.amount.trim() && !item.unitCode)) {
      setIngredientError('수량을 입력한 재료의 계량 단위를 선택해 주세요.');
      scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    onSubmit({ title, description, category, cookingMinutes, ingredients, steps });
  };

  const addIngredient = (item: RecipePickerOption) => {
    setIngredients(current => [...current, {
      ingredientGroupCode: item.groupCode,
      ingredientCode: item.code,
      ingredientName: item.name,
      amount: '',
      unitCode: '',
      unitName: '',
    }]);
    setPickerMode(null);
    setIngredientError('');
  };

  const setUnit = (item: RecipePickerOption) => {
    if (unitTargetIndex !== null) {
      setIngredients(current => current.map((ingredient, index) => index === unitTargetIndex
        ? { ...ingredient, unitCode: item.code, unitName: item.name }
        : ingredient));
    }
    setPickerMode(null);
    setUnitTargetIndex(null);
    setIngredientError('');
  };

  return (
    <>
      <RecipeHeader title="레시피 작성" onBack={onBack} right={(
        <Pressable accessibilityRole="button" onPress={submit} style={styles.publishButton}>
          <Text style={styles.publishButtonText}>등록</Text>
        </Pressable>
      )} />
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.composerContent}>
        <View style={styles.photoUpload}>
          <View style={styles.photoIconWrap}><Text style={styles.photoIcon}>＋</Text></View>
          <Text style={styles.photoTitle}>완성 사진을 추가해 보세요</Text>
          <Text style={styles.photoCaption}>사진 선택 기능은 다음 연결 단계에서 추가할 수 있어요.</Text>
        </View>
        <FieldLabel label="레시피 이름" required />
        <TextInput
          ref={titleInputRef}
          value={title}
          onChangeText={value => { setTitle(value); setTitleError(''); }}
          placeholder="예: 엄마표 김치볶음밥"
          placeholderTextColor="#A99B90"
          style={styles.formInput}
          maxLength={40}
        />
        {!!titleError && <Text style={styles.formError}>{titleError}</Text>}
        <FieldLabel label="한 줄 소개" />
        <TextInput value={description} onChangeText={setDescription} placeholder="이 레시피의 매력을 소개해 주세요" placeholderTextColor="#A99B90" style={styles.formInput} maxLength={100} />
        <FieldLabel label="요리 종류" />
        <RecipeCategories selected={category} onSelect={setCategory} categories={categories} includeAll={false} />
        <FieldLabel label="조리 시간" />
        <View style={styles.timeInputRow}>
          <TextInput value={cookingMinutes} onChangeText={setCookingMinutes} keyboardType="number-pad" style={[styles.formInput, styles.timeInput]} />
          <Text style={styles.timeUnit}>분</Text>
        </View>
        <FieldLabel label="재료" hint="공통코드에서 재료와 계량 단위를 선택해 주세요" />
        {ingredients.length > 0 ? (
          <View style={styles.ingredientList}>
            {ingredients.map((ingredient, index) => (
              <View key={`${ingredient.ingredientGroupCode}:${ingredient.ingredientCode}:${index}`} style={styles.ingredientEditRow}>
                <Text numberOfLines={2} style={styles.ingredientEditName}>{ingredient.ingredientName}</Text>
                <TextInput
                  value={ingredient.amount}
                  onChangeText={value => {
                    const amount = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    setIngredients(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, amount } : item));
                    setIngredientError('');
                  }}
                  placeholder="수량"
                  placeholderTextColor="#A99B90"
                  keyboardType="decimal-pad"
                  style={styles.ingredientAmountInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${ingredient.ingredientName} 계량 단위 선택`}
                  onPress={() => { setUnitTargetIndex(index); setPickerMode('unit'); }}
                  style={styles.ingredientUnitButton}>
                  <Text numberOfLines={1} style={styles.ingredientUnitText}>{ingredient.unitName || '단위 선택'}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${ingredient.ingredientName} 삭제`}
                  onPress={() => setIngredients(current => current.filter((_, itemIndex) => itemIndex !== index))}
                  style={styles.ingredientRemoveButton}>
                  <Text style={styles.ingredientRemoveText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.ingredientEmptyText}>
            {commonCodesLoading ? '재료 공통코드를 불러오는 중입니다.' : '아직 선택한 재료가 없어요.'}
          </Text>
        )}
        <Pressable onPress={() => setPickerMode('ingredient')} style={styles.ingredientAddButton}>
          <Text style={styles.ingredientAddGlyph}>＋</Text>
          <Text style={styles.ingredientAddText}>재료 추가</Text>
        </Pressable>
        {!!ingredientError && <Text style={styles.formError}>{ingredientError}</Text>}
        <FieldLabel label="만드는 순서" hint="순서를 한 줄에 하나씩 적어주세요" />
        <TextInput value={steps} onChangeText={setSteps} placeholder={'재료를 손질해요.\n팬에 재료를 볶아요.\n맛있게 담아 완성해요.'} placeholderTextColor="#A99B90" style={[styles.formInput, styles.multilineInput, styles.stepsInput]} multiline textAlignVertical="top" />
        <Pressable accessibilityRole="button" onPress={submit} style={styles.submitRecipeButton}>
          <Text style={styles.submitRecipeButtonText}>레시피 등록하기</Text>
        </Pressable>
      </ScrollView>
      <RecipeIngredientPickerModal
        visible={pickerMode === 'ingredient'}
        title="재료 선택"
        mode="ingredient"
        groups={ingredientGroups}
        onClose={() => setPickerMode(null)}
        onSelect={addIngredient}
      />
      <RecipeIngredientPickerModal
        visible={pickerMode === 'unit'}
        title="계량 단위 선택"
        mode="unit"
        items={unitOptions}
        onClose={() => { setPickerMode(null); setUnitTargetIndex(null); }}
        onSelect={setUnit}
      />
    </>
  );
}

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>{label}{required ? <Text style={styles.requiredMark}> *</Text> : null}</Text>
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
}

export default RecipeCreateScreen;
