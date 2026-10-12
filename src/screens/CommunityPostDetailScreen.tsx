import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
import useMsg from '../hooks/useMsg';

import { API_BASE_URL } from '../config/environment';
import { getAvatarColor } from '../utils/avatarColor';
import { getCachedCommonCodeName } from '../utils/commonCodeUtil';

interface CommunityPostDetailScreenProps {
  post: CommunityPost | null;
  posts: CommunityPost[];
  token: string;
  onClose: () => void;
  onToggle: (post: CommunityPost, kind: 'like' | 'save') => void;
  onAuthorPress: (userId: string) => void;
  onCommentAdded: (postSeq: number) => void;
  onCommentDeleted: (postSeq: number) => void;
  onToast: (message: string) => void;
  currentUserId: string;
  showSaveAction?: boolean;
  singlePostOnly?: boolean;
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
  onAuthorPress,
  onCommentAdded,
  onCommentDeleted,
  onToast,
  currentUserId,
  showSaveAction = true,
  singlePostOnly = false,
  toastMessage = '',
  toastOpacity,
  toastTranslateY,
}: CommunityPostDetailScreenProps) {
  const { getMsg } = useMsg();
  const [commentPreviews, setCommentPreviews] = useState<
    Record<number, CommunityCommentPreview[]>
  >({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewReloadKey, setPreviewReloadKey] = useState(0);
  const [commentsPost, setCommentsPost] = useState<CommunityPost | null>(null);
  const [detailListHeight, setDetailListHeight] = useState(0);
  const [lastPostHeight, setLastPostHeight] = useState(0);
  const [visibleVideoPostIds, setVisibleVideoPostIds] = useState<Set<number>>(
    new Set(),
  );
  const detailListRef = useRef<FlatList<CommunityPost>>(null);
  const onVideoViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ item: CommunityPost; isViewable: boolean }>;
    }) => {
      const visibleIds = new Set(
        viewableItems
          .filter(
            ({ isViewable, item }) =>
              isViewable &&
              item.media?.some(
                media =>
                  media.mediaType ===
                  (getCachedCommonCodeName('MEDIA_TYP', '002') ?? 'VIDEO'),
              ),
          )
          .map(({ item }) => item.postSeq),
      );
      setVisibleVideoPostIds(current => {
        if (
          current.size === visibleIds.size &&
          [...current].every(postSeq => visibleIds.has(postSeq))
        ) {
          return current;
        }
        return visibleIds;
      });
    },
  ).current;
  const detailViewabilityPairs = useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: 30,
        minimumViewTime: 0,
      },
      onViewableItemsChanged: onVideoViewableItemsChanged,
    },
  ]).current;
  const detailPosts = post
    ? singlePostOnly
      ? [post]
      : posts.some(item => item.postSeq === post.postSeq)
      ? posts.map(item => (item.postSeq === post.postSeq ? post : item))
      : [post, ...posts]
    : [];
  const postSeqKey = detailPosts.map(item => item.postSeq).join(',');
  const lastPostSeq = detailPosts[detailPosts.length - 1]?.postSeq;
  const footerHeight = Math.max(
    0,
    (detailListHeight || Dimensions.get('window').height) - lastPostHeight,
  );

  useEffect(() => {
    setLastPostHeight(0);
  }, [postSeqKey]);

  useEffect(() => {
    if (!post) return;

    const selectedIndex = detailPosts.findIndex(
      item => item.postSeq === post.postSeq,
    );
    if (selectedIndex < 0) return;

    const scrollToSelectedPost = () => {
      if (selectedIndex === 0) {
        detailListRef.current?.scrollToOffset({ offset: 0, animated: false });
        return;
      }

      detailListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: false,
        viewPosition: 0,
      });
    };

    const firstFrame = requestAnimationFrame(scrollToSelectedPost);
    const retryTimer = setTimeout(scrollToSelectedPost, 120);

    return () => {
      cancelAnimationFrame(firstFrame);
      clearTimeout(retryTimer);
    };
  }, [post?.postSeq, postSeqKey]);

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
            error instanceof Error ? error.message : getMsg('COMMUNITY', '031'),
          );
        }
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getMsg, postSeqKey, previewReloadKey, token]);

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
      <View
        onLayout={({ nativeEvent }) => {
          if (item.postSeq === lastPostSeq) {
            setLastPostHeight(nativeEvent.layout.height);
          }
        }}
      >
        <CommunityPostCard
          post={item}
          token={token}
          autoPlay={visibleVideoPostIds.has(item.postSeq)}
          onOpen={() => undefined}
          onCommentOpen={openComments}
          onToggle={onToggle}
          onAuthorPress={onAuthorPress}
          showSaveAction={showSaveAction}
        />
        <View style={styles.commentPreviewBlock}>
          {previews.map(comment => (
            <View key={comment.cmtSeq} style={styles.commentPreviewRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${comment.usrNm || '사용자'} 프로필 보기`}
                onPress={() => onAuthorPress(comment.usrId)}
              >
                {comment.profileImageFilSeq ? (
                  <Image
                    source={{
                      uri: `${API_BASE_URL}/api/community/files/${comment.profileImageFilSeq}`,
                      headers: { Authorization: `Bearer ${token}` },
                    }}
                    style={styles.commentPreviewAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.commentPreviewFallback,
                      { backgroundColor: getAvatarColor(comment.usrId) },
                    ]}
                  >
                    <Text style={styles.commentPreviewFallbackText}>
                      {comment.usrNm?.slice(0, 1) || '?'}
                    </Text>
                  </View>
                )}
              </Pressable>
              <View style={styles.commentPreviewBody}>
                <View style={styles.commentPreviewAuthorRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${
                      comment.usrNm || '사용자'
                    } 프로필 보기`}
                    onPress={() => onAuthorPress(comment.usrId)}
                  >
                    <Text style={styles.commentPreviewAuthor}>
                      {comment.usrNm || '사용자'}
                    </Text>
                  </Pressable>
                  <Text style={styles.commentDate}>
                    {'  '}
                    {formatCommunityCommentDate(comment.cmtDtm)}
                  </Text>
                </View>
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
            <Text numberOfLines={1} style={styles.detailTitle}>
              {post?.authorName || '게시물'}
            </Text>
            <View style={styles.detailHeaderSpacer} />
          </View>
          <FlatList
            ref={detailListRef}
            style={styles.detailList}
            onLayout={({ nativeEvent }) =>
              setDetailListHeight(nativeEvent.layout.height)
            }
            keyboardShouldPersistTaps="handled"
            data={detailPosts}
            viewabilityConfigCallbackPairs={detailViewabilityPairs}
            keyExtractor={item => String(item.postSeq)}
            renderItem={renderPost}
            ListFooterComponent={<View style={{ height: footerHeight }} />}
            onScrollToIndexFailed={({ index, averageItemLength }) => {
              detailListRef.current?.scrollToOffset({
                offset: averageItemLength * index,
                animated: false,
              });
              setTimeout(() => {
                detailListRef.current?.scrollToIndex({
                  index,
                  animated: false,
                  viewPosition: 0,
                });
              }, 50);
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>{getMsg('COMMUNITY', '044')}</Text>
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
            onAuthorPress={userId => {
              setCommentsPost(null);
              onAuthorPress(userId);
            }}
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
