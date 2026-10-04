import React, { useState, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Image as ImageIcon, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Plus
} from 'lucide-react';
import { AppUser } from '../types/auth';
import { ProfilePost } from '../types/post';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onPublishPost: (newPost: ProfilePost) => void;
  availableUsers?: AppUser[];
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPublishPost
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  
  // Tagging
  const [tagInput, setTagInput] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);

  // Advanced options (switches)
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [disableComments, setDisableComments] = useState(false);
  const [hideLikesCount, setHideLikesCount] = useState(false);
  const [hideSavesCount, setHideSavesCount] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setSelectedImage(null);
    setCaption('');
    setTagInput('');
    setTaggedUsers([]);
    setIsAdvancedOptionsOpen(false);
    setDisableComments(false);
    setHideLikesCount(false);
    setHideSavesCount(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setSelectedImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (!selectedImage) return;

    const newPostId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ('post-' + Date.now());
    const newPost: ProfilePost = {
      id: newPostId,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      imageUrl: selectedImage,
      caption: caption.trim(),
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
      timestamp: 'Ahora mismo',
      isLiked: false,
      isSaved: false,
      isTagged: taggedUsers.length > 0,
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      disableComments,
      hideLikesCount,
      hideSavesCount,
      comments: []
    };

    onPublishPost(newPost);
    handleReset();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] flex justify-center animate-fadeIn">
      <div className="w-full max-w-md xl:max-w-lg h-full flex flex-col bg-transparent transition-colors">
        
        {/* ================= HEADER ================= */}
        <div className="px-4 py-3.5 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#003087]/80 backdrop-blur-md">
          <div className="w-16 flex justify-start">
            {step === 1 ? (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="Atrás"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center">
            <h3 className="font-sans font-bold text-sm text-[#003087] dark:text-[#C4C4C4]">
              Nueva publicación
            </h3>
          </div>

          <div className="w-16 flex justify-end">
            {step === 1 ? (
              <button
                type="button"
                disabled={!selectedImage}
                onClick={() => setStep(2)}
                className="text-xs font-bold text-[#FFCD00] disabled:opacity-30 disabled:cursor-not-allowed hover:underline transition-all"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="text-xs font-black text-[#FFCD00] hover:scale-105 active:scale-95 transition-all"
              >
                Compartir
              </button>
            )}
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* ================= PASO 1: SELECCIONAR IMAGEN O TOMAR FOTO ================= */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Selected Image Preview (if already chosen) */}
              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 shadow-inner">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                      title="Quitar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-bold text-[#003087] dark:text-[#FFCD00] flex items-center gap-2 transition-colors active:scale-95"
                    >
                      <ImageIcon className="w-4 h-4" /> Cambiar foto
                    </button>
                  </div>
                </div>
              ) : (
                /* Big selection dropzone */
                <div className="space-y-5 pt-4">
                  <div className="p-8 rounded-3xl border-2 border-dashed border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.03] text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#003087]/10 dark:bg-white/10 text-[#003087] dark:text-[#FFCD00] flex items-center justify-center shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-[#003087] dark:text-white">
                        Sube una foto para tu perfil
                      </h4>
                      <p className="text-xs text-[#C4C4C4] mt-1 max-w-xs mx-auto">
                        Comparte tus momentos con la comunidad de Colombianos en España.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs pt-1">
                      {/* Galería */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 px-4 rounded-xl bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                      >
                        <ImageIcon className="w-4 h-4" /> Galería del dispositivo
                      </button>

                      {/* Cámara */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-full py-3 px-4 rounded-xl bg-black/5 dark:bg-white/10 text-[#003087] dark:text-white hover:bg-black/10 dark:hover:bg-white/15 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Camera className="w-4 h-4" /> Tomar foto
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden File inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>
          )}

          {/* ================= PASO 2: DETALLES, ETIQUETAS Y MÁS OPCIONES ================= */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn pb-6">
              
              {/* Image Thumbnail & Caption */}
              <div className="flex gap-3 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-transparent dark:border-transparent">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black/10 dark:bg-black/40 shadow-xs">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  )}
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
          )}

        </div>
      </div>
    </div>
  );
};
