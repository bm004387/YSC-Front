import { API_BASE_URL } from '../config/environment';

export interface CommunityMedia {
  filSeq: number;
  mediaType: 'IMAGE' | 'VIDEO';
  contentType: string;
}
export interface CommunityPost {
  postSeq: number;
  authorId: string;
  authorName: string;
  profileImageFilSeq: number | null;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  media: CommunityMedia[];
}
export interface CommunityComment {
  cmtSeq: number;
  parentCmtSeq: number | null;
  usrId: string;
  usrNm: string;
  profileImageFilSeq: number | null;
  cmtCn: string;
  cmtDtm: string;
  deleted?: boolean;
}
export interface CommunityCommentPreview extends CommunityComment {
  postSeq: number;
}
export interface CommunityProfileSummary {
  postCount: number;
  followerCount: number;
  followingCount: number;
}
export type CommunityFeedType =
  | 'recommended'
  | 'following'
  | 'popular'
  | 'saved';

export async function getCommunityFeed(
  token: string,
  type: CommunityFeedType,
  limit = 50,
): Promise<CommunityPost[]> {
  return request(`/api/community/feed?type=${type}&limit=${limit}`, token);
}
export async function getCommunityComments(
  token: string,
  postSeq: number,
): Promise<CommunityComment[]> {
  return request(`/api/community/posts/${postSeq}/comments`, token);
}
export async function getCommunityCommentPreviews(
  token: string,
  postSeqs: number[],
): Promise<CommunityCommentPreview[]> {
  if (postSeqs.length === 0) return [];
  const query = postSeqs.map(postSeq => `postSeq=${postSeq}`).join('&');
  return request(`/api/community/comments/previews?${query}`, token);
}
export async function addCommunityComment(
  token: string,
  postSeq: number,
  content: string,
  parentCmtSeq?: number | null,
) {
  return request(`/api/community/posts/${postSeq}/comments`, token, {
    method: 'POST',
    body: JSON.stringify({ content, parentCmtSeq: parentCmtSeq ?? null }),
  });
}
export async function updateCommunityComment(
  token: string,
  postSeq: number,
  cmtSeq: number,
  content: string,
) {
  return request(`/api/community/posts/${postSeq}/comments/${cmtSeq}`, token, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}
export async function deleteCommunityComment(
  token: string,
  postSeq: number,
  cmtSeq: number,
) {
  return request(`/api/community/posts/${postSeq}/comments/${cmtSeq}`, token, {
    method: 'DELETE',
  });
}
export async function getMyCommunityPosts(
  token: string,
): Promise<CommunityPost[]> {
  return request('/api/community/feed?type=mine&limit=50', token);
}
export async function getCommunityProfileSummary(
  token: string,
): Promise<CommunityProfileSummary> {
  return request('/api/community/profile/summary', token);
}
export async function getSavedCommunityPosts(
  token: string,
): Promise<CommunityPost[]> {
  return request('/api/community/feed?type=saved&limit=50', token);
}
export async function setCommunityReaction(
  token: string,
  postSeq: number,
  kind: 'like' | 'save',
  enabled: boolean,
) {
  return request(`/api/community/posts/${postSeq}/${kind}`, token, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
}
export async function markCommunityPostSeen(token: string, postSeq: number) {
  return request(`/api/community/posts/${postSeq}/seen`, token, {
    method: 'POST',
  });
}
export async function createCommunityPost(
  token: string,
  content: string,
  files: Array<{ uri: string; fileName?: string | null; type?: string | null }>,
) {
  const body = new FormData();
  body.append('content', content);
  body.append('visibility', 'PUBLIC');
  files.forEach((file, index) =>
    body.append('files', {
      uri: file.uri,
      name: file.fileName || `upload-${index}`,
      type: file.type || 'application/octet-stream',
    } as unknown as Blob),
  );
  return request('/api/community/posts', token, {
    method: 'POST',
    body,
    multipart: true,
  });
}
async function request<T = unknown>(
  path: string,
  token: string,
  options: RequestInit & { multipart?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (!options.multipart) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data?.message || `요청에 실패했습니다. (${response.status})`,
    );
  return data as T;
}
