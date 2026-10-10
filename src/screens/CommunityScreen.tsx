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
  CommunityUserProfile,
  CommunityRelationType,
  getCommunityFeed,
  getCommunityUserPosts,
  getCommunityUserProfile,
  getMyCommunityPosts,
  getCommunityProfileSummary,
  getSavedCommunityPosts,
  removeCommunityFollower,
  markCommunityPostSeen,
  setCommunityReaction,
  setCommunityFollow,
} from '../api/communityApi';
import { getAuthCredentials } from '../storage/tokenStorage';
import useMsg from '../hooks/useMsg';
import CommunityPostDetailScreen from './CommunityPostDetailScreen';
import CommunitySearchScreen from './CommunitySearchScreen';
import CommunityFollowListScreen from './CommunityFollowListScreen';
import styles from '../styles/community';

import { API_BASE_URL } from '../config/environment';
type CommunityView =
  | 'feed'
  | 'mine'
  | 'saved'
  | 'search'
  | 'profile'
  | 'follows';

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
  const [profileUser, setProfileUser] = useState<CommunityUserProfile | null>(
    null,
  );
  const [communityView, setCommunityView] = useState<CommunityView>('feed');
  const [followingUserIds, setFollowingUserIds] = useState<string[]>([]);
  const [followPageType, setFollowPageType] =
    useState<CommunityRelationType>('followers');
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
        setError(e instanceof Error ? e.message : getMsg('COMMUNITY', '024'));
      } finally {
        setLoading(false);
      }
    },
    [getMsg, token],
  );

  const loadMyPosts = useCallback(
    async (authToken = token) => {
      if (!authToken) return;
      setLoading(true);
      setError(null);
      try {
        setPosts(await getMyCommunityPosts(authToken));
      } catch (e) {
        setError(e instanceof Error ? e.message : getMsg('COMMUNITY', '025'));
      } finally {
        setLoading(false);
      }
    },
    [getMsg, token],
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
        setError(e instanceof Error ? e.message : getMsg('COMMUNITY', '026'));
      } finally {
        setLoading(false);
      }
    },
    [getMsg, token],
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
        setError(getMsg('COMMUNITY', '027'));
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

  const openFollowList = (relationType: CommunityRelationType) => {
    setFollowPageType(relationType);
    setCommunityView('follows');
  };

  const returnToMyPosts = () => {
    setCommunityView('mine');
  };

  const openAuthorProfile = async (userId: string) => {
    setSelectedPost(null);
    if (userId === myId) {
      openMyPosts();
      return;
    }
    setCommunityView('profile');
    setProfileUser(null);
    setLoading(true);
    setError(null);
    seenIds.current.clear();
    try {
      const [profile, userPosts] = await Promise.all([
        getCommunityUserProfile(token, userId),
        getCommunityUserPosts(token, userId),
      ]);
      setProfileUser(profile);
      setFollowingUserIds(current =>
        profile.following
          ? current.includes(userId)
            ? current
            : [...current, userId]
          : current.filter(id => id !== userId),
      );
      setPosts(userPosts);
    } catch (e) {
      setError(e instanceof Error ? e.message : getMsg('COMMUNITY', '028'));
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (
    userId: string,
    currentlyFollowing: boolean,
  ): Promise<boolean> => {
    const enabled = !currentlyFollowing;
    const updateFollowingIds = (isFollowing: boolean) =>
      setFollowingUserIds(current => {
        const alreadyFollowing = current.includes(userId);
        if (isFollowing === alreadyFollowing) return current;
        return isFollowing
          ? [...current, userId]
          : current.filter(id => id !== userId);
      });
    updateFollowingIds(enabled);
    setProfileUser(current =>
      current?.usrId === userId
        ? {
            ...current,
            following: enabled,
            followerCount: Math.max(
              0,
              current.followerCount + (enabled ? 1 : -1),
            ),
          }
        : current,
    );
    try {
      await setCommunityFollow(token, userId, enabled);
      showToast(getMsg('COMMUNITY', enabled ? '003' : '004'));
      return true;
    } catch (e) {
      updateFollowingIds(currentlyFollowing);
      setProfileUser(current =>
        current?.usrId === userId
          ? {
              ...current,
              following: currentlyFollowing,
              followerCount: Math.max(
                0,
                current.followerCount + (enabled ? -1 : 1),
              ),
            }
          : current,
      );
      Alert.alert(
        getMsg('COMMUNITY', '005'),
        e instanceof Error ? e.message : getMsg('COMMUNITY', '023'),
      );
      return false;
    }
  };

  const toggleProfileFollow = () => {
    if (profileUser) {
      void toggleFollow(profileUser.usrId, profileUser.following);
    }
  };

  const openSearch = () => {
    setCommunityView('search');
  };

  const toggleSearchFollow = (userId: string, currentlyFollowing: boolean) => {
    return toggleFollow(userId, currentlyFollowing);
  };

  const removeFollower = async (userId: string): Promise<boolean> => {
    try {
      await removeCommunityFollower(token, userId);
      return true;
    } catch (e) {
      Alert.alert(
        getMsg('COMMUNITY', '005'),
        e instanceof Error ? e.message : getMsg('COMMUNITY', '023'),
      );
      return false;
    }
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
        showToast(getMsg('COMMON', next ? '010' : '021'));
      }
      if (kind === 'save' && !next && communityView === 'saved') {
        setPosts(current =>
          current.filter(item => item.postSeq !== post.postSeq),
        );
      }
    } catch (e) {
      updatePost(post.postSeq, current => adjustCount(current, !next));
      Alert.alert(
        getMsg('COMMUNITY', '006'),
        e instanceof Error ? e.message : getMsg('COMMON', '022'),
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
    } else if (communityView === 'profile' && profileUser) {
      setLoading(true);
      setError(null);
      void Promise.all([
        getCommunityUserProfile(token, profileUser.usrId),
        getCommunityUserPosts(token, profileUser.usrId),
      ])
        .then(([profile, userPosts]) => {
          setProfileUser(profile);
          setPosts(userPosts);
        })
        .catch(e =>
          setError(e instanceof Error ? e.message : getMsg('COMMUNITY', '028')),
        )
        .finally(() => setLoading(false));
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
            onPress={communityView === 'follows' ? returnToMyPosts : showFeed}
            accessibilityLabel={
              communityView === 'follows'
                ? '내 게시물로 돌아가기'
                : '커뮤니티 홈 피드로 이동'
            }
            style={styles.headerBackButton}
          >
            <Text style={styles.headerBackButtonText}>‹</Text>
          </Pressable>
        )}
        <View style={styles.titleButton}>
          <Text style={styles.title}>
            {communityView === 'profile'
              ? profileUser?.usrNm || '프로필'
              : communityView === 'follows'
              ? '팔로우'
              : '커뮤니티'}
          </Text>
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
      {communityView !== 'follows' ? (
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
          <Pressable
            accessibilityLabel="게시물 및 사용자 검색"
            onPress={openSearch}
            style={[
              styles.communityNavItem,
              communityView === 'search' && styles.communityNavItemActive,
            ]}
          >
            <Text
              style={[
                styles.communityNavText,
                communityView === 'search' && styles.communityNavTextActive,
              ]}
            >
              검색
            </Text>
          </Pressable>
        </View>
      ) : null}
      {communityView === 'mine' || communityView === 'profile' ? (
        <View style={styles.myPostsBar}>
          {communityView === 'profile' && profileUser?.profileImageFilSeq ? (
            <Image
              source={{
                uri: `${API_BASE_URL}/api/community/files/${profileUser.profileImageFilSeq}`,
                headers: { Authorization: `Bearer ${token}` },
              }}
              style={[styles.avatar, styles.myAvatar, styles.avatarImage]}
            />
          ) : communityView === 'profile' ? (
            <View style={[styles.avatar, styles.myAvatar]}>
              <Text style={styles.avatarText}>
                {profileUser?.usrNm.slice(0, 1) || '?'}
              </Text>
            </View>
          ) : posts[0] ? (
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
                {(communityView === 'profile'
                  ? profileUser?.postCount ?? 0
                  : profileSummary.postCount
                ).toLocaleString()}
              </Text>
              <Text style={styles.myPostsCaption}>게시물</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="팔로워 목록 보기"
              disabled={communityView !== 'mine'}
              onPress={() => openFollowList('followers')}
              style={styles.myPostsStat}
            >
              <Text style={styles.myPostsTitle}>
                {(communityView === 'profile'
                  ? profileUser?.followerCount ?? 0
                  : profileSummary.followerCount
                ).toLocaleString()}
              </Text>
              <Text style={styles.myPostsCaption}>팔로워</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="팔로잉 목록 보기"
              disabled={communityView !== 'mine'}
              onPress={() => openFollowList('following')}
              style={styles.myPostsStat}
            >
              <Text style={styles.myPostsTitle}>
                {(communityView === 'profile'
                  ? profileUser?.followingCount ?? 0
                  : profileSummary.followingCount
                ).toLocaleString()}
              </Text>
              <Text style={styles.myPostsCaption}>팔로잉</Text>
            </Pressable>
          </View>
          {communityView === 'profile' && profileUser ? (
            <Pressable
              accessibilityLabel={
                profileUser.following ? '팔로우 취소' : '팔로우'
              }
              onPress={() => void toggleProfileFollow()}
              style={[
                styles.profileFollowButton,
                profileUser.following && styles.profileFollowingButton,
              ]}
            >
              <Text
                style={[
                  styles.profileFollowText,
                  profileUser.following && styles.profileFollowingText,
                ]}
              >
                {profileUser.following ? '팔로잉' : '팔로우'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : communityView === 'saved' ? (
        <View style={styles.savedListBar}>
          <Text style={styles.savedListTitle}>저장한 게시물</Text>
          <Text style={styles.savedListCount}>{posts.length}개</Text>
        </View>
      ) : null}
      {communityView === 'follows' ? (
        <CommunityFollowListScreen
          token={token}
          relationType={followPageType}
          followerCount={profileSummary.followerCount}
          followingCount={profileSummary.followingCount}
          onRelationTypeChange={setFollowPageType}
          onUserSelect={openAuthorProfile}
          onToggleFollow={toggleFollow}
          onRemoveFollower={removeFollower}
          onRelationChanged={() => void loadProfileSummary(token)}
        />
      ) : communityView === 'search' ? (
        <CommunitySearchScreen
          token={token}
          followingUserIds={followingUserIds}
          onToggleFollow={toggleSearchFollow}
          onUserSelect={openAuthorProfile}
          onPostOpen={openPostDetail}
          onAuthorPress={openAuthorProfile}
          onPostToggle={(post, kind) => void toggleReaction(post, kind)}
        />
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{error}</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retry}>{getMsg('COMMUNITY', '023')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          key={communityView === 'mine' ? 'my-posts-grid' : communityView}
          removeClippedSubviews={false}
          data={posts}
          keyExtractor={post => String(post.postSeq)}
          numColumns={
            communityView === 'mine' || communityView === 'profile' ? 3 : 1
          }
          renderItem={
            communityView === 'mine' || communityView === 'profile'
              ? renderMyPostTile
              : ({ item }) => (
                  <CommunityPostCard
                    post={item}
                    token={token}
                    onOpen={openPostDetail}
                    onAuthorPress={openAuthorProfile}
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
                ? getMsg('COMMUNITY', '041')
                : communityView === 'profile'
                ? getMsg('COMMUNITY', '044')
                : communityView === 'saved'
                ? getMsg('COMMUNITY', '042')
                : getMsg('COMMUNITY', '043')}
            </Text>
          }
          columnWrapperStyle={
            (communityView === 'mine' || communityView === 'profile') &&
            posts.length
              ? styles.gridRow
              : undefined
          }
          contentContainerStyle={
            posts.length
              ? communityView === 'mine' || communityView === 'profile'
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
        onAuthorPress={openAuthorProfile}
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
