import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  addCommunityComment,
  CommunityComment,
  CommunityPost,
  getCommunityComments,
  updateCommunityComment,
} from '../api/communityApi';
import CommunityPostCard, {
  formatCommunityCommentDate,
} from '../components/community/CommunityPostCard';
import styles from '../styles/community';

const BASE_URL = 'https://ysc-dev.duckdns.org';

interface CommunityPostDetailScreenProps {
  post: CommunityPost | null;
  token: string;
  onClose: () => void;
  onToggle: (post: CommunityPost, kind: 'like' | 'save') => void;
  onCommentAdded: (postSeq: number) => void;
  currentUserId: string;
  showSaveAction?: boolean;
  toastMessage?: string;
  toastOpacity: Animated.Value;
  toastTranslateY: Animated.Value;
}

function CommunityPostDetailScreen({
  post,
  token,
  onClose,
  onToggle,
  onCommentAdded,
  currentUserId,
  showSaveAction = true,
  toastMessage = '',
  toastOpacity,
  toastTranslateY,
}: CommunityPostDetailScreenProps) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState('');
  const [updatingComment, setUpdatingComment] = useState(false);

  useEffect(() => {
    if (!post) {
      setComments([]);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    getCommunityComments(token, post.postSeq)
      .then(result => {
        if (active) setComments(result);
      })
      .catch(e => {
        if (active) {
          setError(
            e instanceof Error ? e.message : '댓글을 불러오지 못했습니다.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [post?.postSeq, reloadKey, token]);

  const submitComment = async () => {
    const content = commentInput.trim();
    if (!post || !content || submitting) return;

    setSubmitting(true);
    try {
      await addCommunityComment(token, post.postSeq, content);
      setCommentInput('');
      setReloadKey(key => key + 1);
      onCommentAdded(post.postSeq);
    } catch (e) {
      setError(e instanceof Error ? e.message : '댓글을 등록하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveCommentEdit = async (comment: CommunityComment) => {
    const content = editInput.trim();
    if (!post || !content || updatingComment) return;

    setUpdatingComment(true);
    try {
      await updateCommunityComment(
        token,
        post.postSeq,
        comment.cmtSeq,
        content,
      );
      setComments(current =>
        current.map(item =>
          item.cmtSeq === comment.cmtSeq ? { ...item, cmtCn: content } : item,
        ),
      );
      setEditingCommentId(null);
      setEditInput('');
    } catch (e) {
      Alert.alert(
        '댓글 수정 실패',
        e instanceof Error ? e.message : '다시 시도해 주세요.',
      );
    } finally {
      setUpdatingComment(false);
    }
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
          <KeyboardAvoidingView
            style={styles.detailContent}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
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
            {post && (
              <FlatList
                style={styles.detailList}
                keyboardShouldPersistTaps="handled"
                data={[post]}
                keyExtractor={item => String(item.postSeq)}
                renderItem={() => (
                  <CommunityPostCard
                    post={post}
                    token={token}
                    onOpen={() => undefined}
                    onToggle={onToggle}
                    showSaveAction={showSaveAction}
                  />
                )}
                ListFooterComponent={
                  <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>
                      댓글 {comments.length || post.commentCount}
                    </Text>
                    {loading ? (
                      <ActivityIndicator style={styles.commentsLoading} />
                    ) : error ? (
                      <Pressable onPress={() => setReloadKey(key => key + 1)}>
                        <Text style={styles.commentsError}>{error}</Text>
                      </Pressable>
                    ) : comments.length ? (
                      comments.map(comment => (
                        <View
                          key={comment.cmtSeq}
                          style={[
                            styles.commentRow,
                            Boolean(comment.parentCmtSeq) &&
                              styles.commentReply,
                          ]}
                        >
                          {comment.profileImageFilSeq ? (
                            <Image
                              source={{
                                uri: `${BASE_URL}/api/community/files/${comment.profileImageFilSeq}`,
                                headers: { Authorization: `Bearer ${token}` },
                              }}
                              style={styles.commentAvatar}
                            />
                          ) : (
                            <View style={styles.commentAvatarFallback}>
                              <Text style={styles.commentAvatarText}>
                                {comment.usrNm?.slice(0, 1) || '?'}
                              </Text>
                            </View>
                          )}
                          <View style={styles.commentBody}>
                            <Text style={styles.commentAuthor}>
                              {comment.usrNm || comment.usrId}
                              <Text style={styles.commentDate}>
                                {'  '}
                                {formatCommunityCommentDate(comment.cmtDtm)}
                              </Text>
                            </Text>
                            <Text style={styles.commentContent}>
                              {comment.cmtCn}
                            </Text>
                            {comment.usrId === currentUserId && (
                              <Pressable
                                accessibilityLabel="내 댓글 수정"
                                onPress={() => {
                                  setEditingCommentId(comment.cmtSeq);
                                  setEditInput(comment.cmtCn);
                                }}
                                style={styles.commentEditButton}
                              >
                                <Text style={styles.commentEditText}>수정</Text>
                              </Pressable>
                            )}
                            {editingCommentId === comment.cmtSeq && (
                              <View style={styles.commentEditArea}>
                                <TextInput
                                  value={editInput}
                                  onChangeText={setEditInput}
                                  multiline
                                  maxLength={2000}
                                  editable={!updatingComment}
                                  style={styles.commentEditInput}
                                />
                                <View style={styles.commentEditActions}>
                                  <Pressable
                                    onPress={() => {
                                      setEditingCommentId(null);
                                      setEditInput('');
                                    }}
                                  >
                                    <Text style={styles.commentEditCancel}>
                                      취소
                                    </Text>
                                  </Pressable>
                                  <Pressable
                                    disabled={
                                      !editInput.trim() || updatingComment
                                    }
                                    onPress={() =>
                                      void saveCommentEdit(comment)
                                    }
                                    style={[
                                      styles.commentSubmitButton,
                                      (!editInput.trim() || updatingComment) &&
                                        styles.commentSubmitDisabled,
                                    ]}
                                  >
                                    <Text style={styles.commentSubmitText}>
                                      {updatingComment
                                        ? '저장 중'
                                        : '수정 저장'}
                                    </Text>
                                  </Pressable>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.commentsHint}>
                        아직 댓글이 없습니다.
                      </Text>
                    )}
                  </View>
                }
              />
            )}
            <View style={styles.commentComposer}>
              <TextInput
                value={commentInput}
                onChangeText={setCommentInput}
                placeholder="댓글을 입력하세요"
                multiline
                maxLength={2000}
                editable={!submitting}
                style={styles.commentInput}
              />
              <Pressable
                onPress={() => void submitComment()}
                disabled={!commentInput.trim() || submitting}
                style={[
                  styles.commentSubmitButton,
                  (!commentInput.trim() || submitting) &&
                    styles.commentSubmitDisabled,
                ]}
              >
                <Text style={styles.commentSubmitText}>
                  {submitting ? '등록 중' : '등록'}
                </Text>
              </Pressable>
            </View>
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
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

export default CommunityPostDetailScreen;
