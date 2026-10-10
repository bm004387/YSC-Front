import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  addCommunityComment,
  CommunityComment,
  CommunityPost,
  deleteCommunityComment,
  getCommunityComments,
  updateCommunityComment,
} from '../../api/communityApi';
import { formatCommunityCommentDate } from './CommunityPostCard';
import styles from '../../styles/community';
import TextInput from '../common/NoAutofillTextInput';
import useMsg from '../../hooks/useMsg';

import { API_BASE_URL } from '../../config/environment';

interface CommunityCommentsModalProps {
  post: CommunityPost | null;
  token: string;
  currentUserId: string;
  onClose: () => void;
  onCommentAdded: (postSeq: number) => void;
  onCommentDeleted: (postSeq: number) => void;
  onToast: (message: string) => void;
  toastMessage: string;
  toastOpacity: Animated.Value;
  toastTranslateY: Animated.Value;
}

interface ThreadedComment {
  comment: CommunityComment;
  depth: number;
}

function orderCommentsByThread(
  comments: CommunityComment[],
): ThreadedComment[] {
  const commentsById = new Map(
    comments.map(comment => [comment.cmtSeq, comment]),
  );
  const childrenByParent = new Map<number, CommunityComment[]>();
  const visited = new Set<number>();
  const ordered: ThreadedComment[] = [];
  const byTime = (left: CommunityComment, right: CommunityComment) =>
    left.cmtDtm.localeCompare(right.cmtDtm);

  comments.forEach(comment => {
    const parentId = comment.parentCmtSeq;
    if (parentId !== null && commentsById.has(parentId)) {
      const children = childrenByParent.get(parentId) ?? [];
      children.push(comment);
      childrenByParent.set(parentId, children);
    }
  });

  const appendThread = (comment: CommunityComment, depth: number) => {
    if (visited.has(comment.cmtSeq)) return;
    visited.add(comment.cmtSeq);
    ordered.push({ comment, depth });
    (childrenByParent.get(comment.cmtSeq) ?? [])
      .sort(byTime)
      .forEach(child => appendThread(child, depth + 1));
  };

  comments
    .filter(
      comment =>
        comment.parentCmtSeq === null ||
        !commentsById.has(comment.parentCmtSeq),
    )
    .sort(byTime)
    .forEach(comment => appendThread(comment, 0));

  // Keep any orphaned or cyclic legacy rows visible as standalone comments.
  [...comments].sort(byTime).forEach(comment => appendThread(comment, 0));
  return ordered;
}

function CommunityCommentsModal({
  post,
  token,
  currentUserId,
  onClose,
  onCommentAdded,
  onCommentDeleted,
  onToast,
  toastMessage,
  toastOpacity,
  toastTranslateY,
}: CommunityCommentsModalProps) {
  const { getMsg } = useMsg();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState('');
  const [updatingComment, setUpdatingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );
  const [replyTo, setReplyTo] = useState<CommunityComment | null>(null);
  const threadedComments = useMemo(
    () => orderCommentsByThread(comments),
    [comments],
  );
  const commentInputRef =
    React.useRef<React.ElementRef<typeof TextInput>>(null);

  useEffect(() => {
    if (!post) {
      setComments([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setComments([]);
    setEditingCommentId(null);
    setEditInput('');
    setReplyTo(null);
    getCommunityComments(token, post.postSeq)
      .then(result => {
        if (active) setComments(result);
      })
      .catch(requestError => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : getMsg('COMMUNITY', '011'),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getMsg, post?.postSeq, reloadKey, token]);

  const submitComment = async () => {
    const content = commentInput.trim();
    if (!post || !content || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const isReply = replyTo !== null;
      await addCommunityComment(token, post.postSeq, content, replyTo?.cmtSeq);
      setCommentInput('');
      setReplyTo(null);
      setReloadKey(key => key + 1);
      onCommentAdded(post.postSeq);
      onToast(getMsg('COMMON', '016'));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : getMsg('COMMON', '017'),
      );
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
      onToast(getMsg('COMMON', '014'));
    } catch (requestError) {
      Alert.alert(
        getMsg('COMMUNITY', '013'),
        requestError instanceof Error
          ? requestError.message
          : getMsg('COMMON', '015'),
      );
    } finally {
      setUpdatingComment(false);
    }
  };

  const deleteComment = async (comment: CommunityComment) => {
    if (!post || deletingCommentId !== null) return;

    setDeletingCommentId(comment.cmtSeq);
    try {
      await deleteCommunityComment(token, post.postSeq, comment.cmtSeq);
      if (replyTo?.cmtSeq === comment.cmtSeq) setReplyTo(null);
      if (editingCommentId === comment.cmtSeq) setEditingCommentId(null);
      setReloadKey(key => key + 1);
      onCommentDeleted(post.postSeq);
      onToast(getMsg('COMMON', '012'));
    } catch (requestError) {
      Alert.alert(
        getMsg('COMMUNITY', '014'),
        requestError instanceof Error
          ? requestError.message
          : getMsg('COMMON', '013'),
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const confirmDeleteComment = (comment: CommunityComment) => {
    Alert.alert(getMsg('COMMUNITY', '015'), getMsg('COMMON', '009'), [
      { text: getMsg('COMMUNITY', '032'), style: 'cancel' },
      {
        text: getMsg('COMMUNITY', '033'),
        style: 'destructive',
        onPress: () => void deleteComment(comment),
      },
    ]);
  };

  if (!post) return null;
  const activeCommentCount = comments.filter(
    comment => !comment.deleted,
  ).length;

  return (
    <View style={styles.commentsModalRoot}>
      <Pressable
        accessibilityLabel="댓글 창 닫기"
        style={styles.commentsModalBackdrop}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        style={styles.commentsModalSheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.commentsModalContent} edges={['bottom']}>
          <View style={styles.commentsModalHeader}>
            <Text style={styles.commentsModalTitle}>
              댓글 {loading ? post.commentCount : activeCommentCount}
            </Text>
            <Pressable
              accessibilityLabel="댓글 창 닫기"
              onPress={onClose}
              style={styles.commentsModalClose}
            >
              <Text style={styles.commentsModalCloseText}>닫기</Text>
            </Pressable>
          </View>
          {error ? (
            <Pressable
              onPress={() => setReloadKey(key => key + 1)}
              style={styles.commentsModalErrorArea}
            >
              <Text style={styles.commentsError}>{error}</Text>
            </Pressable>
          ) : null}
          {loading ? (
            <ActivityIndicator style={styles.commentsLoading} />
          ) : (
            <FlatList
              style={styles.commentsModalListView}
              data={threadedComments}
              keyExtractor={item => String(item.comment.cmtSeq)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.commentsModalList}
              ListEmptyComponent={
                error ? (
                  <View />
                ) : (
                  <Text style={styles.commentsHint}>
                    {getMsg('COMMUNITY', '034')}
                  </Text>
                )
              }
              renderItem={({ item: threadedComment }) => {
                const { comment, depth } = threadedComment;
                return (
                  <View
                    style={[
                      styles.commentRow,
                      depth > 0 && styles.commentReply,
                      depth > 1 && { marginLeft: Math.min(depth, 4) * 28 },
                    ]}
                  >
                    {comment.profileImageFilSeq ? (
                      <Image
                        source={{
                          uri: `${API_BASE_URL}/api/community/files/${comment.profileImageFilSeq}`,
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
                      {comment.deleted ? (
                        <Text style={styles.commentDeletedText}>
                          {getMsg('COMMUNITY', '035')}
                        </Text>
                      ) : (
                        <>
                          <Text style={styles.commentContent}>
                            {comment.cmtCn}
                          </Text>
                          <View style={styles.commentActions}>
                            <Pressable
                              accessibilityLabel={`${
                                comment.usrNm || comment.usrId
                              }에게 답글 달기`}
                              onPress={() => {
                                setReplyTo(comment);
                                setEditingCommentId(null);
                                setTimeout(
                                  () => commentInputRef.current?.focus(),
                                  0,
                                );
                              }}
                              style={styles.commentActionButton}
                            >
                              <Text style={styles.commentActionText}>
                                답글 달기
                              </Text>
                            </Pressable>
                            {comment.usrId === currentUserId && (
                              <>
                                <Pressable
                                  accessibilityLabel="내 댓글 수정"
                                  onPress={() => {
                                    setEditingCommentId(comment.cmtSeq);
                                    setEditInput(comment.cmtCn);
                                    setReplyTo(null);
                                  }}
                                  style={styles.commentActionButton}
                                >
                                  <Text style={styles.commentActionText}>
                                    수정
                                  </Text>
                                </Pressable>
                                <Pressable
                                  accessibilityLabel="내 댓글 삭제"
                                  disabled={deletingCommentId !== null}
                                  onPress={() => confirmDeleteComment(comment)}
                                  style={styles.commentActionButton}
                                >
                                  <Text style={styles.commentDeleteText}>
                                    {deletingCommentId === comment.cmtSeq
                                      ? '삭제 중'
                                      : '삭제'}
                                  </Text>
                                </Pressable>
                              </>
                            )}
                          </View>
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
                                  onPress={() => void saveCommentEdit(comment)}
                                  style={[
                                    styles.commentEditSaveButton,
                                    (!editInput.trim() || updatingComment) &&
                                      styles.commentSubmitDisabled,
                                  ]}
                                >
                                  <Text style={styles.commentSubmitText}>
                                    {updatingComment ? '저장 중' : '저장'}
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                );
              }}
            />
          )}
          <View style={styles.commentComposer}>
            {replyTo ? (
              <View style={styles.commentReplyNotice}>
                <Text style={styles.commentReplyNoticeText}>
                  {getMsg('COMMUNITY', '036', replyTo.usrNm || replyTo.usrId)}
                </Text>
                <Pressable
                  accessibilityLabel="답글 대상 취소"
                  onPress={() => setReplyTo(null)}
                >
                  <Text style={styles.commentReplyCancel}>취소</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.commentComposerRow}>
              <TextInput
                ref={commentInputRef}
                value={commentInput}
                onChangeText={setCommentInput}
                placeholder={
                  replyTo
                    ? getMsg('COMMUNITY', '037')
                    : getMsg('COMMUNITY', '038')
                }
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
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      {toastMessage ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            styles.commentToast,
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

export default CommunityCommentsModal;
