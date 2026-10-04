import { AppUser } from '../types/auth';
import avatarInvitadoImg from '../assets/images/avatar_invitado.png';

export const createGuestUser = (): AppUser => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return {
    id: `user-guest-${randomNum}`,
    email: `invitado_${randomNum}@latierrita.es`,
    name: 'Visitante',
    lastName: 'Invitado',
    username: `@user_${randomNum}`,
    birthDate: '',
    originCity: 'Colombia 🇨🇴',
    currentCity: 'España 🇪🇸',
    role: 'invitado',
    isStaff: false,
    avatar: avatarInvitadoImg,
    createdAt: new Date().toISOString().split('T')[0],
    bio: 'Modo Invitado · Registrate para interactuar con la comunidad 🇨🇴🫶',
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  };
};

export const GUEST_USER: AppUser = createGuestUser();

export const DEFAULT_USERS: AppUser[] = [
  // 0. Cuenta Oficial La Tierrita App
  {
    id: 'user-latierrita-app',
    email: 'latierritaapp@gmail.com',
    password: 'latierritaapp',
    name: 'La Tierrita',
    lastName: 'Oficial',
    username: '@latierrita_app',
    birthDate: '2024-01-01',
    originCity: 'Colombia 🇨🇴',
    currentCity: 'Madrid (Comunidad de Madrid)',
    role: 'administrador',
    isStaff: true,
    avatar: '🇨🇴',
    createdAt: '2024-01-01',
    bio: 'Cuenta Oficial de La Tierrita App 🇨🇴 | Conectando a la comunidad colombiana en España 🇪🇸💛💙❤️',
    postsCount: 120,
    followersCount: 15400,
    followingCount: 35
  },
  // 1. Administrador (ADMIN) (Staff)
  {
    id: 'user-admin',
    email: 'admin@latierrita.es',
    password: 'admin',
    name: 'Carlos Andrés',
    lastName: 'Restrepo Henao',
    username: '@carlos_admin',
    birthDate: '1988-07-20',
    originCity: 'Medellín (Antioquia)',
    currentCity: 'Madrid (Comunidad de Madrid)',
    role: 'administrador',
    isStaff: true,
    avatar: '👑',
    createdAt: '2024-03-01',
    bio: 'Paisa en Madrid. Fundador de La Tierrita. Conectando a nuestra gente en España 💛💙❤️✨',
    postsCount: 45,
    followersCount: 1280,
    followingCount: 320
  },
  // 2. Moderador (MOD) (Staff)
  {
    id: 'user-mod',
    email: 'mod@latierrita.es',
    password: 'mod',
    name: 'Valentina',
    lastName: 'Gómez Osorio',
    username: '@valen_mod',
    birthDate: '1994-03-15',
    originCity: 'Bogotá, D.C.',
    currentCity: 'Barcelona (Cataluña)',
    role: 'moderador',
    isStaff: true,
    avatar: '🛡️',
    createdAt: '2024-06-15',
    bio: 'Rola en Barcelona. Amante del ajiaco, los libros y la cultura colombiana 🥹✨',
    postsCount: 28,
    followersCount: 520,
    followingCount: 190
  },
  // 3. Soporte (Soporte) (Staff)
  {
    id: 'user-soporte',
    email: 'soporte@latierrita.es',
    password: 'soporte',
    name: 'Felipe',
    lastName: 'Martínez Caicedo',
    username: '@pipe_soporte',
    birthDate: '1996-11-05',
    originCity: 'Cali (Valle del Cauca)',
    currentCity: 'Valencia (Comunidad Valenciana)',
    role: 'soporte',
    isStaff: true,
    avatar: '🎧',
    createdAt: '2024-09-10',
    bio: 'Caleño en Valencia. Salsa, brisa y siempre listo para dar una mano a la comunidad 🫶🎧',
    postsCount: 19,
    followersCount: 410,
    followingCount: 180
  },
  // 4. Invitado
  GUEST_USER
];
