import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import TextInput from '../components/common/NoAutofillTextInput';
import CommunityPostCard from '../components/community/CommunityPostCard';
import {
  CommunityPost,
  CommunityUserSearchResult,
  searchCommunityPosts,
  searchCommunityUsers,
} from '../api/communityApi';
import styles from '../styles/community';
import { API_BASE_URL } from '../config/environment';
import useMsg from '../hooks/useMsg';

type SearchTab = 'posts' | 'users';
type UserFilter = 'discover' | 'following' | 'followers';

interface CommunitySearchScreenProps {
  token: string;
  followingUserIds: string[];
  onToggleFollow: (
    userId: string,
    currentlyFollowing: boolean,
  ) => Promise<boolean>;
  onUserSelect: (userId: string) => void;
  onPostOpen: (post: CommunityPost) => void;
  onAuthorPress: (userId: string) => void;
  onPostToggle: (post: CommunityPost, kind: 'like' | 'save') => void;
}

function CommunitySearchScreen({
  token,
  followingUserIds,
  onToggleFollow,
  onUserSelect,
  onPostOpen,
  onAuthorPress,
  onPostToggle,
}: CommunitySearchScreenProps) {
  const { getMsg } = useMsg();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<SearchTab>('posts');
  const [userFilter, setUserFilter] = useState<UserFilter>('discover');
  const [searchPosts, setSearchPosts] = useState<CommunityPost[]>([]);
  const [users, setUsers] = useState<CommunityUserSearchResult[]>([]);
  const [followOverrides, setFollowOverrides] = useState<
    Record<string, boolean>
  >({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const followingSet = useMemo(
    () => new Set(followingUserIds),
    [followingUserIds],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();

  useEffect(() => {
    let active = true;
    const keyword = query.trim();
    if (!keyword) {
      setSearchPosts([]);
      setUsers([]);
      setSearchError('');
      setSearchLoading(false);
      return () => {
        active = false;
      };
    }

    setSearchLoading(true);
    setSearchError('');
    if (tab === 'posts') setSearchPosts([]);
    else setUsers([]);
    const timer = setTimeout(() => {
      const request =
        tab === 'posts'
          ? searchCommunityPosts(token, keyword).then(result => {
              if (active) setSearchPosts(result);
            })
          : searchCommunityUsers(token, keyword, userFilter).then(result => {
              if (active) setUsers(result);
            });

      request
        .catch(error => {
          if (active) {
            setSearchError(
              error instanceof Error
                ? error.message
                : getMsg('COMMUNITY', '030'),
            );
          }
        })
        .finally(() => {
          if (active) setSearchLoading(false);
        });
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [getMsg, query, tab, token, userFilter]);

  const renderUser = ({ item }: { item: CommunityUserSearchResult }) => {
    const isFollowing =
      followOverrides[item.usrId] ??
      (item.following || followingSet.has(item.usrId));

    return (
      <View style={styles.searchUserRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.usrNm} 프로필 보기`}
          onPress={() => onUserSelect(item.usrId)}
          style={styles.searchUserIdentity}
        >
          {item.profileImageFilSeq ? (
            <Image
              source={{
                uri: `${API_BASE_URL}/api/community/files/${item.profileImageFilSeq}`,
                headers: { Authorization: `Bearer ${token}` },
              }}
              style={styles.searchUserAvatar}
            />
          ) : (
            <View style={styles.searchUserAvatarFallback}>
              <Text style={styles.searchUserAvatarText}>
                {item.usrNm.slice(0, 1) || '?'}
              </Text>
            </View>
          )}
          <View style={styles.searchUserDetails}>
            <Text numberOfLines={1} style={styles.searchUserName}>
              {item.usrNm}
            </Text>
            <Text numberOfLines={1} style={styles.searchUserId}>
              @{item.usrId} · 게시물 {item.postCount}개
            </Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel={
            isFollowing ? `${item.usrNm} 팔로우 취소` : `${item.usrNm} 팔로우`
          }
          onPress={async () => {
            setFollowOverrides(current => ({
              ...current,
              [item.usrId]: !isFollowing,
            }));
            const saved = await onToggleFollow(item.usrId, isFollowing);
            if (!saved) {
              setFollowOverrides(current => ({
                ...current,
                [item.usrId]: isFollowing,
              }));
            }
          }}
          style={[
            styles.searchFollowButton,
            isFollowing && styles.searchFollowingButton,
          ]}
        >
          <Text
            style={[
              styles.searchFollowButtonText,
              isFollowing && styles.searchFollowingButtonText,
            ]}
          >
            {isFollowing ? '팔로잉' : '팔로우'}
          </Text>
        </Pressable>
      </View>
    );
  };

  const emptySearchResult = (emptyMessageCode: string) =>
    searchLoading ? (
      <ActivityIndicator />
    ) : (
      <Text style={styles.searchEmptyText}>
        {searchError ||
          getMsg('COMMUNITY', normalizedQuery ? emptyMessageCode : '046')}
      </Text>
    );

  return (
    <View style={styles.searchScreen}>
      <View style={styles.searchInputWrap}>
        <Text style={styles.searchGlyph}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={getMsg('COMMUNITY', '045')}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {query ? (
          <Pressable
            accessibilityLabel="검색어 지우기"
            onPress={() => setQuery('')}
            hitSlop={10}
          >
            <Text style={styles.searchClear}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.searchTabs}>
        {(['posts', 'users'] as const).map(item => (
          <Pressable
            key={item}
            onPress={() => setTab(item)}
            style={styles.searchTab}
          >
            <Text
              style={[
                styles.searchTabText,
                tab === item && styles.searchTabTextActive,
              ]}
            >
              {item === 'posts' ? '게시물' : '사용자'}
            </Text>
            {tab === item ? <View style={styles.searchTabIndicator} /> : null}
          </Pressable>
        ))}
      </View>

      {tab === 'posts' ? (
        <FlatList
          data={searchPosts}
          keyExtractor={item => String(item.postSeq)}
          renderItem={({ item }) => (
            <CommunityPostCard
              post={item}
              token={token}
              onOpen={onPostOpen}
              onAuthorPress={onAuthorPress}
              onToggle={onPostToggle}
              showSaveAction
            />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            searchPosts.length ? styles.searchPostList : styles.searchEmptyList
          }
          ListEmptyComponent={emptySearchResult('047')}
        />
      ) : (
        <>
          <View style={styles.searchUserFilters}>
            {(['discover', 'following', 'followers'] as const).map(item => (
              <Pressable
                key={item}
                onPress={() => setUserFilter(item)}
                style={[
                  styles.searchUserFilter,
                  userFilter === item && styles.searchUserFilterActive,
                ]}
              >
                <Text
                  style={[
                    styles.searchUserFilterText,
                    userFilter === item && styles.searchUserFilterTextActive,
                  ]}
                >
                  {item === 'discover'
                    ? '검색 결과'
                    : item === 'following'
                    ? `팔로잉 ${followingUserIds.length}`
                    : '팔로워'}
                </Text>
              </Pressable>
            ))}
          </View>
          <FlatList
            data={users}
            keyExtractor={item => item.usrId}
            renderItem={renderUser}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              users.length ? styles.searchUserList : styles.searchEmptyList
            }
            ListEmptyComponent={emptySearchResult('048')}
          />
        </>
      )}
    </View>
  );
}

export default CommunitySearchScreen;
