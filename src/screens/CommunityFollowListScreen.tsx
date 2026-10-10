import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  CommunityRelationType,
  CommunityUserSearchResult,
  getCommunityFollowUsers,
} from '../api/communityApi';
import { API_BASE_URL } from '../config/environment';
import useMsg from '../hooks/useMsg';
import styles from '../styles/communityFollow';

interface CommunityFollowListScreenProps {
  token: string;
  relationType: CommunityRelationType;
  followerCount: number;
  followingCount: number;
  onRelationTypeChange: (type: CommunityRelationType) => void;
  onUserSelect: (userId: string) => void;
  onToggleFollow: (
    userId: string,
    currentlyFollowing: boolean,
  ) => Promise<boolean>;
  onRelationChanged: () => void;
}

function CommunityFollowListScreen({
  token,
  relationType,
  followerCount,
  followingCount,
  onRelationTypeChange,
  onUserSelect,
  onToggleFollow,
  onRelationChanged,
}: CommunityFollowListScreenProps) {
  const { getMsg } = useMsg();
  const [users, setUsers] = useState<CommunityUserSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(await getCommunityFollowUsers(token, relationType));
    } catch (e) {
      setError(e instanceof Error ? e.message : getMsg('COMMUNITY', '029'));
    } finally {
      setLoading(false);
    }
  }, [getMsg, relationType, token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const toggleFollow = async (user: CommunityUserSearchResult) => {
    const wasFollowing = user.following;
    setUsers(current =>
      current.map(item =>
        item.usrId === user.usrId
          ? { ...item, following: !wasFollowing }
          : item,
      ),
    );
    const success = await onToggleFollow(user.usrId, wasFollowing);
    if (success) {
      onRelationChanged();
    } else {
      setUsers(current =>
        current.map(item =>
          item.usrId === user.usrId
            ? { ...item, following: wasFollowing }
            : item,
        ),
      );
    }
  };

  const renderUser = ({ item }: { item: CommunityUserSearchResult }) => (
    <View style={styles.userRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.usrNm} 프로필 보기`}
        onPress={() => onUserSelect(item.usrId)}
        style={styles.userIdentity}
      >
        {item.profileImageFilSeq ? (
          <Image
            source={{
              uri: `${API_BASE_URL}/api/community/files/${item.profileImageFilSeq}`,
              headers: { Authorization: `Bearer ${token}` },
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {item.usrNm.slice(0, 1) || '?'}
            </Text>
          </View>
        )}
        <View style={styles.userText}>
          <Text numberOfLines={1} style={styles.userName}>
            {item.usrNm}
          </Text>
          <Text numberOfLines={1} style={styles.userId}>
            @{item.usrId} · 게시물 {item.postCount}개
          </Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={
          item.following
            ? `${item.usrNm} 팔로우 취소`
            : `${item.usrNm} 맞팔로우`
        }
        onPress={() => void toggleFollow(item)}
        style={[styles.followButton, item.following && styles.followingButton]}
      >
        <Text
          style={[styles.followText, item.following && styles.followingText]}
        >
          {item.following
            ? '팔로잉'
            : relationType === 'followers'
            ? '맞팔로우'
            : '팔로우'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: relationType === 'followers' }}
          onPress={() => onRelationTypeChange('followers')}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              relationType === 'followers' && styles.activeTabText,
            ]}
          >
            팔로워 {followerCount.toLocaleString()}
          </Text>
          {relationType === 'followers' ? (
            <View style={styles.tabIndicator} />
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: relationType === 'following' }}
          onPress={() => onRelationTypeChange('following')}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              relationType === 'following' && styles.activeTabText,
            ]}
          >
            팔로잉 {followingCount.toLocaleString()}
          </Text>
          {relationType === 'following' ? (
            <View style={styles.tabIndicator} />
          ) : null}
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable
            onPress={() => void loadUsers()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>{getMsg('COMMUNITY', '023')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.usrId}
          renderItem={renderUser}
          contentContainerStyle={users.length ? styles.list : styles.emptyList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {relationType === 'followers'
                ? getMsg('COMMUNITY', '039')
                : getMsg('COMMUNITY', '040')}
            </Text>
          }
          refreshing={loading}
          onRefresh={() => void loadUsers()}
        />
      )}
    </View>
  );
}

export default CommunityFollowListScreen;
