import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check,
  UserCog,
  UserX,
  Bell,
  BadgeCheck,
  Info,
  Headphones,
  Flag,
  LogOut,
  Trash2,
  Camera,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  Shield,
  KeyRound,
  EyeOff
} from 'lucide-react';
import { ThemeMode, AppUser } from '../types/auth';
import { COLOMBIAN_CITIES, SPANISH_CITIES } from '../data/cities';
import { isImageAvatar } from '../utils/commentUtils';

interface ProfileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onLogout?: () => void;
  currentUser?: AppUser;
  onUpdateUser?: (updatedUser: AppUser) => void;
}

type MenuView = 'root' | 'general' | 'interfaz' | 'editar-perfil' | 'seguridad-privacidad';

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onThemeChange,
  onLogout,
  currentUser,
  onUpdateUser
}) => {
  const [currentView, setCurrentView] = useState<MenuView>('root');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate age helper
  const calculateCurrentAge = (birthDateStr?: string, storedAge?: number): number => {
    if (storedAge && storedAge >= 18) return storedAge;
    if (!birthDateStr) return 25;
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return 25;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 18 ? age : 18;
  };

  // --- EDIT PROFILE FORM STATE ---
  const [avatar, setAvatar] = useState(currentUser?.avatar || '👨🏽');
  const [name, setName] = useState(currentUser?.name || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [username, setUsername] = useState(currentUser?.username || '@');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [age, setAge] = useState<number>(calculateCurrentAge(currentUser?.birthDate, currentUser?.age));
  const [originCity, setOriginCity] = useState(currentUser?.originCity || COLOMBIAN_CITIES[0]);
  const [currentCity, setCurrentCity] = useState(currentUser?.currentCity || SPANISH_CITIES[0]);

  // Social media collapsible state (suprimido / cerrado por defecto)
  const [isSocialsExpanded, setIsSocialsExpanded] = useState(false);
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [instagram, setInstagram] = useState(currentUser?.instagram || '');
  const [tiktok, setTiktok] = useState(currentUser?.tiktok || '');
  const [facebook, setFacebook] = useState(currentUser?.facebook || '');
  const [xTwitter, setXTwitter] = useState(currentUser?.xTwitter || '');

  const [editError, setEditError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync form when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setAvatar(currentUser.avatar || '👨🏽');
      setName(currentUser.name || '');
      setLastName(currentUser.lastName || '');
      setUsername(currentUser.username || '@');
      setBio(currentUser.bio || '');
      setAge(calculateCurrentAge(currentUser.birthDate, currentUser.age));
      setOriginCity(currentUser?.originCity || COLOMBIAN_CITIES[0]);
      setCurrentCity(currentUser?.currentCity || SPANISH_CITIES[0]);
      setWebsite(currentUser.website || '');
      setInstagram(currentUser.instagram || '');
      setTiktok(currentUser.tiktok || '');
      setFacebook(currentUser.facebook || '');
      setXTwitter(currentUser.xTwitter || '');
    }
    setEditError(null);
    setSavedSuccess(false);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentView('root');
    setSavedSuccess(false);
    setEditError(null);
    onClose();
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    }
    handleClose();
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatar(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!name.trim()) {
      setEditError('Por favor ingresa tu nombre.');
      return;
    }
    if (!lastName.trim()) {
      setEditError('Por favor ingresa tu(s) apellido(s).');
      return;
    }
    let cleanUsername = username.trim();
    if (!cleanUsername || cleanUsername === '@') {
      setEditError('Por favor ingresa un nombre de usuario.');
      return;
    }
    if (!cleanUsername.startsWith('@')) {
      cleanUsername = '@' + cleanUsername;
    }
    if (cleanUsername.length > 16) {
      cleanUsername = cleanUsername.substring(0, 16);
    }

    if (age < 18) {
      setEditError('La edad mínima requerida es 18 años.');
      return;
    }

    if (currentUser && onUpdateUser) {
      const updated: AppUser = {
        ...currentUser,
        avatar,
        name: name.trim(),
        lastName: lastName.trim(),
        username: cleanUsername,
        bio: bio.trim(),
        age: Number(age),
        originCity,
        currentCity,
        website: website.trim(),
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
        facebook: facebook.trim(),
        xTwitter: xTwitter.trim()
      };
      onUpdateUser(updated);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setCurrentView('root');
    }, 900);
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'claro':
        return 'Claro';
      case 'oscuro':
        return 'Oscuro';
      case 'sistema':
      default:
        return 'Predeterminado del sistema';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] flex justify-center animate-fadeIn">
      <div className="w-full max-w-md xl:max-w-lg h-full flex flex-col bg-transparent transition-colors">
        
        {/* TOP HEADER */}
        <div className="px-4 py-3 border-b border-transparent dark:border-transparent flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#003087]/80 backdrop-blur-md">
          <div className="w-9 flex justify-start">
            {currentView !== 'root' && (
              <button
                onClick={() => {
                  if (currentView === 'interfaz') {
                    setCurrentView('general');
                  } else {
                    setCurrentView('root');
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="Volver"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center">
            <h3 className="font-sans font-bold text-base text-[#003087] dark:text-[#C4C4C4]">
              {currentView === 'root' && 'Menú'}
              {currentView === 'editar-perfil' && 'Editar perfil'}
              {currentView === 'seguridad-privacidad' && 'Seguridad y Privacidad'}
              {currentView === 'general' && 'General'}
              {currentView === 'interfaz' && 'Interfaz'}
            </h3>
          </div>

          <div className="w-9 flex justify-end">
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-white/10 active:scale-95 transition-all"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY BY VIEW */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
          
          {/* ========================================================================= */}
          {/* LEVEL 1: ROOT (MENÚ) */}
          {/* ========================================================================= */}
          {currentView === 'root' && (
            <div className="space-y-1 animate-fadeIn pb-6">
              
              {/* 1. Editar perfil */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'invitado') {
                    alert('Función restringida: Para editar tu perfil y personalizar tu cuenta, por favor regístrate o inicia sesión.');
                    return;
                  }
                  setCurrentView('editar-perfil');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Editar perfil
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Nombre, foto, biografía y ciudades
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 2. Seguridad y Privacidad */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'invitado') {
                    alert('Función restringida: Los usuarios invitados no tienen configuraciones de seguridad. Por favor regístrate o inicia sesión.');
                    return;
                  }
                  setCurrentView('seguridad-privacidad');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Seguridad y Privacidad
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Contraseña, privacidad y bloqueos
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 3. General */}
              <button
                type="button"
                onClick={() => setCurrentView('general')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      General
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Interfaz, temas y tonos
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 4. Verificar cuenta */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'invitado') {
                    alert('Función restringida: Los usuarios invitados no pueden verificar cuenta. Por favor regístrate o inicia sesión.');
                    return;
                  }
                  alert('Solicitud de insignia de verificación enviada a revisión.');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Verificar cuenta
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Solicitar insignia de verificación
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 5. Más información */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Más información
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Acerca de La Tierrita y políticas
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 6. Soporte */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Soporte
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Centro de ayuda y atención al usuario
                    </p>
                  </div>
                </div>
              </button>

              {/* 7. Reportar */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Reportar
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Informar de un problema o infracción
                    </p>
                  </div>
                </div>
              </button>

              <div className="my-2 border-t border-transparent dark:border-transparent"></div>

              {/* 8. Cerrar sesión */}
              <button
                type="button"
                onClick={handleLogoutAction}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-rose-500/10 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Cerrar sesión
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Finalizar sesión en este dispositivo
                    </p>
                  </div>
                </div>
              </button>

              {/* 9. Eliminar cuenta */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'invitado') {
                    alert('Función restringida: Los usuarios invitados no tienen una cuenta registrada para eliminar.');
                    return;
                  }
                  alert('Función de eliminación de cuenta en desarrollo.');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-rose-500/10 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Eliminar cuenta
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Borrar permanentemente tus datos
                    </p>
                  </div>
                </div>
              </button>

            </div>
          )}

          {/* ========================================================================= */}
          {/* LEVEL 2: SEGURIDAD Y PRIVACIDAD */}
          {/* ========================================================================= */}
          {currentView === 'seguridad-privacidad' && (
            <div className="space-y-1 animate-fadeIn pb-6">
              
              {/* 1. Contraseña */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Contraseña
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Gestionar o cambiar tu clave de acceso
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 2. Privacidad de la cuenta */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Privacidad de la cuenta
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Visibilidad de tu perfil y actividad
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 3. Cuentas bloqueadas */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Cuentas bloqueadas
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Gestionar usuarios restringidos
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>
          )}

          {/* ========================================================================= */}
          {/* LEVEL 2: EDITAR PERFIL (FORMULARIO CON EL ORDEN EXACTO SOLICITADO) */}
          {/* ========================================================================= */}
          {currentView === 'editar-perfil' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fadeIn pb-8">
              
              {/* FEEDBACK MESSAGES */}
              {editError && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {editError}
                </div>
              )}
              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" /> ¡Perfil actualizado exitosamente!
                </div>
              )}

              {/* 1. SUBIR / CAMBIAR FOTO DE PERFIL */}
              <div className="flex flex-col items-center justify-center pt-2 pb-1">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center overflow-hidden text-4xl shadow-md border-2 border-transparent dark:border-transparent">
                    {isImageAvatar(avatar) ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{avatar}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#003087] dark:bg-[#FFCD00] text-white dark:text-[#003087] flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    title="Subir foto"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* 2. NOMBRE - APELLIDO(S) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#FFCD00] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-sm font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#FFCD00] mb-1">
                    Apellido(s)
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Gómez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-sm font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                  />
                </div>
              </div>

              {/* 3. NOMBRE DE USUARIO (MÁXIMO 16 CARACTERES) */}
              <div>
                <label className="block text-xs font-bold text-[#FFCD00] mb-1">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={username}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('@')) {
                        val = '@' + val.replace(/@/g, '');
                      }
                      if (val.length <= 16) {
                        setUsername(val);
                      }
                    }}
                    placeholder="@usuario"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-sm font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                  />
                </div>
              </div>

              {/* 4. BIOGRAFÍA (MÁXIMO 150 CARACTERES) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#FFCD00]">
                    Biografía
                  </label>
                  <span className="text-[10px] text-[#C4C4C4] font-medium">
                    {bio.length}/150
                  </span>
                </div>
                <textarea
                  maxLength={150}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Escribe algo sobre ti..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-sm font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70 resize-none"
                />
              </div>

              {/* 5. EDAD (NUMÉRICO Y MÍNIMO 18 AÑOS) - CIUDAD ORIGEN (NO PUEDE SER CAMBIADO) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#FFCD00] mb-1">
                    Edad <span className="text-[10px] text-[#C4C4C4] font-normal">(Min. 18)</span>
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    required
                    value={age}
                    onChange={(e) => setAge(Math.max(18, parseInt(e.target.value) || 18))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-sm font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-bold text-[#FFCD00]">
                      Ciudad Origen
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      disabled
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-[#002266] text-sm font-medium text-[#003087]/50 dark:text-white/50 focus:outline-none cursor-not-allowed opacity-60"
                    >
                      {COLOMBIAN_CITIES.map((city) => (
                        <option key={city} value={city} className="bg-white dark:bg-[#002266] text-[#003087] dark:text-white">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. CIUDAD ACTUAL (CIUDADES ESPAÑOLAS) */}
              <div>
                <label className="block text-xs font-bold text-[#FFCD00] mb-1">
                  Ciudad Actual
                </label>
                <select
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-[#002266] text-sm font-medium text-[#003087] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70 cursor-pointer"
                >
                  {SPANISH_CITIES.map((city) => (
                    <option key={city} value={city} className="bg-white dark:bg-[#002266] text-[#003087] dark:text-white">
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7. REDES SOCIALES (SUPRIMIDO / EXPANDIBLE) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsSocialsExpanded(!isSocialsExpanded)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFCD00]" />
                    <span className="text-xs font-bold text-[#FFCD00]">Redes sociales</span>
                  </div>
                  {isSocialsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#C4C4C4]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#C4C4C4]" />
                  )}
                </button>

                {isSocialsExpanded && (
                  <div className="mt-3 space-y-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] animate-fadeIn">
                    
                    {/* -- SITIO WEB */}
                    <div>
                      <label className="block text-xs font-medium text-[#FFCD00] mb-1 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> Sitio web
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://tupagina.com"
                        className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                      />
                    </div>

                    {/* -- INSTAGRAM -- TIKTOK */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-[#FFCD00] mb-1 flex items-center gap-1">
                          <Instagram className="w-3.5 h-3.5" /> Instagram
                        </label>
                        <input
                          type="text"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="@tu_instagram"
                          className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#FFCD00] mb-1 flex items-center gap-1">
                          <span className="font-bold text-[10px]">TT</span> TikTok
                        </label>
                        <input
                          type="text"
                          value={tiktok}
                          onChange={(e) => setTiktok(e.target.value)}
                          placeholder="@tu_tiktok"
                          className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                        />
                      </div>
                    </div>

                    {/* -- FACEBOOK -- X */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-[#FFCD00] mb-1 flex items-center gap-1">
                          <Facebook className="w-3.5 h-3.5" /> Facebook
                        </label>
                        <input
                          type="text"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="facebook.com/usuario"
                          className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#FFCD00] mb-1 flex items-center gap-1">
                          <Twitter className="w-3.5 h-3.5" /> X (Twitter)
                        </label>
                        <input
                          type="text"
                          value={xTwitter}
                          onChange={(e) => setXTwitter(e.target.value)}
                          placeholder="@tu_cuenta_x"
                          className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-[#003087] dark:text-white placeholder-[#C4C4C4] focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/70"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* BOTÓN GUARDAR CAMBIOS */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" /> Guardar cambios
                </button>
              </div>

            </form>
          )}

          {/* ========================================================================= */}
          {/* LEVEL 2: GENERAL */}
          {/* ========================================================================= */}
          {currentView === 'general' && (
            <div className="space-y-1 animate-fadeIn">
              
              {/* General > Interfaz */}
              <button
                onClick={() => setCurrentView('interfaz')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Interfaz
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      {getThemeLabel(themeMode)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C4C4C4] dark:text-[#C4C4C4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* General > Tonos de notificaciones */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#003087]/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-[#003087] dark:text-[#FFCD00] transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Tonos de notificaciones
                    </h4>
                    <p className="text-xs text-[#C4C4C4] font-medium">
                      Alertas sonoras y vibración
                    </p>
                  </div>
                </div>
              </button>

            </div>
          )}

          {/* ========================================================================= */}
          {/* LEVEL 3: INTERFAZ (CLARO / OSCURO / PREDETERMINADO DEL SISTEMA) */}
          {/* ========================================================================= */}
          {currentView === 'interfaz' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="px-2 pt-1 pb-1">
                <p className="text-xs text-[#C4C4C4] font-medium">
                  Selecciona la apariencia que prefieras para la aplicación.
                </p>
              </div>

              {/* OPCION 1: CLARO */}
              <button
                type="button"
                onClick={() => onThemeChange('claro')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border border-transparent dark:border-transparent transition-all text-left ${
                  themeMode === 'claro'
                    ? 'bg-[#003087]/10 dark:bg-white/10 shadow-xs'
                    : 'hover:bg-[#003087]/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    themeMode === 'claro'
                      ? 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087]'
                      : 'bg-[#C4C4C4]/20 text-[#003087] dark:text-[#C4C4C4]'
                  }`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Claro
                    </h4>
                    <p className="text-xs text-[#C4C4C4]">
                      Fondo blanco con acentos azul marino
                    </p>
                  </div>
                </div>
                {themeMode === 'claro' && (
                  <div className="w-6 h-6 rounded-full bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* OPCION 2: OSCURO */}
              <button
                type="button"
                onClick={() => onThemeChange('oscuro')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border border-transparent dark:border-transparent transition-all text-left ${
                  themeMode === 'oscuro'
                    ? 'bg-[#003087]/10 dark:bg-white/10 shadow-xs'
                    : 'hover:bg-[#003087]/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    themeMode === 'oscuro'
                      ? 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087]'
                      : 'bg-[#C4C4C4]/20 text-[#003087] dark:text-[#C4C4C4]'
                  }`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Oscuro
                    </h4>
                    <p className="text-xs text-[#C4C4C4]">
                      Fondo azul marino con detalles dorados y plata
                    </p>
                  </div>
                </div>
                {themeMode === 'oscuro' && (
                  <div className="w-6 h-6 rounded-full bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* OPCION 3: PREDETERMINADO DEL SISTEMA */}
              <button
                type="button"
                onClick={() => onThemeChange('sistema')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border border-transparent dark:border-transparent transition-all text-left ${
                  themeMode === 'sistema'
                    ? 'bg-[#003087]/10 dark:bg-white/10 shadow-xs'
                    : 'hover:bg-[#003087]/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    themeMode === 'sistema'
                      ? 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087]'
                      : 'bg-[#C4C4C4]/20 text-[#003087] dark:text-[#C4C4C4]'
                  }`}>
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#FFCD00]">
                      Predeterminado del sistema
                    </h4>
                    <p className="text-xs text-[#C4C4C4]">
                      Se adapta automáticamente a la configuración de tu dispositivo
                    </p>
                  </div>
                </div>
                {themeMode === 'sistema' && (
                  <div className="w-6 h-6 rounded-full bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
