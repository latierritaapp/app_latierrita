export interface PostComment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likesCount?: number;
  parentId?: string;
  replyToUsername?: string;
  replies?: PostComment[];
}

export interface ProfilePost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  location?: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  savesCount?: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isTagged?: boolean;
  taggedUsers?: string[];
  disableComments?: boolean;
  hideLikesCount?: boolean;
  hideSavesCount?: boolean;
  comments?: PostComment[];
}

export type ProfileTabType = 'publicaciones' | 'etiquetas' | 'guardados';
