import React, { useState } from 'react';
import { X, Search, Check, UserPlus, ShieldCheck, ArrowLeft } from 'lucide-react';
import { AppUser } from '../types/auth';
import { FlagEmoji } from './FlagEmoji';
import { DEFAULT_USERS } from '../data/defaultUsers';
import { isImageAvatar } from '../utils/commentUtils';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following';
  targetUser: AppUser | null;
  currentUser: AppUser;
  usersList: AppUser[];
  followedUserIds: string[];
  onToggleFollow: (userId: string) => void;
  onSelectUser: (username: string) => void;
}

// Generate sample realistic followers for demo richness if list is small
const EXTRA_SAMPLE_USERS: AppUser[] = [
  {
    id: 'sample-u1',
    email: 'andrea@latierrita.es',
    name: 'Andrea',
    lastName: 'Gómez',
    username: '@andre_paisa',
    birthDate: '1995-04-12',
    originCity: 'Medellín (Antioquia)',
    currentCity: 'Madrid (Comunidad de Madrid)',
    role: 'usuario',
    isStaff: false,
    avatar: '👩‍🎨',
    createdAt: '2025-02-10',
    bio: 'Paisa en Madrid. Amante del café y el arte ☕✨'
  },
  {
    id: 'sample-u2',
    email: 'santiago@latierrita.es',
    name: 'Santiago',
    lastName: 'Morales',
    username: '@santi_rola',
    birthDate: '1997-09-22',
    originCity: 'Bogotá, D.C.',
    currentCity: 'Barcelona (Cataluña)',
    role: 'usuario',
    isStaff: false,
    avatar: '👨‍🍳',
    createdAt: '2025-01-15',
    bio: 'Cocinando empanadas y ají en Barna 🥟🌶️'
  },
  {
    id: 'sample-u3',
    email: 'lucia@latierrita.es',
    name: 'Lucía',
    lastName: 'Bermúdez',
    username: '@luci_caleña',
    birthDate: '1999-12-05',
    originCity: 'Cali (Valle del Cauca)',
    currentCity: 'Valencia (Comunidad Valenciana)',
    role: 'usuario',
    isStaff: false,
    avatar: '💃',
    createdAt: '2025-03-01',
    bio: 'Caleña azucarera en Valencia 💃🏖️'
  },
  {
    id: 'sample-u4',
    email: 'camilo@latierrita.es',
    name: 'Camilo',
    lastName: 'Torres',
    username: '@camilo_pereira',
    birthDate: '1993-06-18',
    originCity: 'Pereira (Risaralda)',
    currentCity: 'Sevilla (Andalucía)',
    role: 'usuario',
    isStaff: false,
    avatar: '☕',
    createdAt: '2024-11-20',
    bio: 'Eje cafetero presente en el sur de España ☀️☕'
  },
  {
    id: 'sample-u5',
    email: 'mariana@latierrita.es',
    name: 'Mariana',
    lastName: 'Ríos',
    username: '@marianita_costa',
    birthDate: '2001-08-30',
    originCity: 'Cartagena (Bolívar)',
    currentCity: 'Alicante (Comunidad Valenciana)',
    role: 'usuario',
    isStaff: false,
    avatar: '🌴',
    createdAt: '2025-02-28',
    bio: 'Brisa del Caribe en el Mediterráneo 🌊🌴'
  }
];

export const UserListModal: React.FC<UserListModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'followers',
  targetUser,
  currentUser,
  usersList = [],
  followedUserIds = [],
  onToggleFollow,
  onSelectUser
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !targetUser) return null;

  // Build combined pool of unique users by ID excluding guest user
  const rawPool = [...usersList, ...DEFAULT_USERS, ...EXTRA_SAMPLE_USERS];
  const userMap = new Map<string, AppUser>();
  rawPool.forEach(u => {
    if (
      u &&
      u.id &&
      u.role !== 'invitado' &&
      u.username !== '@invitado' &&
      !u.id.includes('guest') &&
      !u.username.toLowerCase().startsWith('@user_')
    ) {
      if (!userMap.has(u.id)) {
        userMap.set(u.id, u);
      }
    }
  });
  const allPool = Array.from(userMap.values());

  // Divide into followers and following pools
  const followersList = allPool.filter(u => u.id !== targetUser.id);
  const followingList = allPool.filter(u => u.id !== targetUser.id && u.id !== currentUser.id);

  const displayList = activeTab === 'followers' ? followersList : followingList;

  const filteredList = displayList.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.originCity && u.originCity.toLowerCase().includes(q)) ||
      (u.currentCity && u.currentCity.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#001B44] flex flex-col w-full h-full animate-fadeIn overflow-hidden">
      {/* FULLSCREEN HEADER */}
      <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#001B44]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h3 className="font-sans font-bold text-base text-[#003087] dark:text-[#FFCD00] leading-tight">
              {targetUser.username}
            </h3>
            <p className="text-[11px] text-[#C4C4C4] font-medium">
              {activeTab === 'followers' ? 'Seguidores' : 'Seguidos'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* TAB TOGGLERS */}
      <div className="flex border-b border-black/5 dark:border-white/10 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <button
          type="button"
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'followers'
              ? 'border-[#FFCD00] text-[#003087] dark:text-[#FFCD00]'
              : 'border-transparent text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white'
          }`}
        >
          Seguidores ({followersList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'following'
              ? 'border-[#FFCD00] text-[#003087] dark:text-[#FFCD00]'
              : 'border-transparent text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white'
          }`}
        >
          Seguidos ({followingList.length})
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="p-4 border-b border-black/5 dark:border-white/10 shrink-0 bg-white dark:bg-[#001B44]">
        <div className="relative flex items-center max-w-lg mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 text-[#C4C4C4]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, usuario o ciudad..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-black/5 dark:bg-white/10 text-xs text-[#003087] dark:text-[#FFCD00] placeholder-[#C4C4C4] dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SCROLLABLE USERS LIST */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl w-full mx-auto space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-[#C4C4C4]">
            <p className="text-sm font-semibold text-[#003087] dark:text-white">Sin resultados</p>
            <p className="text-xs text-[#C4C4C4] mt-1">No se encontraron usuarios para esta búsqueda.</p>
          </div>
        ) : (
          filteredList.map((userItem, idx) => {
            const isSelfItem = userItem.id === currentUser.id || userItem.username === currentUser.username;
            const isFollowing = followedUserIds.includes(userItem.id);

            return (
              <div
                key={`${userItem.id}-${idx}`}
                onClick={() => {
                  onSelectUser(userItem.username);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#003087]/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-xl border border-black/5 dark:border-white/10 shadow-2xs">
                    {isImageAvatar(userItem.avatar) ? (
                      <img src={userItem.avatar} alt={userItem.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{userItem.avatar || '🇨🇴'}</span>
                    )}
                  </div>

                  <div className="min-w-0 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#003087] dark:text-[#FFCD00] text-sm truncate group-hover:underline">
                        {userItem.username}
                      </span>
                      {userItem.isStaff && (
                        <ShieldCheck className="w-4 h-4 text-[#FFCD00] shrink-0" />
                      )}
                    </div>
                    <p className="text-[#003087]/80 dark:text-white/80 truncate text-xs font-medium">
                      {userItem.name} {userItem.lastName || ''}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#C4C4C4] truncate pt-0.5">
                      {userItem.originCity && (
                        <span className="inline-flex items-center gap-1">
                          <span>{userItem.originCity.replace(/🇨🇴|🇪🇸/g, '').trim()}</span>
                          <FlagEmoji country="co" size="sm" />
                        </span>
                      )}
                      {userItem.originCity && userItem.currentCity && <span>•</span>}
                      {userItem.currentCity && (
                        <span className="inline-flex items-center gap-1">
                          <span>{userItem.currentCity.replace(/🇨🇴|🇪🇸/g, '').trim()}</span>
                          <FlagEmoji country="es" size="sm" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                {!isSelfItem && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFollow(userItem.id);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isFollowing
                        ? 'bg-black/5 dark:bg-white/10 text-[#003087] dark:text-white border border-black/10 dark:border-white/20'
                        : 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] hover:scale-105 active:scale-95 shadow-xs'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
