import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  MoreHorizontal, 
  Tag, 
  Check, 
  X, 
  Sparkles, 
  Trash2,
  Pencil,
  Copy,
  Flag
} from 'lucide-react';
import { ProfilePost, PostComment } from '../types/post';
import { AppUser } from '../types/auth';
import { EditPostModal } from './EditPostModal';
import { CommentsBottomSheet } from './CommentsBottomSheet';
import { countTotalComments, isImageAvatar } from '../utils/commentUtils';

interface ProfileFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: ProfilePost[];
  initialPostId?: string;
  feedTitle: string;
  currentUser: AppUser;
  usersList?: AppUser[];
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void;
  onDeleteComment?: (postId: string, commentId: string, parentCommentId?: string) => void;
  onUpdatePostOptions?: (postId: string, options: { disableComments?: boolean; hideLikesCount?: boolean; hideSavesCount?: boolean }) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (updatedPost: ProfilePost) => void;
  onViewProfile?: (username: string) => void;
}

export const ProfileFeedModal: React.FC<ProfileFeedModalProps> = ({
  isOpen,
  onClose,
  posts,
  initialPostId,
  feedTitle,
  currentUser,
  usersList,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onEditPost,
  onViewProfile
}) => {
  const [doubleTapHeartPostId, setDoubleTapHeartPostId] = useState<string | null>(null);
  const [copiedLinkPostId, setCopiedLinkPostId] = useState<string | null>(null);
  const [activeMenuPost, setActiveMenuPost] = useState<ProfilePost | null>(null);
  const [editingPost, setEditingPost] = useState<ProfilePost | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<ProfilePost | null>(null);

  const postRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Safe posts array
  const safePosts = Array.isArray(posts) ? posts : [];

  // Scroll to initial selected post when modal opens
  useEffect(() => {
    if (isOpen && initialPostId) {
      setTimeout(() => {
        const targetElement = postRefs.current[initialPostId];
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [isOpen, initialPostId]);

  // Keep activeCommentsPost in sync when posts array changes
  useEffect(() => {
    if (activeCommentsPost) {
      const updated = safePosts.find(p => p.id === activeCommentsPost.id);
      if (updated) {
        setActiveCommentsPost(updated);
      }
    }
  }, [posts]);

  if (!isOpen) return null;

  const handleDoubleTap = (postId: string) => {
    onToggleLike(postId);
    setDoubleTapHeartPostId(postId);
    setTimeout(() => {
      setDoubleTapHeartPostId(null);
    }, 800);
  };

  const handleShare = async (postId: string) => {
    setCopiedLinkPostId(postId);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // Ignore clipboard permission errors in sandboxed iframes
    }
    setTimeout(() => {
      setCopiedLinkPostId(null);
    }, 1500);
  };

  const handleSaveEditedPost = (updated: ProfilePost) => {
    if (onEditPost) {
      onEditPost(updated);
    }
    setEditingPost(null);
  };

  const handleAddCommentFromSheet = (postId: string, text: string, parentCommentId?: string) => {
    onAddComment(postId, text, parentCommentId);
    if (currentUser.role === 'invitado') {
      return;
    }
    // Instant local sync for the drawer for registered users
    setActiveCommentsPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      const newComment: PostComment = {
        id: 'c-' + Date.now(),
        username: currentUser.username,
        avatar: currentUser.avatar,
        text,
        timestamp: 'Ahora mismo',
        parentId: parentCommentId
      };

      const currentComments = prev.comments || [];
      let updatedComments: PostComment[];

      if (parentCommentId) {
        updatedComments = currentComments.map(c => {
          if (c.id === parentCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        });
      } else {
        updatedComments = [...currentComments, newComment];
      }

      return {
        ...prev,
        commentsCount: countTotalComments(updatedComments),
        comments: updatedComments
      };
    });
  };

  const handleDeleteCommentFromSheet = (postId: string, commentId: string, parentCommentId?: string) => {
    if (onDeleteComment) {
      onDeleteComment(postId, commentId, parentCommentId);
    }
    setActiveCommentsPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      const currentComments = prev.comments || [];
      let updatedComments: PostComment[];

      if (parentCommentId) {
        updatedComments = currentComments.map(c => {
          if (c.id === parentCommentId) {
            return {
              ...c,
              replies: (c.replies || []).filter(r => r.id !== commentId)
            };
          }
          return c;
        });
      } else {
        updatedComments = currentComments.filter(c => c.id !== commentId);
      }

      return {
        ...prev,
        commentsCount: countTotalComments(updatedComments),
        comments: updatedComments
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] flex justify-center animate-fadeIn">
      <div className="w-full max-w-md xl:max-w-lg h-full flex flex-col bg-transparent transition-colors relative">
        
        {/* TOP HEADER */}
        <div className="px-4 py-3 border-b border-transparent dark:border-transparent flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#003087]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="w-9 flex justify-start">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-white/10 active:scale-95 transition-all"
              title="Volver al perfil"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 text-center">
            <h3 className="font-sans font-bold text-sm text-[#FFCD00]">
              {feedTitle}
            </h3>
            <p className="text-[11px] text-[#003087] dark:text-[#C4C4C4] font-medium truncate">
              {currentUser.username}
            </p>
          </div>

          <div className="w-9 flex justify-end">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-white/10 active:scale-95 transition-all"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEED SCROLL CONTAINER */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 pb-16 space-y-6"
        >
          {safePosts.length === 0 ? (
            <div className="py-20 text-center px-6">
              <Sparkles className="w-10 h-10 text-[#FFCD00] mx-auto mb-3 opacity-80" />
              <p className="text-sm font-bold text-[#FFCD00] mb-1">No hay publicaciones disponibles</p>
              <p className="text-xs text-[#C4C4C4]">Esta sección aún no contiene elementos.</p>
            </div>
          ) : (
            safePosts.map((post) => {
              const isLiked = post.isLiked ?? false;
              const isSaved = post.isSaved ?? false;
              const comments = Array.isArray(post.comments) ? post.comments : [];
              const isPostAuthorCurrent = currentUser.id === post.authorId || currentUser.username === post.authorUsername;
              const isOwner = isPostAuthorCurrent || currentUser.isStaff;
              
              // Look up live author in usersList to ensure profile picture changes reflect immediately
              const liveAuthor = (usersList || []).find(u => 
                (post.authorUsername && u.username.toLowerCase() === post.authorUsername.toLowerCase()) || 
                (post.authorId && u.id === post.authorId)
              );

              const displayAuthorAvatar = isPostAuthorCurrent 
                ? currentUser.avatar 
                : (liveAuthor?.avatar || post.authorAvatar);
              const displayAuthorName = isPostAuthorCurrent 
                ? currentUser.name 
                : (liveAuthor?.name || post.authorName);
              const displayAuthorUsername = isPostAuthorCurrent 
                ? currentUser.username 
                : (liveAuthor?.username || post.authorUsername);

              return (
                <article 
                  key={post.id}
                  ref={(el) => {
                    postRefs.current[post.id] = el;
                  }}
                  className="bg-transparent pt-2 animate-fadeIn"
                >
                  {/* 1. POST HEADER (User info, timestamp) */}
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        onClick={() => onViewProfile?.(displayAuthorUsername)}
                        className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-lg overflow-hidden shrink-0 border border-transparent dark:border-transparent cursor-pointer hover:opacity-80 transition-opacity"
                        title={`Ver perfil de ${displayAuthorUsername}`}
                      >
                        {isImageAvatar(displayAuthorAvatar) ? (
                          <img src={displayAuthorAvatar} alt={displayAuthorName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{displayAuthorAvatar || '🇨🇴'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={() => onViewProfile?.(displayAuthorUsername)}
                            className="font-sans font-bold text-xs text-[#003087] dark:text-white truncate cursor-pointer hover:underline"
                          >
                            {displayAuthorUsername}
                          </span>
                          <span className="text-[10px] text-[#C4C4C4]">·</span>
                          <span className="text-[10px] text-[#C4C4C4] shrink-0">
                            {post.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setActiveMenuPost(post)}
                      className="text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00] p-1.5 rounded-full transition-colors"
                      title="Opciones de publicación"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 2. POST IMAGE (With double-tap like animation) */}
                  <div 
                    className="relative w-full aspect-square bg-black/10 dark:bg-black/40 overflow-hidden cursor-pointer select-none"
                    onDoubleClick={() => handleDoubleTap(post.id)}
                  >
                    <img 
                      src={post.imageUrl} 
                      alt={post.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Double-tap Heart Animation */}
                    {doubleTapHeartPostId === post.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none animate-ping">
                        <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
                      </div>
                    )}

                    {/* Tagged badge overlay if tagged */}
                    {(post.isTagged || (post.taggedUsers && post.taggedUsers.length > 0)) && (
                      <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-[#FFCD00]" />
                        <span>
                          {post.taggedUsers && post.taggedUsers.length > 0 
                            ? post.taggedUsers.join(', ')
                            : 'Etiquetado'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3. POST ACTION BAR */}
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Like button with count to the right */}
                      <button
                        type="button"
                        onClick={() => onToggleLike(post.id)}
                        className="flex items-center gap-1.5 active:scale-110 transition-transform group"
                        title={isLiked ? 'Ya no me gusta' : 'Me gusta'}
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
                            isLiked ? 'text-rose-500 fill-rose-500' : 'text-[#003087] dark:text-[#C4C4C4] group-hover:text-rose-400'
                          }`} 
                        />
                        {(!post.hideLikesCount || isOwner) && (post.likesCount || 0) > 0 ? (
                          <span className="text-xs font-bold text-[#003087] dark:text-white">
                            {post.likesCount}
                          </span>
                        ) : null}
                      </button>

                      {/* Comment button with count to the right */}
                      {!post.disableComments && (
                        <button
                          type="button"
                          onClick={() => setActiveCommentsPost(post)}
                          className="flex items-center gap-1.5 text-[#003087] dark:text-[#C4C4C4] hover:text-[#FFCD00] active:scale-110 transition-transform"
                          title="Comentarios"
                        >
                          <MessageCircle className="w-5 h-5" />
                          {(() => {
                            const total = countTotalComments(post.comments) || post.commentsCount || 0;
                            return total > 0 ? (
                              <span className="text-xs font-bold text-[#003087] dark:text-white">
                                {total}
                              </span>
                            ) : null;
                          })()}
                        </button>
                      )}

                      {/* Share button */}
                      <button
                        type="button"
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-1.5 text-[#003087] dark:text-[#C4C4C4] hover:text-[#FFCD00] active:scale-110 transition-transform relative"
                        title="Compartir enlace"
                      >
                        {copiedLinkPostId === post.id ? (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> ¡Copiado!
                          </span>
                        ) : (
                          <Share2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Bookmark / Save button with count below it */}
                    <button
                      type="button"
                      onClick={() => onToggleSave(post.id)}
                      className="flex flex-col items-center gap-0.5 active:scale-110 transition-transform min-w-[20px]"
                      title={isSaved ? 'Guardado' : 'Guardar'}
                    >
                      <Bookmark 
                        className={`w-5 h-5 transition-colors ${
                          isSaved ? 'text-[#FFCD00] fill-[#FFCD00]' : 'text-[#003087] dark:text-[#C4C4C4] hover:text-[#FFCD00]'
                        }`} 
                      />
                      {(() => {
                        const count = typeof post.savesCount === 'number' ? post.savesCount : (isSaved ? 1 : 0);
                        return (!post.hideSavesCount || isOwner) && count > 0 ? (
                          <span className="text-[10px] font-bold text-[#003087] dark:text-[#C4C4C4] leading-none">
                            {count}
                          </span>
                        ) : null;
                      })()}
                    </button>
                  </div>

                  {/* 4. CAPTION */}
                  {post.caption && (
                    <div className="px-4 pt-1.5 pb-0.5 text-xs">
                      <p className="leading-relaxed text-[#003087] dark:text-[#C4C4C4]">
                        <span className="font-bold text-[#003087] dark:text-white mr-1.5">
                          {displayAuthorUsername}
                        </span>
                        {post.caption}
                      </p>
                    </div>
                  )}

                  {/* 6. COMMENTS TRIGGER (Instagram-style) */}
                  <div className="px-4 pt-0.5 pb-2">
                    {post.disableComments ? (
                      <p className="text-[11px] text-[#C4C4C4] italic">
                        Los comentarios están desactivados en esta publicación.
                      </p>
                    ) : (
                      (() => {
                        const total = countTotalComments(comments) || post.commentsCount || 0;
                        return total > 0 ? (
                          <button
                            type="button"
                            onClick={() => setActiveCommentsPost(post)}
                            className="text-[11px] text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00] font-medium transition-colors block text-left"
                          >
                            Ver los {total} {total === 1 ? 'comentario' : 'comentarios'}
                          </button>
                        ) : null;
                      })()
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ================= MENÚ (...) DE LA PUBLICACIÓN ================= */}
        {activeMenuPost && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm bg-white dark:bg-[#002266] rounded-3xl p-4 shadow-2xl space-y-1.5 border border-black/10 dark:border-white/10 animate-slideUp">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                <h4 className="text-xs font-bold text-[#003087] dark:text-[#FFCD00]">
                  Opciones
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveMenuPost(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#C4C4C4] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. EDITAR PUBLICACIÓN (dueño de la publicación) */}
              {(currentUser.id === activeMenuPost.authorId || currentUser.username === activeMenuPost.authorUsername) && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPost(activeMenuPost);
                    setActiveMenuPost(null);
                  }}
                  className="w-full py-3 px-3 rounded-2xl flex items-center gap-3 text-left hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-[#003087] dark:text-[#FFCD00] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Editar publicación</span>
                </button>
              )}

              {/* 2. COPIAR ENLACE */}
              <button
                type="button"
                onClick={() => {
                  handleShare(activeMenuPost.id);
                  setActiveMenuPost(null);
                }}
                className="w-full py-3 px-3 rounded-2xl flex items-center gap-3 text-left hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[#003087] dark:text-white transition-colors"
              >
                <Copy className="w-4 h-4 text-[#C4C4C4]" />
                <span>Copiar enlace</span>
              </button>

              {/* 3. REPORTAR PUBLICACIÓN (solo para otros usuarios, no el dueño) */}
              {currentUser.id !== activeMenuPost.authorId && currentUser.username !== activeMenuPost.authorUsername && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenuPost(null);
                  }}
                  className="w-full py-3 px-3 rounded-2xl flex items-center gap-3 text-left hover:bg-rose-500/10 text-xs font-semibold text-rose-500 transition-colors"
                >
                  <Flag className="w-4 h-4 text-rose-500" />
                  <span>Reportar publicación</span>
                </button>
              )}

              {/* 4. ELIMINAR PUBLICACIÓN (dueño de la publicación) */}
              {(currentUser.id === activeMenuPost.authorId || currentUser.username === activeMenuPost.authorUsername) && onDeletePost && (
                <button
                  type="button"
                  onClick={() => {
                    onDeletePost(activeMenuPost.id);
                    setActiveMenuPost(null);
                  }}
                  className="w-full py-3 px-3 rounded-2xl flex items-center gap-3 text-left hover:bg-rose-500/10 text-xs font-bold text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar publicación</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL EDITAR PUBLICACIÓN ================= */}
        {editingPost && (
          <EditPostModal
            isOpen={!!editingPost}
            onClose={() => setEditingPost(null)}
            post={editingPost}
            onSave={handleSaveEditedPost}
          />
        )}

        {/* ================= MODAL / BOTTOM SHEET DE COMENTARIOS TIPO INSTAGRAM ================= */}
        {activeCommentsPost && (
          <CommentsBottomSheet
            isOpen={!!activeCommentsPost}
            onClose={() => setActiveCommentsPost(null)}
            post={activeCommentsPost}
            currentUser={currentUser}
            usersList={usersList}
            onAddComment={handleAddCommentFromSheet}
            onDeleteComment={handleDeleteCommentFromSheet}
            onViewProfile={onViewProfile}
          />
        )}

      </div>
    </div>
  );
};
