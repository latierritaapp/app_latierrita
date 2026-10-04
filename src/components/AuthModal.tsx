import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Crown, 
  Headphones, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  KeyRound,
  Sun,
  Moon
} from 'lucide-react';
import { AppUser, UserRole, RegisterFormData, ThemeMode } from '../types/auth';
import { COLOMBIAN_CITIES, SPANISH_CITIES } from '../data/cities';
import { GUEST_USER, DEFAULT_USERS, createGuestUser } from '../data/defaultUsers';
import { FlagEmoji } from './FlagEmoji';
import logoImg from '../assets/images/la_tierrita_logo.png';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AppUser) => void;
  initialMode?: 'login' | 'register';
  usersList: AppUser[];
  onRegisterUser: (newUser: AppUser) => void;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialMode = 'login',
  usersList,
  onRegisterUser,
  themeMode,
  onThemeChange
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  
  // Single theme toggle state (Claro / Oscuro)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (themeMode) return themeMode === 'oscuro';
    try {
      const saved = localStorage.getItem('tierrita_theme');
      if (saved) return saved === 'oscuro';
    } catch {}
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    const newTheme: ThemeMode = nextDark ? 'oscuro' : 'claro';
    try {
      localStorage.setItem('tierrita_theme', newTheme);
    } catch {}
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register wizard state (Pasos 1, 2, 3)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regData, setRegData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastName: '',
    username: '@',
    birthDate: '',
    originCity: COLOMBIAN_CITIES[0],
    currentCity: SPANISH_CITIES[0]
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  if (!isOpen) return null;

  // --- LOGIN LOGIC ---
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const inputTrimmed = loginEmail.trim().toLowerCase();
    const rawInput = inputTrimmed.startsWith('@') ? inputTrimmed.slice(1) : inputTrimmed;
    const pwdTrimmed = loginPassword.trim();

    // Search across usersList as well as DEFAULT_USERS
    const combinedUsers = [...usersList];
    DEFAULT_USERS.forEach(defUser => {
      if (!combinedUsers.some(u => u.id === defUser.id || u.email.toLowerCase() === defUser.email.toLowerCase())) {
        combinedUsers.push(defUser);
      }
    });

    const userFound = combinedUsers.find(u => {
      const uEmail = u.email.toLowerCase();
      const uName = u.username.toLowerCase();
      const uNameRaw = uName.startsWith('@') ? uName.slice(1) : uName;

      return uEmail === inputTrimmed || uName === inputTrimmed || uNameRaw === rawInput;
    });

    if (!userFound) {
      setLoginError('No encontramos una cuenta registrada con este correo o usuario.');
      return;
    }

    // Default passwords fallback for preset accounts
    const expectedPassword = userFound.password || (
      userFound.id === 'user-latierrita-app' || userFound.email.toLowerCase() === 'latierritaapp@gmail.com' ? 'latierritaapp' :
      userFound.id === 'user-admin' || userFound.email.toLowerCase() === 'admin@latierrita.es' ? 'admin' : ''
    );

    if (expectedPassword && pwdTrimmed !== expectedPassword && loginPassword !== expectedPassword) {
      setLoginError('Contraseña incorrecta. Por favor verifica tus credenciales.');
      return;
    }

    // Success
    onLogin(userFound);
    onClose();
  };

  const handleGuestLogin = () => {
    const freshGuest = createGuestUser();
    onLogin(freshGuest);
    onClose();
  };


  // --- REGISTER LOGIC ---
  const handleUsernameChange = (val: string) => {
    let clean = val.trim();
    if (!clean.startsWith('@')) {
      clean = '@' + clean.replace(/@/g, '');
    }
    // Only allow lowercase letters, numbers, underscores and periods
    clean = '@' + clean.slice(1).toLowerCase().replace(/[^a-z0-9_.]/g, '');
    setRegData(prev => ({ ...prev, username: clean }));
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    setRegError(null);
    if (!regData.email.trim() || !regData.email.includes('@')) {
      setRegError('Por favor ingresa un correo electrónico válido.');
      return false;
    }
    const alreadyExists = usersList.some(u => u.email.toLowerCase() === regData.email.trim().toLowerCase());
    if (alreadyExists) {
      setRegError('Este correo electrónico ya se encuentra registrado.');
      return false;
    }
    if (regData.password.length < 5) {
      setRegError('La contraseña debe contener al menos 5 caracteres.');
      return false;
    }
    if (regData.password !== regData.confirmPassword) {
      setRegError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    setRegError(null);
    if (!regData.name.trim()) {
      setRegError('Por favor ingresa tu nombre.');
      return false;
    }
    if (!regData.lastName.trim()) {
      setRegError('Por favor ingresa tu(s) apellido(s).');
      return false;
    }
    if (!regData.username.trim() || regData.username.trim() === '@' || regData.username.length < 3) {
      setRegError('Ingresa un nombre de usuario válido (Ej. @pepito).');
      return false;
    }
    const usernameTaken = usersList.some(u => u.username.toLowerCase() === regData.username.toLowerCase());
    if (usernameTaken) {
      setRegError('Ese nombre de usuario ya está ocupado por otra persona.');
      return false;
    }
    if (!regData.birthDate) {
      setRegError('Por favor selecciona tu fecha de nacimiento.');
      return false;
    }
    return true;
  };

  // Step 3 Validation & Final Submit
  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regData.originCity) {
      setRegError('Por favor selecciona tu ciudad de origen en Colombia.');
      return;
    }
    if (!regData.currentCity) {
      setRegError('Por favor selecciona tu ciudad de residencia en España.');
      return;
    }

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      email: regData.email.trim(),
      password: regData.password,
      name: regData.name.trim(),
      lastName: regData.lastName.trim(),
      username: regData.username.trim(),
      birthDate: regData.birthDate,
      originCity: regData.originCity,
      currentCity: regData.currentCity,
      role: 'usuario', // Default user type
      isStaff: false,
      avatar: '🧑‍💻',
      createdAt: new Date().toISOString().split('T')[0],
      bio: '¡Hola! Soy nuevo en La Tierrita 🇨🇴',
      postsCount: 0,
      followersCount: 0,
      followingCount: 0
    };

    onRegisterUser(newUser);
    setRegSuccess(true);
    setTimeout(() => {
      onLogin(newUser);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#001433] text-[#003087] dark:text-[#C4C4C4] h-screen max-h-screen w-full overflow-hidden flex flex-col justify-between animate-fadeIn relative">
      
      {/* SINGLE THEME TOGGLE BUTTON (CLARO / OSCURO) */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-[#002266]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm text-[#003087] dark:text-[#FFCD00] hover:scale-105 active:scale-95 transition-all"
        title={isDarkMode ? "Cambiar a modo Claro" : "Cambiar a modo Oscuro"}
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-[#003087]" />}
      </button>

      {/* CENTERED MAIN CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 my-auto flex flex-col justify-center space-y-3.5 overflow-y-auto scrollbar-none">
        
        {/* CENTERED BRANDING LOGO */}
        <div className="flex justify-center items-center py-1">
          <img 
            src={logoImg} 
            alt="La Tierrita Logo" 
            className="h-14 sm:h-16 w-auto object-contain drop-shadow-md rounded-xl"
          />
        </div>

        {/* MODE SWITCH TABS */}
        <div className="p-1 bg-[#003087]/5 dark:bg-[#002266] rounded-2xl border border-black/5 dark:border-white/10 grid grid-cols-2 gap-1 text-xs font-bold shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setLoginError(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-white dark:bg-[#003087] text-[#003087] dark:text-[#FFCD00] shadow-md border border-black/5 dark:border-white/10'
                : 'text-[#C4C4C4] dark:text-[#C4C4C4]/70 hover:text-[#003087] dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setRegError(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-white dark:bg-[#003087] text-[#003087] dark:text-[#FFCD00] shadow-md border border-black/5 dark:border-white/10'
                : 'text-[#C4C4C4] dark:text-[#C4C4C4]/70 hover:text-[#003087] dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Registrarse (3 Pasos)
          </button>
        </div>

        {/* MAIN FORM CARD */}
        <div className="bg-white dark:bg-[#002266]/80 border border-black/10 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-4 shrink-0">
          
          {/* ========================================================= */}
          {/* ==================== 1. MODO INICIO DE SESIÓN ============ */}
          {/* ========================================================= */}
          {authMode === 'login' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Email & Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" /> Correo o Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ejemplo@correo.com o usuario"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all placeholder:text-[#C4C4C4]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" /> Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 pr-10 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all placeholder:text-[#C4C4C4]/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#003087] hover:bg-[#002266] active:scale-98 text-white dark:bg-[#FFCD00] dark:text-[#003087] dark:hover:bg-[#E6B800] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" /> Iniciar Sesión con Correo
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 active:scale-98 text-[#003087] dark:text-[#C4C4C4] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-black/5 dark:border-white/10"
                  >
                    <Eye className="w-4 h-4" /> Iniciar como invitado
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* ========================================================= */}
          {/* ==================== 2. MODO REGISTRO EN 3 PASOS ========= */}
          {/* ========================================================= */}
          {authMode === 'register' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* SUCCESS MESSAGE */}
              {regSuccess && (
                <div className="p-6 text-center space-y-3 bg-[#003087]/5 dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 rounded-2xl animate-fadeIn">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-sans font-black text-[#003087] dark:text-[#FFCD00] text-base">¡Bienvenido a La Tierrita!</h3>
                  <p className="text-xs text-[#003087] dark:text-[#C4C4C4]">
                    Tu cuenta <span className="font-bold">{regData.username}</span> ha sido creada con éxito con rol <span className="font-bold">Usuario (Default)</span>.
                  </p>
                </div>
              )}

              {!regSuccess && (
                <>
                  {/* STEPPER PROGRESS BAR */}
                  <div className="space-y-1.5 pb-2 border-b border-[#C4C4C4]/40 dark:border-[#FFCD00]/20">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#003087] dark:text-[#C4C4C4]">
                        {regStep === 1 && "Paso 1: Correo y Contraseña"}
                        {regStep === 2 && "Paso 2: Datos Personales"}
                        {regStep === 3 && "Paso 3: Raíces y Ciudades"}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#003087] dark:text-[#FFCD00] bg-[#003087]/10 dark:bg-[#FFCD00]/20 px-2 py-0.5 rounded-full border border-[#003087]/20 dark:border-[#FFCD00]/30">
                        Paso {regStep} de 3
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${regStep >= 1 ? 'bg-[#003087] dark:bg-[#FFCD00]' : 'bg-[#C4C4C4]/40'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${regStep >= 2 ? 'bg-[#003087] dark:bg-[#FFCD00]' : 'bg-[#C4C4C4]/40'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${regStep >= 3 ? 'bg-[#003087] dark:bg-[#FFCD00]' : 'bg-[#C4C4C4]/40'}`} />
                    </div>
                  </div>

                  {regError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* ---------------- PASO 1 ---------------- */}
                  {regStep === 1 && (
                    <div className="space-y-3 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" /> Correo Electrónico
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="tu.correo@ejemplo.com"
                          value={regData.email}
                          onChange={e => setRegData({ ...regData, email: e.target.value })}
                          className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all placeholder:text-[#C4C4C4]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" /> Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Mínimo 5 caracteres"
                            value={regData.password}
                            onChange={e => setRegData({ ...regData, password: e.target.value })}
                            className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 pr-10 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all placeholder:text-[#C4C4C4]/60"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" /> Confirmar Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Repite la contraseña"
                            value={regData.confirmPassword}
                            onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })}
                            className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 pr-10 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all placeholder:text-[#C4C4C4]/60"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00]"
                            title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (validateStep1()) {
                              setRegStep(2);
                            }
                          }}
                          className="w-full py-2.5 bg-[#003087] hover:bg-[#002266] active:scale-98 text-white dark:bg-[#FFCD00] dark:text-[#003087] dark:hover:bg-[#E6B800] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          Siguiente: Datos Personales (Paso 2) <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------- PASO 2 ---------------- */}
                  {regStep === 2 && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1">Nombre</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Juan"
                            value={regData.name}
                            onChange={e => setRegData({ ...regData, name: e.target.value })}
                            className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all placeholder:text-[#C4C4C4]/60"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1">Apellido(s)</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Gómez Ruiz"
                            value={regData.lastName}
                            onChange={e => setRegData({ ...regData, lastName: e.target.value })}
                            className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all placeholder:text-[#C4C4C4]/60"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-[#003087] dark:text-[#C4C4C4]">Nombre de usuario (@pepito)</label>
                          <span className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00]">Identificador único</span>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="@pepito"
                          value={regData.username}
                          onChange={e => handleUsernameChange(e.target.value)}
                          className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] font-mono font-medium outline-none transition-all placeholder:text-[#C4C4C4]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" /> Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          required
                          max="2012-12-31"
                          min="1940-01-01"
                          value={regData.birthDate}
                          onChange={e => setRegData({ ...regData, birthDate: e.target.value })}
                          className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all"
                        />
                      </div>

                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="py-2.5 bg-[#C4C4C4]/20 hover:bg-[#C4C4C4]/30 text-[#003087] dark:text-[#C4C4C4] dark:bg-[#002266] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Atrás
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (validateStep2()) {
                              setRegStep(3);
                            }
                          }}
                          className="py-2.5 bg-[#003087] hover:bg-[#002266] text-white dark:bg-[#FFCD00] dark:text-[#003087] dark:hover:bg-[#E6B800] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          Siguiente (Paso 3) <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------- PASO 3 ---------------- */}
                  {regStep === 3 && (
                    <form onSubmit={handleFinalRegister} className="space-y-3.5 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1.5">
                          <FlagEmoji country="co" size="sm" /> Ciudad Origen (Ciudades de Colombia)
                        </label>
                        <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00] mb-1.5">Tu rincón natal o de donde provienes en Colombia.</p>
                        <select
                          value={regData.originCity}
                          onChange={e => setRegData({ ...regData, originCity: e.target.value })}
                          className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all"
                        >
                          {COLOMBIAN_CITIES.map(city => (
                            <option key={city} value={city} className="bg-white dark:bg-[#002266] text-[#003087] dark:text-[#C4C4C4]">{city}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#003087] dark:text-[#C4C4C4] mb-1 flex items-center gap-1.5">
                          <FlagEmoji country="es" size="sm" /> Ciudad Actual (Ciudades de España)
                        </label>
                        <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00] mb-1.5">Dónde resides actualmente en territorio español.</p>
                        <select
                          value={regData.currentCity}
                          onChange={e => setRegData({ ...regData, currentCity: e.target.value })}
                          className="w-full bg-white dark:bg-[#002266] border border-[#C4C4C4] dark:border-[#FFCD00]/40 focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-3 py-2 text-xs text-[#003087] dark:text-[#C4C4C4] outline-none transition-all"
                        >
                          {SPANISH_CITIES.map(city => (
                            <option key={city} value={city} className="bg-white dark:bg-[#002266] text-[#003087] dark:text-[#C4C4C4]">{city}</option>
                          ))}
                        </select>
                      </div>

                      {/* Summary recap box */}
                      <div className="bg-[#003087]/5 dark:bg-[#002266] rounded-2xl p-3 border border-[#C4C4C4]/60 dark:border-[#FFCD00]/30 text-[11px] space-y-1 text-[#003087] dark:text-[#C4C4C4]">
                        <div className="flex justify-between">
                          <span className="text-[#C4C4C4] dark:text-[#FFCD00]">Usuario nuevo:</span>
                          <span className="font-bold text-[#003087] dark:text-[#C4C4C4]">{regData.name} {regData.lastName} ({regData.username})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#C4C4C4] dark:text-[#FFCD00]">Rol asignado:</span>
                          <span className="font-bold text-[#003087] dark:text-[#FFCD00]">Usuario (Default)</span>
                        </div>
                      </div>

                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(2)}
                          className="py-2.5 bg-[#C4C4C4]/20 hover:bg-[#C4C4C4]/30 text-[#003087] dark:text-[#C4C4C4] dark:bg-[#002266] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Atrás
                        </button>
                        <button
                          type="submit"
                          className="py-2.5 bg-[#003087] hover:bg-[#002266] text-white dark:bg-[#FFCD00] dark:text-[#003087] dark:hover:bg-[#E6B800] font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Completar Registro
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

            </div>
          )}

        </div>

      </main>

      {/* FULLSCREEN FOOTER */}
      <footer className="py-2.5 px-4 text-center border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/30 backdrop-blur-xs space-y-0.5">
        <p className="font-semibold text-xs text-[#003087] dark:text-[#FFCD00]">La Tierrita App © copyright 2026</p>
        <p className="text-[11px] text-[#C4C4C4]">Conectando a nuestra gente Colombiana en España 💛💙❤️</p>
      </footer>
    </div>
  );
};
