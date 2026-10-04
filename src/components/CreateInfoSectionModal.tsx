import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Bold, 
  Italic, 
  Heading, 
  List, 
  Lightbulb,
  FilePlus,
  Sparkles
} from 'lucide-react';
import { InfoSection } from '../types/infoSection';

interface CreateInfoSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSection: (newSection: InfoSection) => void;
  authorName?: string;
}

export const CreateInfoSectionModal: React.FC<CreateInfoSectionModalProps> = ({
  isOpen,
  onClose,
  onCreateSection,
  authorName
}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handleInsertText = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'texto') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Por favor, ingresa el título de la sección.');
      return;
    }

    if (!desc.trim()) {
      setErrorMessage('Por favor, ingresa una breve descripción para la tarjeta.');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Por favor, escribe el contenido detallado de la sección.');
      return;
    }

    const newSection: InfoSection = {
      id: `info-custom-${Date.now()}`,
      title: title.trim(),
      desc: desc.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorName: authorName || 'Administración',
      isCustom: true
    };

    onCreateSection(newSection);
    setTitle('');
    setDesc('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#001845] rounded-3xl shadow-2xl border border-black/10 dark:border-[#FFCD00]/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-[#003087]/5 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFCD00]/20 text-[#003087] dark:text-[#FFCD00] flex items-center justify-center">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#003087] dark:text-[#FFCD00]">
                Nueva Sección Informativa
              </h3>
              <p className="text-[10px] text-[#C4C4C4] dark:text-[#C4C4C4]">
                Añade una guía o trámite útil para la comunidad
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL FORM */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 font-medium">
              {errorMessage}
            </div>
          )}

          {/* TÍTULO */}
          <div>
            <label className="block text-xs font-bold text-[#003087] dark:text-white mb-1">
              Título de la sección *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Homologación de Títulos Universitarios"
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/20 bg-black/[0.02] dark:bg-white/5 text-xs font-bold text-[#003087] dark:text-[#FFCD00] focus:ring-2 focus:ring-[#FFCD00] focus:outline-none"
              maxLength={60}
            />
          </div>

          {/* SUBTÍTULO / DESCRIPCIÓN */}
          <div>
            <label className="block text-xs font-bold text-[#003087] dark:text-white mb-1">
              Descripción para la tarjeta *
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ej. Pasos, requisitos y costes ante el Ministerio de Universidades"
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/20 bg-black/[0.02] dark:bg-white/5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#FFCD00] focus:outline-none"
              maxLength={120}
            />
          </div>

          {/* EDITOR DE TEXTO DEL CONTENIDO */}
          <div>
            <label className="block text-xs font-bold text-[#003087] dark:text-white mb-1.5">
              Contenido de la guía (Editor de texto) *
            </label>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-t-xl border border-b-0 border-black/10 dark:border-white/10 flex-wrap">
              <button
                type="button"
                onClick={() => handleInsertText('**', '**')}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs font-bold"
                title="Negrita"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertText('*', '*')}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs"
                title="Cursiva"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertText('### ')}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs"
                title="Subtítulo"
              >
                <Heading className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertText('• ')}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs"
                title="Viñeta"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertText('💡 **Consejo:** ')}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs flex items-center gap-1 font-bold"
                title="Consejo destacado"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px]">Consejo</span>
              </button>
            </div>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe la información detallada aquí... Puedes usar los botones de arriba para dar formato."
              className="w-full px-3.5 py-2.5 rounded-b-xl border border-black/10 dark:border-white/20 bg-black/[0.02] dark:bg-white/5 text-xs text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#FFCD00] focus:outline-none resize-y"
            />
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#FFCD00] hover:bg-[#ffe066] text-[#003087] font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Sección</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
