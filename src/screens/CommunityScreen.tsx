import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleProp,
  StatusBar,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import CommunityPostComposerModal from '../components/community/CommunityPostComposerModal';
import CommunityPostCard from '../components/community/CommunityPostCard';
import {
  CommunityPost,
  CommunityProfileSummary,
  getCommunityFeed,
  getMyCommunityPosts,
  getCommunityProfileSummary,
  getSavedCommunityPosts,
  markCommunityPostSeen,
  setCommunityReaction,
} from '../api/communityApi';
import { getAuthCredentials } from '../storage/tokenStorage';
import useMsg from '../hooks/useMsg';
import CommunityPostDetailScreen from './CommunityPostDetailScreen';
import styles from '../styles/community';

import { API_BASE_URL } from '../config/environment';
type CommunityView = 'feed' | 'mine' | 'saved';

interface CommunityScreenProps {
  onBack: () => void;
}

function CommunityScreen({ onBack }: CommunityScreenProps) {
  const { getMsg } = useMsg();
  const [token, setToken] = useState('');
  const [myId, setMyId] = useState('');
  const [profileSummary, setProfileSummary] = useState<CommunityProfileSummary>(
    {
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
    },
  );
  const [communityView, setCommunityView] = useState<CommunityView>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composerVisible, setComposerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(8)).current;
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedPostIndex = useRef(0);
  const seenIds = useRef(new Set<number>());
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const myPostsRef = useRef(communityView !== 'feed');
  myPostsRef.current = communityView !== 'feed';

  useEffect(
    () => () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastOpacity.stopAnimation();
      toastTranslateY.stopAnimation();
    },
    [toastOpacity, toastTranslateY],
  );

  const showToast = (message: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastOpacity.stopAnimation();
    toastTranslateY.stopAnimation();
    toastOpacity.setValue(0);
    toastTranslateY.setValue(8);
    setToastMessage(message);
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
    toastTimeout.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setToastMessage('');
        toastTimeout.current = null;
      });
    }, 1750);
  };

  const loadFeed = useCallback(
    async (authToken = token) => {
      if (!authToken) return;
      setLoading(true);
      setError(null);
      try {
        setPosts(await getCommunityFeed(authToken, 'recommended'));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : '커뮤니티를 불러오지 못했습니다.',
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const loadMyPosts = useCallback(
    async (authToken = token) => {
      if (!authToken) return;
      setLoading(true);
      setError(null);
      try {
        setPosts(await getMyCommunityPosts(authToken));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : '내 게시물을 불러오지 못했습니다.',
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const loadProfileSummary = useCallback(
    async (authToken = token) => {
      if (!authToken) return;
      try {
        setProfileSummary(await getCommunityProfileSummary(authToken));
      } catch (e) {
        console.warn('커뮤니티 프로필 통계 조회 실패', e);
      }
    },
    [token],
  );

  const loadSavedPosts = useCallback(
    async (authToken = token) => {
      if (!authToken) return;
      setLoading(true);
      setError(null);
      try {
        setPosts(await getSavedCommunityPosts(authToken));
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : '저장한 게시물을 불러오지 못했습니다.',
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void (async () => {
      const credentials = await getAuthCredentials();
      const authToken =
        credentials && credentials.password ? credentials.password : '';
      setMyId(credentials && credentials.username ? credentials.username : '');
      setToken(authToken);
      if (authToken) await loadFeed(authToken);
      else {
        setError('로그인 후 이용해 주세요.');
        setLoading(false);
      }
    })();
    // Session is read once when this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMyPosts = () => {
    setCommunityView('mine');
    seenIds.current.clear();
    void loadMyPosts(token);
    void loadProfileSummary(token);
  };

  const openSavedPosts = () => {
    setCommunityView('saved');
    seenIds.current.clear();
    void loadSavedPosts(token);
  };

  const showFeed = () => {
    setCommunityView('feed');
    seenIds.current.clear();
    void loadFeed(token);
  };

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ item: CommunityPost; isViewable: boolean }>;
    }) => {
      viewableItems.forEach(({ item, isViewable }) => {
        if (
          isViewable &&
          !myPostsRef.current &&
          !seenIds.current.has(item.postSeq) &&
          tokenRef.current
        ) {
          seenIds.current.add(item.postSeq);
          void markCommunityPostSeen(tokenRef.current, item.postSeq).catch(e =>
            console.warn('게시물 조회 기록 실패', e),
          );
        }
      });
    },
  ).current;

  const updatePost = (
    postSeq: number,
    updater: (post: CommunityPost) => CommunityPost,
  ) => {
    setPosts(current =>
      current.map(post => (post.postSeq === postSeq ? updater(post) : post)),
    );
    setSelectedPost(current =>
      current?.postSeq === postSeq ? updater(current) : current,
    );
  };

  const openPostDetail = (post: CommunityPost) => {
    const index = posts.findIndex(item => item.postSeq === post.postSeq);
    selectedPostIndex.current = index < 0 ? 0 : index;
    setSelectedPost(post);
  };

  const closePostDetail = () => {
    const post = selectedPost;
    setSelectedPost(null);
    if (!post || (communityView === 'saved' && !post.savedByMe)) return;

    setPosts(current => {
      if (current.some(item => item.postSeq === post.postSeq)) return current;

      const insertAt = Math.min(selectedPostIndex.current, current.length);
      return [...current.slice(0, insertAt), post, ...current.slice(insertAt)];
    });
  };

  const toggleReaction = async (post: CommunityPost, kind: 'like' | 'save') => {
    const field = kind === 'like' ? 'likedByMe' : 'savedByMe';
    const next = !post[field];
    const adjustCount = (current: CommunityPost, enabled: boolean) => ({
      ...current,
      [field]: enabled,
      ...(kind === 'like'
        ? { likeCount: current.likeCount + (enabled ? 1 : -1) }
        : {}),
    });
    updatePost(post.postSeq, current => adjustCount(current, next));
    try {
      await setCommunityReaction(token, post.postSeq, kind, next);
      if (kind === 'save') {
        showToast(getMsg('COMMUNITY', next ? '001' : '002'));
      }
      if (kind === 'save' && !next && communityView === 'saved') {
        setPosts(current =>
          current.filter(item => item.postSeq !== post.postSeq),
        );
      }
    } catch (e) {
      updatePost(post.postSeq, current => adjustCount(current, !next));
      Alert.alert(
        '요청 실패',
        e instanceof Error ? e.message : '다시 시도해 주세요.',
      );
    }
  };

  const handleCommentAdded = (postSeq: number) => {
    updatePost(postSeq, current => ({
      ...current,
      commentCount: current.commentCount + 1,
    }));
  };

  const handleCommentDeleted = (postSeq: number) => {
    updatePost(postSeq, current => ({
      ...current,
      commentCount: Math.max(0, current.commentCount - 1),
    }));
  };

  const renderAvatar = (
    post: CommunityPost,
    avatarStyle: StyleProp<ViewStyle>,
    textStyle: StyleProp<TextStyle>,
  ) => (
    <View style={[styles.avatar, avatarStyle]}>
      {post.profileImageFilSeq ? (
        <Image
          source={{
            uri: `${API_BASE_URL}/api/community/files/${post.profileImageFilSeq}`,
            headers: { Authorization: `Bearer ${token}` },
          }}
          style={styles.avatarImage}
        />
      ) : (
        <Text style={[styles.avatarText, textStyle]}>
          {post.authorName?.slice(0, 1) || '?'}
        </Text>
      )}
    </View>
  );

  const renderMyPostTile = ({ item }: { item: CommunityPost }) => {
    const firstMedia = item.media?.[0];
    return (
      <Pressable
        style={styles.gridTile}
        onPress={() => openPostDetail(item)}
        accessibilityLabel={`${item.authorName} 게시물 상세 보기`}
      >
        {firstMedia?.mediaType === 'IMAGE' ? (
          <Image
            source={{
              uri: `${API_BASE_URL}/api/community/files/${firstMedia.filSeq}`,
              headers: { Authorization: `Bearer ${token}` },
            }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.gridEmpty}>
            <Text style={styles.gridEmptyGlyph}>
              {firstMedia?.mediaType === 'VIDEO' ? '▶' : '▤'}
            </Text>
          </View>
        )}
        {item.media?.length > 1 && (
          <View style={styles.gridMultipleBadge}>
            <Text style={styles.gridBadgeText}>▧</Text>
          </View>
        )}
        {!firstMedia && (
          <Text numberOfLines={3} style={styles.gridCaption}>
            {item.content}
          </Text>
        )}
      </Pressable>
    );
  };

  const refresh = () => {
    if (communityView === 'mine') {
      void loadMyPosts();
      void loadProfileSummary();
    } else if (communityView === 'saved') {
      void loadSavedPosts();
    } else {
      void loadFeed();
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {communityView === 'feed' ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="뒤로가기"
            style={styles.headerBackButton}
          >
            <Text style={styles.headerBackButtonText}>‹</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={showFeed}
            accessibilityLabel="커뮤니티 홈 피드로 이동"
            style={styles.headerBackButton}
          >
            <Text style={styles.headerBackButtonText}>‹</Text>
          </Pressable>
        )}
        <View style={styles.titleButton}>
          <Text style={styles.title}>커뮤니티</Text>
        </View>
        {communityView === 'mine' ? (
          <Pressable
            accessibilityLabel="게시물 작성"
            onPress={() => setComposerVisible(true)}
            style={styles.create}
          >
            <Text style={styles.createGlyph}>＋</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.communityNav}>
        <Pressable
          onPress={openMyPosts}
          style={[
            styles.communityNavItem,
            communityView === 'mine' && styles.communityNavItemActive,
          ]}
        >
          <Text
            style={[
              styles.communityNavText,
              communityView === 'mine' && styles.communityNavTextActive,
            ]}
          >
            내 게시물
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="저장한 게시물 보기"
          onPress={openSavedPosts}
          style={[
            styles.communityNavItem,
            communityView === 'saved' && styles.communityNavItemActive,
          ]}
        >
          <Text
            style={[
              styles.communityNavText,
              communityView === 'saved' && styles.communityNavTextActive,
            ]}
          >
            저장됨
          </Text>
        </Pressable>
      </View>
      {communityView === 'mine' ? (
        <View style={styles.myPostsBar}>
          {posts[0] ? (
            renderAvatar(posts[0], styles.myAvatar, styles.myAvatarText)
          ) : (
            <View style={[styles.avatar, styles.myAvatar]}>
              <Text style={styles.avatarText}>
                {myId.slice(0, 1).toUpperCase() || '나'}
              </Text>
            </View>
          )}
          <View style={styles.myPostsInfo}>
            <View style={styles.myPostsStat}>
              <Text style={styles.myPostsTitle}>
                {profileSummary.postCount.toLocaleString()}
              </Text>
              <Text style={styles.myPostsCaption}>게시물</Text>
            </View>
            <View style={styles.myPostsStat}>
              <Text style={styles.myPostsTitle}>
                {profileSummary.followerCount.toLocaleString()}
              </Text>
              <Text style={styles.myPostsCaption}>팔로워</Text>
            </View>
            <View style={styles.myPostsStat}>
              <Text style={styles.myPostsTitle}>
                {profileSummary.followingCount.toLocaleString()}
              </Text>
              <Text style={styles.myPostsCaption}>팔로잉</Text>
            </View>
          </View>
        </View>
      ) : communityView === 'saved' ? (
        <View style={styles.savedListBar}>
          <Text style={styles.savedListTitle}>저장한 게시물</Text>
          <Text style={styles.savedListCount}>{posts.length}개</Text>
        </View>
      ) : null}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{error}</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retry}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          key={communityView === 'mine' ? 'my-posts-grid' : communityView}
          removeClippedSubviews={false}
          data={posts}
          keyExtractor={post => String(post.postSeq)}
          numColumns={communityView === 'mine' ? 3 : 1}
          renderItem={
            communityView === 'mine'
              ? renderMyPostTile
              : ({ item }) => (
                  <CommunityPostCard
                    post={item}
                    token={token}
                    onOpen={openPostDetail}
                    onToggle={(post, kind) => void toggleReaction(post, kind)}
                    showSaveAction={communityView !== 'saved'}
                  />
                )
          }
          onRefresh={refresh}
          refreshing={loading}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 55,
            minimumViewTime: 800,
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {communityView === 'mine'
                ? '아직 작성한 게시물이 없습니다.'
                : communityView === 'saved'
                ? '저장한 게시물이 없습니다.'
                : '새 게시물이 없습니다.'}
            </Text>
          }
          columnWrapperStyle={
            communityView === 'mine' && posts.length
              ? styles.gridRow
              : undefined
          }
          contentContainerStyle={
            posts.length
              ? communityView === 'mine'
                ? styles.gridList
                : styles.list
              : styles.emptyList
          }
        />
      )}
      <CommunityPostDetailScreen
        post={selectedPost}
        posts={posts}
        token={token}
        onClose={closePostDetail}
        onToggle={toggleReaction}
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
        onToast={showToast}
        currentUserId={myId}
        showSaveAction={communityView !== 'saved'}
        toastMessage={toastMessage}
        toastOpacity={toastOpacity}
        toastTranslateY={toastTranslateY}
      />
      <CommunityPostComposerModal
        visible={composerVisible}
        token={token}
        onClose={() => setComposerVisible(false)}
        onPublished={async () => {
          seenIds.current.clear();
          if (communityView === 'mine') {
            await Promise.all([loadMyPosts(token), loadProfileSummary(token)]);
          } else if (communityView === 'saved') await loadSavedPosts(token);
          else await loadFeed(token);
        }}
      />
      {toastMessage && !selectedPost ? (
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
    </View>
  );
}

export default CommunityScreen;
