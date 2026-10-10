import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { CommunityPost } from '../../api/communityApi';
import styles from '../../styles/community';

import { API_BASE_URL } from '../../config/environment';

interface CommunityPostCardProps {
  post: CommunityPost;
  token: string;
  onOpen: (post: CommunityPost) => void;
  onCommentOpen?: (post: CommunityPost) => void;
  onToggle: (post: CommunityPost, kind: 'like' | 'save') => void;
  onAuthorPress?: (userId: string) => void;
  showSaveAction?: boolean;
}

function CommunityPostCard({
  post,
  token,
  onOpen,
  onCommentOpen,
  onToggle,
  onAuthorPress,
  showSaveAction = true,
}: CommunityPostCardProps) {
  const mediaItems = post.media ?? [];
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [post.postSeq]);

  const updateActiveMediaIndex = (offsetX: number) => {
    const pageWidth = Dimensions.get('window').width;
    const pageIndex = Math.round(offsetX / pageWidth);
    setActiveMediaIndex(
      Math.min(Math.max(pageIndex, 0), mediaItems.length - 1),
    );
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${post.authorName || post.authorId} 프로필 보기`}
          disabled={!onAuthorPress}
          onPress={() => onAuthorPress?.(post.authorId)}
          style={styles.postAuthorPressable}
        >
          <View style={styles.avatar}>
            {post.profileImageFilSeq ? (
              <Image
                source={{
                  uri: `${API_BASE_URL}/api/community/files/${post.profileImageFilSeq}`,
                  headers: { Authorization: `Bearer ${token}` },
                }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {post.authorName?.slice(0, 1) || '?'}
              </Text>
            )}
          </View>
          <View style={styles.author}>
            <Text style={styles.authorName}>
              {post.authorName || post.authorId}
            </Text>
            <Text style={styles.meta}>
              @{post.authorId} · {formatDate(post.createdAt)}
            </Text>
          </View>
        </Pressable>
        <Text style={styles.more}>···</Text>
      </View>
      <Pressable onPress={() => onOpen(post)}>
        <Text style={styles.caption}>{post.content}</Text>
      </Pressable>
      {mediaItems.length > 0 && (
        <View style={styles.mediaGalleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.mediaGallery}
            scrollEventThrottle={16}
            onScroll={event => {
              updateActiveMediaIndex(event.nativeEvent.contentOffset.x);
            }}
            onMomentumScrollEnd={event => {
              updateActiveMediaIndex(event.nativeEvent.contentOffset.x);
            }}
          >
            {mediaItems.map(media => {
              const uri = `${API_BASE_URL}/api/community/files/${media.filSeq}`;
              const isImage = media.mediaType === 'IMAGE';

              return (
                <Pressable
                  key={media.filSeq}
                  style={styles.mediaFrame}
                  onPress={() => onOpen(post)}
                >
                  {isImage ? (
                    <Image
                      source={{
                        uri,
                        headers: { Authorization: `Bearer ${token}` },
                      }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.videoPreview}>
                      <Text style={styles.videoPlayGlyph}>▶</Text>
                      <Text style={styles.videoPreviewText}>동영상</Text>
                    </View>
                  )}
                  {!isImage && (
                    <View style={styles.videoBadge}>
                      <Text style={styles.videoText}>▶ 동영상</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
          {mediaItems.length > 1 && (
            <View pointerEvents="none" style={styles.mediaCountBadge}>
              <Text style={styles.videoText}>
                {activeMediaIndex + 1} / {mediaItems.length}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <Pressable onPress={() => onToggle(post, 'like')}>
            <Text style={[styles.actionGlyph, post.likedByMe && styles.liked]}>
              {post.likedByMe ? '♥' : '♡'}
            </Text>
          </Pressable>
          <Text style={styles.count}>{post.likeCount}</Text>
          <Pressable
            style={styles.commentAction}
            onPress={() => (onCommentOpen ?? onOpen)(post)}
          >
            <View style={styles.commentBubble}>
              <View style={styles.commentBubbleTail} />
            </View>
            <Text style={styles.count}>{post.commentCount}</Text>
          </Pressable>
        </View>
        {showSaveAction && (
          <Pressable
            accessibilityLabel={
              post.savedByMe ? '게시물 저장 해제' : '게시물 저장'
            }
            style={styles.saveAction}
            onPress={() => onToggle(post, 'save')}
          >
            <Image
              source={
                post.savedByMe
                  ? require('../../../assets/community/bookmark-filled.png')
                  : require('../../../assets/community/bookmark-outline.png')
              }
              style={styles.bookmarkIcon}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function formatCommunityDate(value: string) {
  return formatCommunityCommentDate(value);
}

export function formatCommunityCommentDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/.exec(
    value,
  );
  if (!match) return value;

  const [, year, month, day, hourValue, minute, second] = match;
  const hour = Number(hourValue);
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;

  return `${year}/${month}/${day} ${period} ${hour12}:${minute}:${second}`;
}

const formatDate = formatCommunityDate;

export default CommunityPostCard;
