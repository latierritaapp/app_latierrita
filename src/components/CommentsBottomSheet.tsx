import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, MessageCircle, MoreHorizontal, UserX, Flag, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProfilePost, PostComment } from '../types/post';
import { AppUser } from '../types/auth';
import { FlagEmoji } from './FlagEmoji';
import { countTotalComments, isImageAvatar } from '../utils/commentUtils';

interface CommentsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: ProfilePost | null;
  currentUser: AppUser;
  usersList?: AppUser[];
  onAddComment: (postId: string, text: string, parentCommentId?: string) => void;
  onDeleteComment?: (postId: string, commentId: string, parentCommentId?: string) => void;
  onViewProfile?: (username: string) => void;
}

const QUICK_EMOJIS = ['🫶', '🥹', '🔥', '😍', '🫡', '🫠', '🇨🇴', '☕', '🎉', '🪩', '✨', '🤌'];

export const CommentsBottomSheet: React.FC<CommentsBottomSheetProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
  usersList,
  onAddComment,
  onDeleteComment,
  onViewProfile
}) => {
  const [inputText, setInputText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; username: string } | null>(null);
  const [expandedReplyCommentIds, setExpandedReplyCommentIds] = useState<string[]>([]);

  // Long press / Context menu state
  const [contextMenuTarget, setContextMenuTarget] = useState<{
    comment: PostComment;
    parentCommentId?: string;
  } | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Focus input when opened or when replying
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    } else {
      setInputText('');
      setReplyingToComment(null);
      setContextMenuTarget(null);
    }
  }, [isOpen, post?.id]);

  if (!isOpen || !post) return null;

  const comments = Array.isArray(post.comments) ? post.comments : [];
  const totalComments = countTotalComments(comments);

  const isPostOwner = currentUser.id === post.authorId || currentUser.username === post.authorUsername || currentUser.isStaff;

  // Touch & Mouse Long Press Handlers
  const handlePressStart = (comment: PostComment, parentCommentId?: string) => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setContextMenuTarget({ comment, parentCommentId });
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {}
      }
    }, 450);
  };

  const handlePressEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleInitiateReply = (targetComment: PostComment, parentIdToUse?: string) => {
    const cleanUsername = targetComment.username.startsWith('@') 
      ? targetComment.username 
      : `@${targetComment.username}`;

    const parentId = parentIdToUse || targetComment.id;

    setReplyingToComment({
      id: parentId,
      username: cleanUsername
    });

    if (!expandedReplyCommentIds.includes(parentId)) {
      setExpandedReplyCommentIds(prev => [...prev, parentId]);
    }

    setContextMenuTarget(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleDeleteCommentAction = (commentId: string, parentCommentId?: string) => {
    if (onDeleteComment) {
      onDeleteComment(post.id, commentId, parentCommentId);
    }
    setContextMenuTarget(null);
    showToast('Comentario eliminado con éxito.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText) return;

    if (currentUser.role === 'invitado') {
      onAddComment(post.id, cleanText, replyingToComment?.id);
      setInputText('');
      setReplyingToComment(null);
      return;
    }

    onAddComment(post.id, cleanText, replyingToComment?.id);
    setInputText('');
    setReplyingToComment(null);

    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleToggleLikeComment = (commentId: string) => {
    setLikedCommentIds(prev => 
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  const isPostAuthorCurrent = currentUser.id === post.authorId || currentUser.username === post.authorUsername;
  const postAuthorAvatar = isPostAuthorCurrent ? currentUser.avatar : post.authorAvatar;
  const postAuthorUsername = isPostAuthorCurrent ? currentUser.username : post.authorUsername;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Click outside to close */}
      <div className="flex-1 w-full" onClick={onClose} />

      {/* BOTTOM SHEET CONTAINER */}
      <div 
        className="w-full max-w-md xl:max-w-lg mx-auto bg-white dark:bg-[#001B44] rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] h-[75vh] border-t border-black/10 dark:border-white/10 animate-slideUp overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOAST NOTIFICATION BANNER */}
        {toastMessage && (
          <div className="absolute top-12 left-4 right-4 z-30 bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] px-4 py-2.5 rounded-2xl shadow-xl font-sans font-bold text-xs flex items-center justify-between animate-fadeIn border border-white/20">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {toastMessage}
            </span>
            <button type="button" onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.2 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* HEADER WITH TOTAL ACCURATE COMMENTS COUNT & ICON */}
        <div className="px-5 py-2.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#003087] dark:text-[#FFCD00] bg-[#003087]/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
            <MessageCircle className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" />
            <span>{totalComments}</span>
          </div>
          <h3 className="font-sans font-bold text-sm text-[#003087] dark:text-[#FFCD00]">
            Comentarios
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE COMMENTS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-black/5 dark:divide-white/5">
          
          {/* POST AUTHOR CAPTION AT TOP (Instagram style) */}
          {post.caption && (
            <div className="flex items-start gap-3 pb-3">
              <div 
                onClick={() => onViewProfile?.(postAuthorUsername)}
                className="w-8 h-8 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-sm border border-transparent cursor-pointer hover:opacity-80 transition-opacity"
                title={`Ver perfil de ${postAuthorUsername}`}
              >
                {isImageAvatar(postAuthorAvatar) ? (
                  <img src={postAuthorAvatar} alt={postAuthorUsername} className="w-full h-full object-cover" />
                ) : (
                  <span>{postAuthorAvatar || '🇨🇴'}</span>
                )}
              </div>
              <div className="flex-1 text-xs space-y-0.5">
                <p className="leading-relaxed text-[#003087] dark:text-white">
                  <span 
                    onClick={() => onViewProfile?.(postAuthorUsername)}
                    className="font-bold mr-1.5 text-[#003087] dark:text-[#FFCD00] cursor-pointer hover:underline"
                  >
                    {postAuthorUsername}
                  </span>
                  {post.caption}
                </p>
                <div className="flex items-center gap-2 pt-0.5 text-[10px] text-[#C4C4C4]">
                  <span>{post.timestamp}</span>
                  <span>·</span>
                  <span className="font-semibold text-[#003087] dark:text-[#FFCD00]/80">Autor</span>
                </div>
              </div>
            </div>
          )}

          {/* LIST OF COMMENTS */}
          {comments.length === 0 ? (
            <div className="py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[#003087]/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-[#FFCD00]" />
              </div>
              <h4 className="text-xs font-bold text-[#003087] dark:text-white mb-1">
                No hay comentarios aún
              </h4>
              <p className="text-[11px] text-[#C4C4C4]">
                Inicia la conversación compartiendo tu opinión.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isCommentUserCurrent = comment.username === currentUser.username;
              const foundCommentUser = (usersList || []).find(u => 
                u.username.toLowerCase() === comment.username.toLowerCase()
              );
              const commentAvatar = isCommentUserCurrent 
                ? currentUser.avatar 
                : (foundCommentUser?.avatar || comment.avatar);
              const isCommentLiked = likedCommentIds.includes(comment.id);
              const commentLikesCount = (comment.likesCount || 0) + (isCommentLiked ? 1 : 0);
              const replies = Array.isArray(comment.replies) ? comment.replies : [];
              const isExpanded = expandedReplyCommentIds.includes(comment.id);

              return (
                <div key={comment.id} className="pt-3 space-y-2">
                  {/* MAIN PARENT COMMENT (WITH LONG PRESS LISTENER) */}
                  <div 
                    className="flex items-start gap-3 p-1.5 rounded-2xl transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer select-none group"
                    onTouchStart={() => handlePressStart(comment)}
                    onTouchEnd={handlePressEnd}
                    onTouchMove={handlePressEnd}
                    onMouseDown={() => handlePressStart(comment)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handlePressEnd();
                      setContextMenuTarget({ comment });
                    }}
                  >
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile?.(comment.username);
                      }}
                      className="w-8 h-8 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-sm cursor-pointer hover:opacity-80 transition-opacity"
                      title={`Ver perfil de ${comment.username}`}
                    >
                      {isImageAvatar(commentAvatar) ? (
                        <img src={commentAvatar} alt={comment.username} className="w-full h-full object-cover" />
                      ) : (
                        <span>{commentAvatar || '🇨🇴'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <p className="leading-relaxed text-[#003087] dark:text-white break-words">
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile?.(comment.username);
                          }}
                          className="font-bold mr-1.5 text-[#003087] dark:text-[#FFCD00] cursor-pointer hover:underline"
                        >
                          {comment.username}
                        </span>
                        {comment.text}
                      </p>
                      
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-[#C4C4C4]">
                        <span>{comment.timestamp || 'Ahora mismo'}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiateReply(comment);
                          }}
                          className="font-bold hover:text-[#003087] dark:hover:text-white transition-colors"
                        >
                          Responder
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLikeComment(comment.id);
                        }}
                        className="flex flex-col items-center gap-0.5 p-1 text-[#C4C4C4] hover:text-rose-500 active:scale-125 transition-all"
                        title="Me gusta"
                      >
                        <Heart 
                          className={`w-3.5 h-3.5 ${
                            isCommentLiked ? 'text-rose-500 fill-rose-500' : ''
                          }`} 
                        />
                        {commentLikesCount > 0 && (
                          <span className="text-[10px] font-bold text-[#C4C4C4] dark:text-white/80">
                            {commentLikesCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* NESTED SUBCOMMENTS / REPLIES (INSTAGRAM STYLE) */}
                  {replies.length > 0 && (
                    <div className="pl-11 pt-1">
                      {!isExpanded ? (
                        <button
                          type="button"
                          onClick={() => setExpandedReplyCommentIds(prev => [...prev, comment.id])}
                          className="text-[11px] font-bold text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00] flex items-center gap-2 transition-colors"
                        >
                          <span className="w-6 h-px bg-[#C4C4C4]/50 dark:bg-white/20"></span>
                          Ver {replies.length} {replies.length === 1 ? 'respuesta' : 'respuestas'}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => setExpandedReplyCommentIds(prev => prev.filter(id => id !== comment.id))}
                            className="text-[11px] font-bold text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00] flex items-center gap-2 transition-colors mb-2"
                          >
                            <span className="w-6 h-px bg-[#C4C4C4]/50 dark:bg-white/20"></span>
                            Ocultar respuestas
                          </button>

                          {/* LIST OF SUBCOMMENTS */}
                          <div className="space-y-2.5 border-l-2 border-[#003087]/10 dark:border-white/10 pl-3">
                            {replies.map((reply) => {
                              const isReplyUserCurrent = reply.username === currentUser.username;
                              const foundReplyUser = (usersList || []).find(u => 
                                u.username.toLowerCase() === reply.username.toLowerCase()
                              );
                              const replyAvatar = isReplyUserCurrent 
                                ? currentUser.avatar 
                                : (foundReplyUser?.avatar || reply.avatar);
                              const isReplyLiked = likedCommentIds.includes(reply.id);
                              const replyLikesCount = (reply.likesCount || 0) + (isReplyLiked ? 1 : 0);

                              return (
                                <div 
                                  key={reply.id} 
                                  className="flex items-start gap-2.5 animate-fadeIn p-1 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer select-none group"
                                  onTouchStart={() => handlePressStart(reply, comment.id)}
                                  onTouchEnd={handlePressEnd}
                                  onTouchMove={handlePressEnd}
                                  onMouseDown={() => handlePressStart(reply, comment.id)}
                                  onMouseUp={handlePressEnd}
                                  onMouseLeave={handlePressEnd}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    handlePressEnd();
                                    setContextMenuTarget({ comment: reply, parentCommentId: comment.id });
                                  }}
                                >
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewProfile?.(reply.username);
                                    }}
                                    className="w-6 h-6 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                    title={`Ver perfil de ${reply.username}`}
                                  >
                                    {isImageAvatar(replyAvatar) ? (
                                      <img src={replyAvatar} alt={reply.username} className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{replyAvatar || '🇨🇴'}</span>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0 text-xs">
                                    <p className="leading-relaxed text-[#003087] dark:text-white break-words">
                                      <span 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewProfile?.(reply.username);
                                        }}
                                        className="font-bold mr-1.5 text-[#003087] dark:text-[#FFCD00] cursor-pointer hover:underline"
                                      >
                                        {reply.username}
                                      </span>
                                      {reply.text}
                                    </p>
                                    
                                    <div className="flex items-center gap-3 pt-0.5 text-[10px] text-[#C4C4C4]">
                                      <span>{reply.timestamp || 'Ahora mismo'}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleInitiateReply(reply, comment.id);
                                        }}
                                        className="font-bold hover:text-[#003087] dark:hover:text-white transition-colors"
                                      >
                                        Responder
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleLikeComment(reply.id);
                                      }}
                                      className="flex flex-col items-center gap-0.5 p-0.5 text-[#C4C4C4] hover:text-rose-500 active:scale-125 transition-all"
                                      title="Me gusta"
                                    >
                                      <Heart 
                                        className={`w-3 h-3 ${
                                          isReplyLiked ? 'text-rose-500 fill-rose-500' : ''
                                        }`} 
                                      />
                                      {replyLikesCount > 0 && (
                                        <span className="text-[9px] font-bold text-[#C4C4C4] dark:text-white/80">
                                          {replyLikesCount}
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div ref={commentsEndRef} />
        </div>

        {/* QUICK EMOJI BAR */}
        <div className="px-4 py-2 flex items-center justify-between border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] shrink-0 overflow-x-auto no-scrollbar gap-2">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-base hover:scale-125 active:scale-95 transition-transform p-1 flex items-center justify-center shrink-0"
            >
              {emoji === '🇨🇴' ? <FlagEmoji country="co" size="sm" /> : emoji}
            </button>
          ))}
        </div>

        {/* INSTAGRAM-STYLE "RESPONDIENDO A @USERNAME" BANNER */}
        {replyingToComment && (
          <div className="px-4 py-2 bg-[#003087]/5 dark:bg-[#002266] border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold animate-fadeIn shrink-0">
            <span className="text-[#003087] dark:text-[#FFCD00]">
              Respondiendo a <span className="font-bold">{replyingToComment.username}</span>
            </span>
            <button
              type="button"
              onClick={() => setReplyingToComment(null)}
              className="text-[#C4C4C4] hover:text-rose-500 p-0.5 transition-colors"
              title="Cancelar respuesta"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* BOTTOM INPUT BAR */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#001B44] shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-sm border border-black/5 dark:border-white/10">
              {isImageAvatar(currentUser.avatar) ? (
                <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.avatar || '🇨🇴'}</span>
              )}
            </div>

            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  currentUser.role === 'invitado'
                    ? 'Inicia sesión o regístrate para comentar...'
                    : replyingToComment 
                      ? `Responde a ${replyingToComment.username}...` 
                      : `Añade un comentario para ${postAuthorUsername}...`
                }
                className="w-full pl-3.5 pr-10 py-2 rounded-full bg-black/5 dark:bg-white/10 text-xs text-[#003087] dark:text-[#FFCD00] dark:placeholder-white/40 placeholder-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-[#FFCD00]"
              />
              {inputText.trim() && (
                <button
                  type="submit"
                  className="absolute right-2.5 text-xs font-bold text-[#FFCD00] hover:scale-105 active:scale-95 transition-all"
                >
                  Publicar
                </button>
              )}
            </div>
          </form>
        </div>

      </div>

      {/* ================= FLOATING CONTEXT MENU (LONG PRESS MODAL) ================= */}
      {contextMenuTarget && (
        <div 
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fadeIn"
          onClick={() => setContextMenuTarget(null)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#002266] rounded-3xl p-4 shadow-2xl space-y-1.5 border border-black/10 dark:border-white/10 animate-slideUp text-[#003087] dark:text-[#C4C4C4]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Target Preview */}
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
              <div className="min-w-0 pr-2">
                <span className="font-bold text-xs text-[#003087] dark:text-[#FFCD00] block truncate">
                  {contextMenuTarget.comment.username}
                </span>
                <span className="text-[11px] text-[#C4C4C4] truncate block italic">
                  "{contextMenuTarget.comment.text}"
                </span>
              </div>
              <button
                type="button"
                onClick={() => setContextMenuTarget(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#C4C4C4] hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Options */}

            {/* 1. Responder */}
            <button
              type="button"
              onClick={() => handleInitiateReply(contextMenuTarget.comment, contextMenuTarget.parentCommentId)}
              className="w-full py-3 px-3 rounded-2xl flex items-center gap-3 text-left hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-[#003087] dark:text-[#FFCD00] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Responder</span>
            </button>

            {/* 2. Bloquear usuario (Sin función aún) */}
            <button
              type="button"
              onClick={() => {
                setContextMenuTarget(null);
                showToast(`Función de bloqueo para ${contextMenuTarget.comment.username} en desarrollo.`);
              }}
              className="w-full py-3 px-3 rounded-2xl flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[#003087] dark:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <UserX className="w-4 h-4 text-[#C4C4C4]" />
                <span>Bloquear usuario</span>
              </div>
              <span className="text-[10px] text-[#C4C4C4] italic font-normal">Sin función aún</span>
            </button>

            {/* 3. Denunciar comentario (Sin función aún) */}
            <button
              type="button"
              onClick={() => {
                setContextMenuTarget(null);
                showToast('Comentario denunciado a moderación.');
              }}
              className="w-full py-3 px-3 rounded-2xl flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[#003087] dark:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Flag className="w-4 h-4 text-[#C4C4C4]" />
                <span>Denunciar comentario</span>
              </div>
              <span className="text-[10px] text-[#C4C4C4] italic font-normal">Sin función aún</span>
            </button>

            {/* 4. Eliminar comentario (Solo para dueño de la publicación / autor del comentario / staff) */}
            {(isPostOwner || contextMenuTarget.comment.username === currentUser.username) && (
              <button
                type="button"
                onClick={() => handleDeleteCommentAction(contextMenuTarget.comment.id, contextMenuTarget.parentCommentId)}
                className="w-full py-3 px-3 rounded-2xl flex items-center justify-between text-left hover:bg-rose-500/10 text-xs font-bold text-rose-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Eliminar comentario</span>
                </div>
                <span className="text-[10px] opacity-75 font-normal">Dueño / Autor</span>
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
