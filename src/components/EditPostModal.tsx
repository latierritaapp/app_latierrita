import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Plus,
  Check
} from 'lucide-react';
import { ProfilePost } from '../types/post';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ProfilePost;
  onSave: (updatedPost: ProfilePost) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave
}) => {
  const [caption, setCaption] = useState(post?.caption || '');
  const [tagInput, setTagInput] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<string[]>(post?.taggedUsers || []);

  // Advanced options (switches)
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [disableComments, setDisableComments] = useState(post?.disableComments || false);
  const [hideLikesCount, setHideLikesCount] = useState(post?.hideLikesCount || false);
  const [hideSavesCount, setHideSavesCount] = useState(post?.hideSavesCount || false);

  // Sync state when selected post changes
  useEffect(() => {
    if (post) {
      setCaption(post.caption || '');
      setTaggedUsers(post.taggedUsers || []);
      setDisableComments(post.disableComments || false);
      setHideLikesCount(post.hideLikesCount || false);
      setHideSavesCount(post.hideSavesCount || false);
      setTagInput('');
      setIsAdvancedOptionsOpen(false);
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  const handleAddTag = (userTag: string) => {
    let clean = userTag.trim();
    if (!clean) return;
    if (!clean.startsWith('@')) {
      clean = '@' + clean;
    }
    if (!taggedUsers.includes(clean)) {
      setTaggedUsers(prev => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTaggedUsers(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPost: ProfilePost = {
      ...post,
      caption: caption.trim(),
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      isTagged: taggedUsers.length > 0,
      disableComments,
      hideLikesCount,
      hideSavesCount
    };

    onSave(updatedPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] flex justify-center animate-fadeIn">
      <div className="w-full max-w-md xl:max-w-lg h-full flex flex-col bg-transparent transition-colors">
        
        {/* ================= HEADER ================= */}
        <div className="px-4 py-3.5 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#003087]/80 backdrop-blur-md">
          <div className="w-16 flex justify-start">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>

          <div className="flex-1 text-center">
            <h3 className="font-sans font-bold text-sm text-[#003087] dark:text-[#C4C4C4]">
              Editar información
            </h3>
          </div>

          <div className="w-16 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-black text-[#FFCD00] hover:scale-105 active:scale-95 transition-all"
            >
              Listo
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn pb-6">
            
            {/* Image Thumbnail & Caption Edit */}
            <div className="flex gap-3 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-transparent dark:border-transparent">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black/10 dark:bg-black/40 shadow-xs">
                <img
                  src={post.imageUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <textarea
                  maxLength={600}
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escribe una descripción de la imagen..."
                  className="w-full bg-transparent text-xs text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none resize-none leading-relaxed"
                />
                <div className="text-right">
                  <span className="text-[10px] text-[#C4C4C4] font-semibold">
                    {caption.length}/600
                  </span>
                </div>
              </div>
            </div>

            {/* Etiquetar usuarios */}
            <div>
              <label className="block text-xs font-bold text-[#FFCD00] mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Etiquetar usuarios
              </label>
              
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Escribe @usuario y pulsa enter..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir
                </button>
              </div>

              {/* Tagged users pills */}
              {taggedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {taggedUsers.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#003087]/10 dark:bg-white/10 text-[#003087] dark:text-[#FFCD00] text-xs font-semibold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#C4C4C4] hover:text-rose-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ================= MÁS OPCIONES > (COLLAPSIBLE) ================= */}
            <div className="pt-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                className="w-full flex items-center justify-between py-2 text-left group"
              >
                <span className="text-xs font-bold text-[#003087] dark:text-[#FFCD00]">
                  Más opciones
                </span>
                {isAdvancedOptionsOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#C4C4C4] group-hover:text-[#003087] dark:group-hover:text-[#FFCD00]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#C4C4C4] group-hover:text-[#003087] dark:group-hover:text-[#FFCD00]" />
                )}
              </button>

              {isAdvancedOptionsOpen && (
                <div className="space-y-4 pt-3 animate-fadeIn">
                  
                  {/* 1. Desactivar comentarios */}
                  <div className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                      <h5 className="font-sans font-bold text-xs text-[#003087] dark:text-white">
                        Desactivar comentarios
                      </h5>
                      <p className="text-[11px] text-[#C4C4C4] leading-relaxed">
                        Los usuarios no podrán dejar comentarios en esta publicación.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={disableComments}
                        onChange={(e) => setDisableComments(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-black/20 peer-focus:outline-none rounded-full peer dark:bg-white/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003087] dark:peer-checked:bg-[#FFCD00]"></div>
                    </label>
                  </div>

                  {/* 2. Ocultar recuento de Likes */}
                  <div className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                      <h5 className="font-sans font-bold text-xs text-[#003087] dark:text-white">
                        Ocultar recuento de Like
                      </h5>
                      <p className="text-[11px] text-[#C4C4C4] leading-relaxed">
                        Solo tú verás el número total de Likes de esta publicación. Puedes cambiar esta opción cuando quieras en el menú ... ubicado en la parte superior de la publicación.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={hideLikesCount}
                        onChange={(e) => setHideLikesCount(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-black/20 peer-focus:outline-none rounded-full peer dark:bg-white/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003087] dark:peer-checked:bg-[#FFCD00]"></div>
                    </label>
                  </div>

                  {/* 3. Ocultar recuento de Guardados */}
                  <div className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                      <h5 className="font-sans font-bold text-xs text-[#003087] dark:text-white">
                        Ocultar recuento de Guardado
                      </h5>
                      <p className="text-[11px] text-[#C4C4C4] leading-relaxed">
                        Solo tú verás el número total de Guardados de esta publicación. Puedes cambiar esta opción cuando quieras en el menú ... ubicado en la parte superior de la publicación.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={hideSavesCount}
                        onChange={(e) => setHideSavesCount(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-black/20 peer-focus:outline-none rounded-full peer dark:bg-white/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003087] dark:peer-checked:bg-[#FFCD00]"></div>
                    </label>
                  </div>

                </div>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
