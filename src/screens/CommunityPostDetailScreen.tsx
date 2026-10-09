import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  CommunityCommentPreview,
  CommunityPost,
  getCommunityCommentPreviews,
} from '../api/communityApi';
import CommunityCommentsModal from '../components/community/CommunityCommentsModal';
import CommunityPostCard, {
  formatCommunityCommentDate,
} from '../components/community/CommunityPostCard';
import styles from '../styles/community';

import { API_BASE_URL } from '../config/environment';

interface CommunityPostDetailScreenProps {
  post: CommunityPost | null;
  posts: CommunityPost[];
  token: string;
  onClose: () => void;
  onToggle: (post: CommunityPost, kind: 'like' | 'save') => void;
  onCommentAdded: (postSeq: number) => void;
  onCommentDeleted: (postSeq: number) => void;
  onToast: (message: string) => void;
  currentUserId: string;
  showSaveAction?: boolean;
  toastMessage?: string;
  toastOpacity: Animated.Value;
  toastTranslateY: Animated.Value;
}

function CommunityPostDetailScreen({
  post,
  posts,
  token,
  onClose,
  onToggle,
  onCommentAdded,
  onCommentDeleted,
  onToast,
  currentUserId,
  showSaveAction = true,
  toastMessage = '',
  toastOpacity,
  toastTranslateY,
}: CommunityPostDetailScreenProps) {
  const [commentPreviews, setCommentPreviews] = useState<
    Record<number, CommunityCommentPreview[]>
  >({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewReloadKey, setPreviewReloadKey] = useState(0);
  const [commentsPost, setCommentsPost] = useState<CommunityPost | null>(null);
  const detailPosts = post
    ? [post, ...posts.filter(item => item.postSeq !== post.postSeq)]
    : [];
  const postSeqKey = detailPosts.map(item => item.postSeq).join(',');

  useEffect(() => {
    const postSeqs = postSeqKey
      ? postSeqKey.split(',').map(Number).filter(Number.isFinite)
      : [];
    if (postSeqs.length === 0 || !token) {
      setCommentPreviews({});
      return;
    }

    let active = true;
    setPreviewLoading(true);
    setPreviewError('');
    getCommunityCommentPreviews(token, postSeqs)
      .then(result => {
        if (!active) return;
        const grouped = result.reduce<
          Record<number, CommunityCommentPreview[]>
        >((accumulator, comment) => {
          (accumulator[comment.postSeq] ??= []).push(comment);
          return accumulator;
        }, {});
        setCommentPreviews(grouped);
      })
      .catch(error => {
        if (active) {
          setPreviewError(
            error instanceof Error
              ? error.message
              : '댓글 미리보기를 불러오지 못했습니다.',
          );
        }
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postSeqKey, previewReloadKey, token]);

  const openComments = (targetPost: CommunityPost) => {
    setCommentsPost(targetPost);
  };

  const handleCommentAdded = (postSeq: number) => {
    onCommentAdded(postSeq);
    setPreviewReloadKey(key => key + 1);
  };

  const handleCommentDeleted = (postSeq: number) => {
    onCommentDeleted(postSeq);
    setPreviewReloadKey(key => key + 1);
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const previews = commentPreviews[item.postSeq] ?? [];

    return (
      <View>
        <CommunityPostCard
          post={item}
          token={token}
          onOpen={() => undefined}
          onCommentOpen={openComments}
          onToggle={onToggle}
          showSaveAction={showSaveAction}
        />
        <View style={styles.commentPreviewBlock}>
          {previews.map(comment => (
            <View key={comment.cmtSeq} style={styles.commentPreviewRow}>
              {comment.profileImageFilSeq ? (
                <Image
                  source={{
                    uri: `${API_BASE_URL}/api/community/files/${comment.profileImageFilSeq}`,
                    headers: { Authorization: `Bearer ${token}` },
                  }}
                  style={styles.commentPreviewAvatar}
                />
              ) : (
                <View style={styles.commentPreviewFallback}>
                  <Text style={styles.commentPreviewFallbackText}>
                    {comment.usrNm?.slice(0, 1) || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.commentPreviewBody}>
                <Text style={styles.commentPreviewAuthor}>
                  {comment.usrNm || comment.usrId}
                  <Text style={styles.commentDate}>
                    {'  '}
                    {formatCommunityCommentDate(comment.cmtDtm)}
                  </Text>
                </Text>
                <Text style={styles.commentPreviewText}>{comment.cmtCn}</Text>
              </View>
            </View>
          ))}
          {previewLoading && previews.length === 0 && item.commentCount > 0 ? (
            <ActivityIndicator style={styles.commentsLoading} size="small" />
          ) : null}
          {previewError && item.commentCount > 0 ? (
            <Text style={styles.commentsError}>{previewError}</Text>
          ) : null}
          <Pressable
            accessibilityLabel={`${item.authorName} 게시물 댓글 전체 보기`}
            onPress={() => openComments(item)}
            style={styles.commentPreviewMore}
          >
            <Text style={styles.commentPreviewMoreText}>
              {item.commentCount > 2
                ? `댓글 ${item.commentCount}개 모두 보기`
                : item.commentCount > 0
                ? '댓글 모두 보기'
                : '첫 댓글 남기기'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={!!post}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.detailScreen} edges={['top', 'bottom']}>
          <View style={styles.detailHeader}>
            <Pressable
              onPress={onClose}
              accessibilityLabel="게시물 상세 닫기"
              hitSlop={12}
              style={styles.detailBackButton}
            >
              <Text style={styles.detailBack}>‹</Text>
            </Pressable>
            <Text style={styles.detailTitle}>게시물</Text>
            <View style={styles.detailHeaderSpacer} />
          </View>
          <FlatList
            style={styles.detailList}
            keyboardShouldPersistTaps="handled"
            data={detailPosts}
            keyExtractor={item => String(item.postSeq)}
            renderItem={renderPost}
            ListEmptyComponent={
              <Text style={styles.empty}>게시물이 없습니다.</Text>
            }
          />
          {toastMessage ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.toast,
                {
                  opacity: toastOpacity,
                  transform: [{ translateY: toastTranslateY }],
                },
              ]}
            >
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          ) : null}
          <CommunityCommentsModal
            post={commentsPost}
            token={token}
            currentUserId={currentUserId}
            onClose={() => setCommentsPost(null)}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
            onToast={onToast}
            toastMessage={toastMessage}
            toastOpacity={toastOpacity}
            toastTranslateY={toastTranslateY}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

export default CommunityPostDetailScreen;
