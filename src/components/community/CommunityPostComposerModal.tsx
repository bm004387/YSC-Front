import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import { createCommunityPost } from '../../api/communityApi';
import styles from '../../styles/community';
import TextInput from '../common/NoAutofillTextInput';
import useMsg from '../../hooks/useMsg';
import {
  getCommonCodeValues,
  isCachedCommonCodeValue,
} from '../../utils/commonCodeUtil';

const MAX_ATTACHMENTS = 5;

interface CommunityPostComposerModalProps {
  visible: boolean;
  token: string;
  onClose: () => void;
  onPublished: () => Promise<void> | void;
}

function CommunityPostComposerModal({
  visible,
  token,
  onClose,
  onPublished,
}: CommunityPostComposerModalProps) {
  const { getMsg } = useMsg();
  const [caption, setCaption] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [posting, setPosting] = useState(false);

  const chooseMedia = async (mediaType: 'photo' | 'video') => {
    const remainingCount = MAX_ATTACHMENTS - assets.length;
    if (remainingCount <= 0) {
      Alert.alert(
        getMsg('COMMUNITY', '017'),
        getMsg('COMMUNITY', '018', MAX_ATTACHMENTS),
      );
      return;
    }

    const result = await launchImageLibrary({
      mediaType,
      selectionLimit: remainingCount,
    });
    if (!result.didCancel && result.assets) {
      const contentTypes = await getCommonCodeValues('CONT_TYP');
      const expectedPrefix = mediaType === 'photo' ? 'image/' : 'video/';
      const acceptedAssets = result.assets.filter(asset => {
        const contentType = asset.type?.toLowerCase();
        return (
          !!asset.uri &&
          !!contentType?.startsWith(expectedPrefix) &&
          contentTypes.includes(contentType)
        );
      });
      setAssets(current => {
        const existingUris = new Set(current.map(asset => asset.uri));
        const addedAssets = acceptedAssets.filter(
          asset => asset.uri && !existingUris.has(asset.uri),
        );
        return [...current, ...addedAssets].slice(0, MAX_ATTACHMENTS);
      });
    }
    if (result.errorMessage)
      Alert.alert(getMsg('COMMUNITY', '019'), result.errorMessage);
  };

  const removeAsset = (removeIndex: number) => {
    setAssets(current => current.filter((_, index) => index !== removeIndex));
  };

  const moveAsset = (assetIndex: number, direction: -1 | 1) => {
    setAssets(current => {
      const destination = assetIndex + direction;
      if (destination < 0 || destination >= current.length) return current;

      const reordered = [...current];
      [reordered[assetIndex], reordered[destination]] = [
        reordered[destination],
        reordered[assetIndex],
      ];
      return reordered;
    });
  };

  const publish = async () => {
    if (!caption.trim()) {
      Alert.alert(getMsg('COMMUNITY', '020'), getMsg('COMMUNITY', '021'));
      return;
    }
    setPosting(true);
    try {
      await createCommunityPost(
        token,
        caption.trim(),
        assets
          .filter(asset => !!asset.uri)
          .map(asset => ({
            uri: asset.uri!,
            fileName: asset.fileName,
            type: asset.type,
          })),
      );
      setCaption('');
      setAssets([]);
      onClose();
      await onPublished();
    } catch (e) {
      Alert.alert(
        getMsg('COMMUNITY', '022'),
        e instanceof Error ? e.message : getMsg('COMMUNITY', '023'),
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.composerHeader}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancel}>취소</Text>
            </Pressable>
            <Text style={styles.composerTitle}>새 게시물</Text>
            <Pressable disabled={posting} onPress={() => void publish()}>
              <Text style={styles.share}>{posting ? '등록 중' : '공유'}</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.composerBody}
          >
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder={getMsg('COMMUNITY', '049')}
              multiline
              textAlignVertical="top"
              style={styles.input}
            />
            <View style={styles.pickers}>
              <Pressable
                onPress={() => void chooseMedia('photo')}
                style={styles.picker}
              >
                <Text>▧ 사진 선택</Text>
              </Pressable>
              <Pressable
                onPress={() => void chooseMedia('video')}
                style={styles.picker}
              >
                <Text>▶ 동영상 선택</Text>
              </Pressable>
            </View>
            {!!assets.length && (
              <>
                <Text style={styles.selected}>
                  첨부 순서 · {assets.length}/{MAX_ATTACHMENTS}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.previewList}
                >
                  {assets.map((asset, index) => {
                    const isVideo =
                      isCachedCommonCodeValue(
                        'CONT_TYP',
                        asset.type?.toLowerCase(),
                      ) &&
                      asset.type?.toLowerCase().startsWith('video/');
                    return (
                      <View
                        key={`${asset.uri}-${index}`}
                        style={styles.previewCard}
                      >
                        {!isVideo && asset.uri ? (
                          <Image
                            source={{ uri: asset.uri }}
                            style={styles.previewImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.previewVideo}>
                            <Text style={styles.previewPlayGlyph}>▶</Text>
                            <Text style={styles.previewVideoLabel}>동영상</Text>
                          </View>
                        )}
                        <View style={styles.orderBadge}>
                          <Text style={styles.orderBadgeText}>{index + 1}</Text>
                        </View>
                        <Pressable
                          accessibilityLabel={`${index + 1}번 첨부 삭제`}
                          onPress={() => removeAsset(index)}
                          style={styles.removeAssetButton}
                        >
                          <Text style={styles.removeAssetGlyph}>×</Text>
                        </Pressable>
                        <View style={styles.reorderButtons}>
                          <Pressable
                            accessibilityLabel={`${
                              index + 1
                            }번 첨부 앞으로 이동`}
                            disabled={index === 0}
                            onPress={() => moveAsset(index, -1)}
                            style={styles.reorderButton}
                          >
                            <Text
                              style={[
                                styles.reorderGlyph,
                                index === 0 && styles.disabledGlyph,
                              ]}
                            >
                              ‹
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityLabel={`${index + 1}번 첨부 뒤로 이동`}
                            disabled={index === assets.length - 1}
                            onPress={() => moveAsset(index, 1)}
                            style={styles.reorderButton}
                          >
                            <Text
                              style={[
                                styles.reorderGlyph,
                                index === assets.length - 1 &&
                                  styles.disabledGlyph,
                              ]}
                            >
                              ›
                            </Text>
                          </Pressable>
                        </View>
                        {!!asset.fileName && (
                          <Text
                            numberOfLines={1}
                            style={styles.previewFileName}
                          >
                            {asset.fileName}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}
            <Text style={styles.notice}>
              화살표로 표시 순서를 바꿀 수 있고, 삭제하면 순번이 자동으로
              당겨집니다.
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default CommunityPostComposerModal;
