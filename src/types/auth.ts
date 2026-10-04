export type UserRole = 
  | 'invitado' 
  | 'usuario' 
  | 'moderador' 
  | 'soporte' 
  | 'administrador';

export type ThemeMode = 'claro' | 'oscuro' | 'sistema';

export interface AppUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  lastName: string;
  username: string; // e.g. '@pepito'
  birthDate: string; // YYYY-MM-DD
  originCity: string; // Ciudad de Colombia
  currentCity: string; // Ciudad de España
  role: UserRole;
  isStaff: boolean;
  avatar: string;
  createdAt: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  age?: number;
  website?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  xTwitter?: string;
  phone?: string;
}

export interface RegisterFormData {
  // Paso 1
  email: string;
  password: string;
  confirmPassword: string;
  // Paso 2
  name: string;
  lastName: string;
  username: string; // @pepito
  birthDate: string;
  // Paso 3
  originCity: string;
  currentCity: string;
}
