import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Eye, 
  Save, 
  Trash2, 
  Bold, 
  Italic, 
  Heading, 
  List, 
  Lightbulb, 
  Check, 
  Sparkles,
  FileText
} from 'lucide-react';
import { InfoSection } from '../types/infoSection';
import logo from '../assets/images/la_tierrita_logo.png';

interface InfoSectionDetailModalProps {
  section: InfoSection | null;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onSave: (updatedSection: InfoSection) => void;
  onDelete?: (sectionId: string) => void;
}

export const InfoSectionDetailModal: React.FC<InfoSectionDetailModalProps> = ({
  section,
  isOpen,
  onClose,
  canEdit,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section?.title || '');
  const [editedDesc, setEditedDesc] = useState(section?.desc || '');
  const [editedContent, setEditedContent] = useState(section?.content || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (section) {
      setEditedTitle(section.title);
      setEditedDesc(section.desc);
      setEditedContent(section.content);
      setShowDeleteConfirm(false);
      setIsEditing(false);
    }
  }, [section?.id]);

  if (!isOpen || !section) return null;

  const handleInsertText = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editedContent.substring(start, end);
    const replacement = prefix + (selected || 'texto') + suffix;
    const newContent = editedContent.substring(0, start) + replacement + editedContent.substring(end);
    setEditedContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  const handleSave = () => {
    if (!editedTitle.trim()) return;
    const updated: InfoSection = {
      ...section,
      title: editedTitle.trim(),
      desc: editedDesc.trim(),
      content: editedContent.trim(),
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 800);
  };

  const handleConfirmDelete = () => {
    if (onDelete && section) {
      onDelete(section.id);
      onClose();
    }
  };

  // Render nicely formatted paragraphs
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }

      // Heading 3: ### Heading
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-sans font-black text-sm sm:text-base text-[#003087] dark:text-[#FFCD00] pt-4 pb-1">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Heading 2: ## Heading
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-sans font-black text-base sm:text-lg text-[#003087] dark:text-[#FFCD00] pt-5 pb-1">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Highlight/Tip box: 💡
      if (trimmed.startsWith('💡') || trimmed.startsWith('> ')) {
        return (
          <div key={idx} className="my-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium flex items-start gap-2.5">
            <span className="text-base shrink-0">💡</span>
            <div className="flex-1">
              {renderInlineStyles(trimmed.replace(/^(💡|>|\*\*Consejo:\*\*)\s*/, ''))}
            </div>
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[•\-*]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003087] dark:bg-[#FFCD00] shrink-0 mt-1.5"></span>
            <div className="flex-1">{renderInlineStyles(itemText)}</div>
          </div>
        );
      }

      // Numbered list
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-[#003087]/10 dark:bg-[#FFCD00]/20 text-[#003087] dark:text-[#FFCD00] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1 pt-0.5">{renderInlineStyles(numMatch[2])}</div>
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed py-1 font-normal">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper for bold and italic inline styles
  const renderInlineStyles = (lineText: string) => {
    // Quick regex parser for **bold**
    const parts = lineText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-[#003087] dark:text-[#FFCD00]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#001133] flex flex-col p-0 animate-fadeIn">
      {/* HEADER */}
      <header className="sticky top-0 bg-white/95 dark:bg-[#001845]/95 backdrop-blur-md border-b border-black/5 dark:border-white/10 px-4 py-3 flex items-center justify-between shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#003087] dark:text-[#FFCD00] cursor-pointer transition-all active:scale-95"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src={logo} alt="La Tierrita" className="h-6 w-auto" />
            <span className="font-sans font-bold text-xs text-[#003087] dark:text-[#FFCD00] hidden sm:inline">
              Información
            </span>
          </div>
        </div>

        {/* Right action buttons: Edit / View / Delete */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3.5 py-1.5 rounded-full bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Guardado!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[#003087] dark:text-[#FFCD00] hover:bg-black/10 dark:hover:bg-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Editar contenido"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar sección</span>
                </button>
              )}

              {canEdit && onDelete && (
                showDeleteConfirm ? (
                  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/80 px-2 py-1 rounded-full border border-red-200 dark:border-red-900 animate-fadeIn">
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400">¿Eliminar?</span>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="px-2.5 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-0.5 rounded-full text-gray-500 hover:text-black dark:hover:text-white font-medium text-[10px] cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition-all cursor-pointer"
                    title="Eliminar sección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              )}
            </>
          )}
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        {isEditing ? (
          /* ================= MODO EDITOR ================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
              <span className="text-[11px] font-bold text-[#FFCD00] uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Editor de contenido
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-500 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Vista previa
              </button>
            </div>

            {/* Título de la sección */}
            <div>
              <label className="block text-xs font-bold text-[#003087] dark:text-white mb-1">
                Título de la sección
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Ej. Trámites de Nacionalidad"
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-black/30 text-sm font-bold text-[#003087] dark:text-[#FFCD00] focus:ring-2 focus:ring-[#FFCD00] focus:outline-none"
              />
            </div>

            {/* Subtítulo / Descripción corta */}
            <div>
              <label className="block text-xs font-bold text-[#003087] dark:text-white mb-1">
                Descripción corta (visible en la tarjeta)
              </label>
              <input
                type="text"
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                placeholder="Ej. Requisitos, exámenes y plazos"
                className="w-full px-4 py-2 rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-black/30 text-xs font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#FFCD00] focus:outline-none"
              />
            </div>

            {/* Barra de herramientas de formato de texto */}
            <div>
              <label className="block text-xs font-bold text-[#003087] dark:text-white mb-1.5">
                Contenido detallado (Editor de texto)
              </label>
              <div className="flex items-center gap-1.5 p-1.5 bg-black/5 dark:bg-white/5 rounded-t-xl border border-b-0 border-black/10 dark:border-white/10 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleInsertText('**', '**')}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  title="Negrita (**texto**)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertText('*', '*')}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  title="Cursiva (*texto*)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertText('### ')}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  title="Subtítulo (### Título)"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertText('• ')}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  title="Lista con viñetas"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertText('💡 **Consejo:** ')}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  title="Caja de consejo destacado"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Destacado</span>
                </button>
              </div>

              {/* Textarea del editor */}
              <textarea
                ref={textareaRef}
                rows={14}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Escribe aquí toda la información, requisitos, pasos a seguir y consejos..."
                className="w-full px-4 py-3 rounded-b-xl border border-black/10 dark:border-white/20 bg-white dark:bg-black/40 text-xs sm:text-sm font-normal text-gray-800 dark:text-gray-100 leading-relaxed focus:ring-2 focus:ring-[#FFCD00] focus:outline-none resize-y"
              />
            </div>

            {/* Botones inferiores para guardar */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar cambios</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= MODO LECTURA ================= */
          <div className="space-y-4">
            <div className="text-center pb-4 border-b border-black/5 dark:border-white/10 space-y-1">
              <h1 className="font-sans font-black text-xl sm:text-2xl text-[#003087] dark:text-[#FFCD00] leading-tight">
                {section.title}
              </h1>
              {section.desc && (
                <p className="text-xs sm:text-sm text-[#C4C4C4] dark:text-[#C4C4C4] font-medium max-w-md mx-auto">
                  {section.desc}
                </p>
              )}
            </div>

            <div className="pt-2">
              {renderFormattedContent(section.content)}
            </div>

            {/* Aviso informativo */}
            <div className="mt-8 p-4 rounded-2xl bg-[#003087]/5 dark:bg-[#002266]/30 border border-black/5 dark:border-white/5 text-[11px] text-[#C4C4C4] dark:text-[#C4C4C4]/80 text-center space-y-1">
              <p className="font-bold text-[#003087] dark:text-[#FFCD00]">🇨🇴 La Tierrita App · Información Comunitaria</p>
              <p>Esta guía es de carácter orientativo para la comunidad colombiana en España. Consulta siempre las fuentes y organismos oficiales de la Administración Pública.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
