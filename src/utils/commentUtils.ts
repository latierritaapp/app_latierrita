import { PostComment } from '../types/post';

/**
 * Recursively counts the total number of comments including nested replies/subcomments.
 */
export function countTotalComments(comments?: PostComment[]): number {
  if (!comments || !Array.isArray(comments)) return 0;
  return comments.reduce((total, comment) => {
    const repliesCount = Array.isArray(comment.replies) ? countTotalComments(comment.replies) : 0;
    return total + 1 + repliesCount;
  }, 0);
}

/**
 * Checks whether an avatar value is an image URL/path (or base64/asset) vs an emoji/string.
 */
export function isImageAvatar(avatar?: string): boolean {
  if (!avatar) return false;
  return (
    avatar.startsWith('data:') ||
    avatar.startsWith('http') ||
    avatar.startsWith('/') ||
    avatar.includes('.') ||
    avatar.includes('avatar')
  );
}

