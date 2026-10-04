import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  Megaphone, 
  MapPin, 
  MessageCircle, 
  Bell, 
  Compass, 
  Crown, 
  ShieldCheck, 
  Headphones, 
  Sparkles, 
  KeyRound, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Calendar, 
  Mail, 
  ShieldAlert, 
  UserPlus, 
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Info,
  Check,
  Plus,
  Phone,
  Trash,
  Flag,
  MoreVertical,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  LayoutGrid,
  Tag,
  Bookmark,
  Lock,
  Heart as HeartIcon,
  Image as ImageIcon,
  Search,
  X
} from 'lucide-react';
import { AppUser, UserRole, ThemeMode } from './types/auth';
import { ProfilePost, ProfileTabType, PostComment } from './types/post';
import { INITIAL_USER_POSTS, INITIAL_TAGGED_POSTS, INITIAL_SAVED_POSTS } from './data/samplePosts';
import { DEFAULT_USERS, GUEST_USER, createGuestUser } from './data/defaultUsers';
import { SPANISH_CITIES } from './data/cities';
import { AuthModal } from './components/AuthModal';
import { ProfileMenuModal } from './components/ProfileMenuModal';
import { ProfileFeedModal } from './components/ProfileFeedModal';
import { CreatePostModal } from './components/CreatePostModal';
import { UserListModal } from './components/UserListModal';
import { ExploreCarousel } from './components/ExploreCarousel';
import { FlagEmoji, TextWithFlags } from './components/FlagEmoji';
import logo from './assets/images/la_tierrita_logo.png';
import { countTotalComments, isImageAvatar } from './utils/commentUtils';
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from './lib/supabase';
import { InfoSection } from './types/infoSection';
import { DEFAULT_INFO_SECTIONS } from './data/defaultInfoSections';
import { InfoSectionDetailModal } from './components/InfoSectionDetailModal';
import { CreateInfoSectionModal } from './components/CreateInfoSectionModal';

// Safe storage wrapper to prevent crash if iframe or browser blocks localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  }
};

export interface Announcement {
  id: string;
  title: string;
  authorName: string;
  authorUsername: string;
  authorId: string;
  category: string;
  description: string;
  city: string;
  phone: string;
  createdAt: string;
  price?: number;
  images?: string[];
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ad-1',
    title: 'Se Alquila Habitación en Lavapiés',
    authorName: 'Yina Paola',
    authorUsername: '@yinapaola',
    authorId: 'user-2',
    category: 'Vivienda',
    description: 'Alquilo habitación exterior amoblada en zona céntrica de Madrid (Lavapiés) para persona sola o estudiante colombiano. Ambiente familiar y respetuoso, incluye servicios e internet de alta velocidad.',
    city: 'Madrid (Comunidad de Madrid)',
    phone: '+34600112233',
    price: 420,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80"
    ],
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'ad-2',
    title: 'Arepas de Choclo con Quesito Auténtico',
    authorName: 'Juan Carlos',
    authorUsername: '@juan_carlos',
    authorId: 'user-3',
    category: 'Vivienda',
    description: 'Venta de espectaculares arepas de choclo hechas en casa con quesito campesino auténtico. Entrega a domicilio los fines de semana en Barcelona o recogida en Sants. ¡Sabor 100% colombiano!',
    city: 'Barcelona (Cataluña)',
    phone: '+34611223344',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'ad-3',
    title: 'Servicio de Mudanzas y Portes Económicos',
    authorName: 'Mateo Gómez',
    authorUsername: '@mateogomez',
    authorId: 'user-4',
    category: 'Alquiler',
    description: 'Ofrezco servicios de mudanza pequeña y transporte de mercancías en furgoneta propia dentro de Valencia y cercanías. Responsabilidad, puntualidad y precios muy solidarios para compatriotas.',
    city: 'Valencia (Comunidad Valenciana)',
    phone: '+34622334455',
    price: 45,
    images: [
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
    ],
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString()
  },
  {
    id: 'ad-4',
    title: 'Busco Empleo de Cuidado de Adultos o Servicio Doméstico',
    authorName: 'Camila Restrepo',
    authorUsername: '@camila_restrepo',
    authorId: 'user-5',
    category: 'Empleo',
    description: 'Busco empleo como cuidadora de personas mayores o servicio doméstico en Alicante. Cuento con excelentes referencias demostrables, permiso de trabajo y disponibilidad inmediata.',
    city: 'Alicante (Comunidad Valenciana)',
    phone: '+34633445566',
    createdAt: new Date(Date.now() - 22 * 3600000).toISOString()
  }
];

export default function App() {
  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<'inicio' | 'explorar' | 'perfil' | 'anuncios' | 'lugares'>('inicio');

  // --- THEME STATE (Claro, Oscuro, Predeterminado del sistema) ---
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = safeLocalStorage.getItem('tierrita_theme');
    if (saved === 'claro' || saved === 'oscuro' || saved === 'sistema') {
      return saved;
    }
    return 'sistema';
  });

  // Profile 3-dots menu modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  // --- INICIO SUB-TABS & CURRENCY STATE ---
  const [inicioSubTab, setInicioSubTab] = useState<'comunidad' | 'informacion'>('informacion');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  // --- INFORMATIVE SECTIONS WITH TEXT EDITOR STATE ---
  const [infoSections, setInfoSections] = useState<InfoSection[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('tierrita_info_sections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_INFO_SECTIONS;
  });
  const [activeInfoSection, setActiveInfoSection] = useState<InfoSection | null>(null);
  const [isCreateInfoModalOpen, setIsCreateInfoModalOpen] = useState(false);

  // Sync info sections to localStorage and fetch from server API
  useEffect(() => {
    try {
      safeLocalStorage.setItem('tierrita_info_sections', JSON.stringify(infoSections));
    } catch {}
  }, [infoSections]);

  // Load info sections from Supabase (primary VPS database) and backend server (fallback)
  const loadSections = async () => {
    let customLoaded: InfoSection[] = [];

    // 1. Try Supabase first if configured
    if (isSupabaseConfigured() && supabase) {
      const combinedMap = new Map<string, InfoSection>();

      // A. Try dedicated info_sections table
      try {
        const { data: infoData, error: infoError } = await supabase
          .from('info_sections')
          .select('*')
          .order('created_at', { ascending: false });

        if (!infoError && Array.isArray(infoData) && infoData.length > 0) {
          infoData.forEach((row: any) => {
            combinedMap.set(String(row.id), {
              id: String(row.id),
              title: row.title,
              desc: row.description || row.desc || '',
              content: row.content || '',
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || undefined,
              authorName: row.author_name || undefined,
              isCustom: row.is_custom !== undefined ? Boolean(row.is_custom) : true
            });
          });
        }
      } catch {}

      // B. Try posts table (where location = '__TIERRITA_SYSTEM_INFO__')
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('location', '__TIERRITA_SYSTEM_INFO__')
          .order('created_at', { ascending: false });

        if (!postsError && Array.isArray(postsData) && postsData.length > 0) {
          postsData.forEach((row: any) => {
            try {
              const parsed = JSON.parse(row.caption);
              if (parsed && parsed.title) {
                const secId = String(row.id);
                if (!combinedMap.has(secId)) {
                  combinedMap.set(secId, {
                    id: secId,
                    title: parsed.title,
                    desc: parsed.desc || parsed.description || '',
                    content: parsed.content || '',
                    createdAt: parsed.createdAt || row.created_at,
                    updatedAt: parsed.updatedAt,
                    authorName: parsed.authorName || row.author_name,
                    isCustom: true
                  });
                }
              }
            } catch {}
          });
        }
      } catch {}

      customLoaded = Array.from(combinedMap.values());
    }

    if (customLoaded.length > 0) {
      setInfoSections(prev => {
        const customIds = new Set(customLoaded.map(c => c.id));
        const localCustom = prev.filter(p => p.isCustom && !customIds.has(p.id));
        const merged = [
          ...customLoaded,
          ...localCustom,
          ...DEFAULT_INFO_SECTIONS.filter(def => !customIds.has(def.id) && !localCustom.some(lc => lc.id === def.id))
        ];
        safeLocalStorage.setItem('tierrita_info_sections', JSON.stringify(merged));
        return merged;
      });
      return;
    }

    // 2. Try Node/Express server API fallback
    try {
      const res = await fetch('/api/info-sections');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const serverData = await res.json();
        if (Array.isArray(serverData) && serverData.length > 0) {
          setInfoSections(prev => {
            const serverIds = new Set(serverData.map((s: any) => s.id));
            const localCustom = prev.filter(p => p.isCustom && !serverIds.has(p.id));
            const merged = [...localCustom, ...serverData];
            safeLocalStorage.setItem('tierrita_info_sections', JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch {}
  };

  // Realtime subscription + cross-tab BroadcastChannel + 3s auto-poll
  useEffect(() => {
    // 1. Cross-tab sync in the same browser (instantly updates guest accounts in other tabs/windows)
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('tierrita_info_sections_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'CREATE' && event.data.section) {
          setInfoSections(prev => {
            if (prev.some(s => s.id === event.data.section.id)) return prev;
            return [event.data.section, ...prev];
          });
        } else if (event.data?.type === 'UPDATE' && event.data.section) {
          setInfoSections(prev => prev.map(s => s.id === event.data.section.id ? event.data.section : s));
        } else if (event.data?.type === 'DELETE' && event.data.sectionId) {
          setInfoSections(prev => prev.filter(s => s.id !== event.data.sectionId));
        }
      };
    } catch {}

    // 2. Initial load
    loadSections();

    // 3. Supabase Realtime channel subscription
    let channel: any = null;
    if (isSupabaseConfigured() && supabase) {
      try {
        channel = supabase.channel('realtime_info_sections_watch')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload: any) => {
            if (
              payload?.new?.location === '__TIERRITA_SYSTEM_INFO__' || 
              payload?.old?.location === '__TIERRITA_SYSTEM_INFO__'
            ) {
              loadSections();
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'info_sections' }, () => {
            loadSections();
          })
          .subscribe();
      } catch {}
    }

    // 4. Auto-poll interval every 3 seconds to guarantee instant UI sync on all devices & guests
    const pollInterval = setInterval(() => {
      loadSections();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Ordenar secciones informativas de nuevo a antigüedad (las más recientes arriba)
  const sortedInfoSections = [...infoSections].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const handleSaveInfoSection = async (updated: InfoSection) => {
    setInfoSections(prev => prev.map(s => s.id === updated.id ? updated : s));
    setActiveInfoSection(updated);

    // Broadcast immediately to other tabs/windows in the same browser
    try {
      const bc = new BroadcastChannel('tierrita_info_sections_sync');
      bc.postMessage({ type: 'UPDATE', section: updated });
      bc.close();
    } catch {}

    // 1. Update in Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('info_sections').upsert({
          id: updated.id,
          title: updated.title,
          description: updated.desc,
          content: updated.content,
          updated_at: new Date().toISOString()
        });
      } catch {}

      try {
        await supabase.from('posts').update({
          caption: JSON.stringify(updated)
        }).eq('id', updated.id);
      } catch {}
    }

    // 2. Persist to server API
    fetch(`/api/info-sections/${encodeURIComponent(updated.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});
  };

  const handleDeleteInfoSection = async (sectionId: string) => {
    setInfoSections(prev => {
      const updated = prev.filter(s => s.id !== sectionId);
      try {
        safeLocalStorage.setItem('tierrita_info_sections', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveInfoSection(null);

    // Broadcast immediately to other tabs/windows
    try {
      const bc = new BroadcastChannel('tierrita_info_sections_sync');
      bc.postMessage({ type: 'DELETE', sectionId });
      bc.close();
    } catch {}

    // 1. Delete in Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('info_sections').delete().eq('id', sectionId);
      } catch {}
      try {
        await supabase.from('posts').delete().eq('id', sectionId);
      } catch {}
    }

    // 2. Persist to server API
    fetch(`/api/info-sections/${encodeURIComponent(sectionId)}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  const [eurAmount, setEurAmount] = useState<string>('100');
  const [copAmount, setCopAmount] = useState<string>('374000.00');
  const [exchangeRate, setExchangeRate] = useState<number>(3740.03);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    const today = new Date();
    const day = today.getUTCDate();
    const month = today.toLocaleString('es-CO', { month: 'short', timeZone: 'UTC' });
    const hours = today.getUTCHours().toString().padStart(2, '0');
    const minutes = today.getUTCMinutes().toString().padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes} UTC`;
  });

  const handleEurChange = (val: string) => {
    setEurAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setCopAmount((parsed * exchangeRate).toFixed(2));
    } else {
      setCopAmount('');
    }
  };

  const handleCopChange = (val: string) => {
    setCopAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setEurAmount((parsed / exchangeRate).toFixed(2));
    } else {
      setEurAmount('');
    }
  };

  const handleRateChange = (rate: number) => {
    setExchangeRate(rate);
    const parsedEur = parseFloat(eurAmount);
    if (!isNaN(parsedEur)) {
      setCopAmount((parsedEur * rate).toFixed(2));
    }
  };

  // Fetch live exchange rate automatically when the component mounts
  useEffect(() => {
    const fetchLiveRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && typeof data.rates.COP === 'number') {
            const liveRate = data.rates.COP;
            setExchangeRate(liveRate);
            
            // Recalculate default amounts with the live rate
            setCopAmount((100 * liveRate).toFixed(2));

            // Format precise UTC date
            const today = new Date();
            const day = today.getUTCDate();
            const month = today.toLocaleString('es-CO', { month: 'short', timeZone: 'UTC' });
            const hours = today.getUTCHours().toString().padStart(2, '0');
            const minutes = today.getUTCMinutes().toString().padStart(2, '0');
            setLastUpdated(`${day} ${month}, ${hours}:${minutes} UTC`);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live exchange rate, using Google reference rate fallback.', err);
      }
    };

    fetchLiveRate();
  }, []);

  // Helper to safely load posts from localStorage, excluding fictitious/mock posts
  const loadSavedPosts = (key: string, defaultPosts: ProfilePost[]): ProfilePost[] => {
    try {
      const raw = safeLocalStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Remove any fictitious posts with mock IDs or AI-generated demo assets
          const filtered = parsed.filter((p: any) => 
            p && 
            p.id && 
            !String(p.id).startsWith('post-latierrita') && 
            !String(p.id).startsWith('post-fictitious') &&
            !(p.imageUrl && (
              p.imageUrl.includes('colombian_bakery') || 
              p.imageUrl.includes('colombian_empanadas') || 
              p.imageUrl.includes('la_tierrita_banner') || 
              p.imageUrl.includes('vallenato_salsa') ||
              p.imageUrl.includes('unsplash.com')
            ))
          );
          return filtered;
        }
      }
    } catch {
      // ignore JSON parse error
    }
    return defaultPosts;
  };

  // Cargar publicaciones reales desde Supabase si está configurado
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const client = supabase;

    const fetchRealPosts = async () => {
      try {
        const { data, error } = await client
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && Array.isArray(data)) {
          const loaded: ProfilePost[] = data
            .filter((row: any) => !String(row.id).startsWith('info-') && row.location !== '__TIERRITA_SYSTEM_INFO__')
            .map((row: any) => ({
            id: String(row.id),
            authorId: String(row.author_id || 'unknown'),
            authorName: row.author_name || 'Usuario',
            authorUsername: row.author_username || '@usuario',
            authorAvatar: row.author_avatar || '🇨🇴',
            location: row.location || undefined,
            imageUrl: row.image_url,
            caption: row.caption || '',
            likesCount: row.likes_count || 0,
            commentsCount: row.comments_count || 0,
            savesCount: row.saves_count || 0,
            timestamp: new Date(row.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            disableComments: row.disable_comments,
            hideLikesCount: row.hide_likes_count,
            comments: []
          }));
          setUserPosts(loaded);
          safeLocalStorage.setItem('tierrita_user_posts', JSON.stringify(loaded));
        }
      } catch (err) {
        console.error('Error fetching Supabase posts:', err);
      }
    };

    fetchRealPosts();
  }, []);

  // Profile grid tabs & posts state
  const [profileTab, setProfileTab] = useState<ProfileTabType>('publicaciones');
  const [userPosts, setUserPosts] = useState<ProfilePost[]>(() => {
    const posts = loadSavedPosts('tierrita_user_posts', INITIAL_USER_POSTS);
    return posts.filter(p => p.authorUsername !== '@pepito' && p.authorId !== 'user-pepito');
  });
  const [taggedPosts, setTaggedPosts] = useState<ProfilePost[]>(() => loadSavedPosts('tierrita_tagged_posts', INITIAL_TAGGED_POSTS));
  const [savedPosts, setSavedPosts] = useState<ProfilePost[]>(() => loadSavedPosts('tierrita_saved_posts', INITIAL_SAVED_POSTS));

  // Create post modal state
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Feed viewer modal state
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [selectedFeedPostId, setSelectedFeedPostId] = useState<string | undefined>(undefined);
  const [feedModalTitle, setFeedModalTitle] = useState('Publicaciones');
  const [activeFeedList, setActiveFeedList] = useState<ProfilePost[]>([]);

  // User Profile & Follow State
  const [viewingProfileUser, setViewingProfileUser] = useState<AppUser | null>(null);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [userListModalTab, setUserListModalTab] = useState<'followers' | 'following'>('followers');

  // Explore Tab Search State
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [isExploreSearchFocused, setIsExploreSearchFocused] = useState(false);

  // --- ANUNCIOS STATE ---
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [selectedAdCity, setSelectedAdCity] = useState('');
  const [selectedAdCategory, setSelectedAdCategory] = useState('Todos');
  const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(false);
  const [selectedAdDetail, setSelectedAdDetail] = useState<Announcement | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [reportAdSuccess, setReportAdSuccess] = useState(false);
  
  // Create Ad Form state
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdCategory, setNewAdCategory] = useState('Vivienda');
  const [newAdPrice, setNewAdPrice] = useState('');
  const [newAdDescription, setNewAdDescription] = useState('');
  const [newAdCity, setNewAdCity] = useState('');
  const [newAdPhone, setNewAdPhone] = useState('+34 ');
  const [newAdImages, setNewAdImages] = useState<string[]>([]);
  const [acceptResponsibility, setAcceptResponsibility] = useState(false);
  const [createAdError, setCreateAdError] = useState('');

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = safeLocalStorage.getItem('tierrita_announcements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error('Failed to parse announcements from localStorage', err);
      }
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  // Save announcements to localStorage
  useEffect(() => {
    console.log('Announcements state updated, new length:', announcements.length);
    safeLocalStorage.setItem('tierrita_announcements', JSON.stringify(announcements));
  }, [announcements]);



  const handleToggleFollowUser = (userId: string) => {
    if (currentUser.role === 'invitado') {
      setGuestNoticeMessage('Inicia sesión o regístrate para seguir a otros usuarios.');
      return;
    }
    setFollowedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleViewProfile = (username: string) => {
    setIsFeedModalOpen(false);
    const clean = username.startsWith('@') ? username : `@${username}`;
    if (currentUser.role === 'invitado' && clean.toLowerCase() !== currentUser.username.toLowerCase()) {
      setGuestNoticeMessage('Inicia sesión o regístrate para visitar perfiles de otros colombianos.');
      return;
    }
    const foundUser = usersList.find(u => u.username.toLowerCase() === clean.toLowerCase()) 
      || DEFAULT_USERS.find(u => u.username.toLowerCase() === clean.toLowerCase())
      || {
        id: 'user-' + Date.now(),
        email: `${clean.replace('@', '')}@latierrita.es`,
        name: clean.replace('@', ''),
        lastName: '',
        username: clean,
        birthDate: '2000-01-01',
        originCity: 'Colombia 🇨🇴',
        currentCity: 'España 🇪🇸',
        role: 'usuario',
        isStaff: false,
        avatar: '🇨🇴',
        createdAt: '2026-01-01',
        bio: 'Miembro activo de la comunidad La Tierrita 🇨🇴✨',
        postsCount: 1,
        followersCount: 85,
        followingCount: 60
      };
    setViewingProfileUser(foundUser);
    setActiveTab('perfil');
  };

  // Safe array getters for rendering and operations
  const safeUserPosts = Array.isArray(userPosts) ? userPosts : INITIAL_USER_POSTS;

  // Sync posts to localStorage
  useEffect(() => {
    try {
      safeLocalStorage.setItem('tierrita_user_posts', JSON.stringify(safeUserPosts));
    } catch {}
  }, [safeUserPosts]);

  // Sync theme with HTML root class and system media query
  useEffect(() => {
    const applyTheme = () => {
      const isDark = 
        themeMode === 'oscuro' || 
        (themeMode === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    safeLocalStorage.setItem('tierrita_theme', themeMode);

    if (themeMode === 'sistema') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // --- USERS & AUTH STATE ---
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('tierrita_users');
      let baseUsers = DEFAULT_USERS;
      if (saved) {
        const parsed: AppUser[] = JSON.parse(saved);
        const filtered = parsed.filter(u => 
          u.id !== 'user-default' && 
          u.username !== '@pepito' && 
          !(u.originCity && u.originCity.includes('Pereira'))
        );
        baseUsers = [...filtered];
        DEFAULT_USERS.forEach(defUser => {
          const idx = baseUsers.findIndex(u => u.id === defUser.id || u.email.toLowerCase() === defUser.email.toLowerCase());
          if (idx >= 0) {
            baseUsers[idx] = { ...defUser, ...baseUsers[idx], password: defUser.password };
          } else {
            baseUsers.unshift(defUser);
          }
        });
      }
      return baseUsers;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = safeLocalStorage.getItem('tierrita_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username && parsed.username !== '@pepito' && parsed.id !== 'user-default') return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    // Default to the official account @latierrita_app
    return DEFAULT_USERS[0];
  });

  // Rastreo de secciones visitadas por usuario para ocultar la etiqueta 'Nuevo' tras abrirlas
  const [visitedSectionIds, setVisitedSectionIds] = useState<string[]>(() => {
    try {
      const userKey = currentUser ? currentUser.id : 'guest';
      const raw = safeLocalStorage.getItem(`tierrita_visited_sections_${userKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Actualizar lista de visitados cuando cambia de usuario
  useEffect(() => {
    try {
      const userKey = currentUser ? currentUser.id : 'guest';
      const raw = safeLocalStorage.getItem(`tierrita_visited_sections_${userKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setVisitedSectionIds(parsed);
          return;
        }
      }
      setVisitedSectionIds([]);
    } catch {}
  }, [currentUser?.id]);

  const handleOpenInfoSection = (section: InfoSection) => {
    setActiveInfoSection(section);
    // Marcar como visitada para este usuario
    if (!visitedSectionIds.includes(section.id)) {
      const updated = [...visitedSectionIds, section.id];
      setVisitedSectionIds(updated);
      const userKey = currentUser ? currentUser.id : 'guest';
      try {
        safeLocalStorage.setItem(`tierrita_visited_sections_${userKey}`, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleCreateSection = async (newSection: InfoSection) => {
    // Ensure ID is a valid PostgreSQL UUID
    const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    const validId = isValidUUID(newSection.id) ? newSection.id : generateUUID();
    const finalizedSection: InfoSection = { ...newSection, id: validId };

    setInfoSections(prev => [finalizedSection, ...prev]);
    handleOpenInfoSection(finalizedSection);

    // Broadcast immediately to other tabs/windows in the same browser (including guest accounts)
    try {
      const bc = new BroadcastChannel('tierrita_info_sections_sync');
      bc.postMessage({ type: 'CREATE', section: finalizedSection });
      bc.close();
    } catch {}

    // 1. Persist to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('info_sections').upsert({
          id: finalizedSection.id,
          title: finalizedSection.title,
          description: finalizedSection.desc,
          content: finalizedSection.content,
          author_name: finalizedSection.authorName || currentUser.name,
          is_custom: true,
          created_at: finalizedSection.createdAt,
          updated_at: finalizedSection.updatedAt
        });
      } catch {}

      try {
        const { error: postErr } = await supabase.from('posts').upsert({
          id: validId,
          author_name: finalizedSection.authorName || currentUser.name || 'La Tierrita',
          author_username: '@latierrita_app',
          author_avatar: '🇨🇴',
          location: '__TIERRITA_SYSTEM_INFO__',
          image_url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=400&q=80',
          caption: JSON.stringify(finalizedSection),
          likes_count: 0,
          comments_count: 0,
          saves_count: 0,
          created_at: finalizedSection.createdAt || new Date().toISOString()
        });
        if (postErr) {
          console.error('[La Tierrita Supabase Sync]', postErr);
        } else {
          console.log('[La Tierrita Supabase Sync] Sección guardada con éxito en Supabase');
        }
      } catch (err) {
        console.error('[La Tierrita Supabase Sync]', err);
      }
    }

    // 2. Persist to server API so all guests and users see it
    fetch('/api/info-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalizedSection)
    }).catch(err => console.error('Error saving section to server:', err));
  };

  const safeTaggedPosts = currentUser.role === 'invitado' ? [] : (Array.isArray(taggedPosts) ? taggedPosts : INITIAL_TAGGED_POSTS);
  const safeSavedPosts = currentUser.role === 'invitado' ? [] : (Array.isArray(savedPosts) ? savedPosts : INITIAL_SAVED_POSTS);

  useEffect(() => {
    try {
      safeLocalStorage.setItem('tierrita_tagged_posts', JSON.stringify(safeTaggedPosts));
    } catch {}
  }, [safeTaggedPosts]);
  useEffect(() => {
    try {
      safeLocalStorage.setItem('tierrita_saved_posts', JSON.stringify(safeSavedPosts));
    } catch {}
  }, [safeSavedPosts]);

  // Auth Modal State (Open login modal by default as requested)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [guestNoticeMessage, setGuestNoticeMessage] = useState<string | null>(null);

  // Weather simulation
  const [weatherInBogota] = useState(17);
  const [weatherInMadrid] = useState(21);

  // --- PERSISTENCE ---
  useEffect(() => {
    safeLocalStorage.setItem('tierrita_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorage.setItem('tierrita_users', JSON.stringify(usersList));
  }, [usersList]);

  // Sync cities and user contact details with currentUser
  useEffect(() => {
    if (currentUser) {
      if (currentUser.currentCity) {
        setSelectedAdCity(currentUser.currentCity);
        setNewAdCity(currentUser.currentCity);
      } else {
        setSelectedAdCity(SPANISH_CITIES[0]);
        setNewAdCity(SPANISH_CITIES[0]);
      }
      if (currentUser.phone) {
        const p = currentUser.phone.trim();
        if (p.startsWith('+34')) {
          setNewAdPhone(p);
        } else {
          // Prepend +34 if not already present
          setNewAdPhone(`+34 ${p.replace(/^\+/, '')}`);
        }
      } else {
        setNewAdPhone('+34 ');
      }
    }
  }, [currentUser]);

  // Reset ad selection city on arriving at Anuncios tab
  useEffect(() => {
    if (activeTab === 'anuncios' && currentUser && currentUser.currentCity) {
      setSelectedAdCity(currentUser.currentCity);
    }
  }, [activeTab, currentUser]);

  const handlePublishAd = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdError('');

    if (currentUser.role === 'invitado') {
      setGuestNoticeMessage('Inicia sesión o regístrate para publicar anuncios.');
      setIsCreateAdModalOpen(false);
      return;
    }

    const titleValue = newAdTitle.trim();
    if (!titleValue) {
      setCreateAdError('Por favor, escribe un título para el anuncio.');
      return;
    }

    if (titleValue.length > 32) {
      setCreateAdError('El título del anuncio no puede superar los 32 caracteres.');
      return;
    }

    const descValue = newAdDescription.trim();
    if (!descValue) {
      setCreateAdError('Por favor, escribe una descripción para el anuncio.');
      return;
    }

    if (descValue.length > 300) {
      setCreateAdError('La descripción del anuncio no puede superar los 300 caracteres.');
      return;
    }

    const phoneValue = newAdPhone.trim();
    if (!phoneValue || phoneValue === '+34') {
      setCreateAdError('Por favor, ingresa un número de teléfono de contacto.');
      return;
    }

    if (!phoneValue.startsWith('+34')) {
      setCreateAdError('El número de teléfono debe comenzar con el indicativo +34.');
      return;
    }

    if (!acceptResponsibility) {
      setCreateAdError('Debes aceptar la responsabilidad de lo publicado en este anuncio.');
      return;
    }

    // 24 Hour Constraint: 1 announcement per user every 24 hours
    const last24h = Date.now() - 24 * 3600 * 1000;
    const hasRecentAd = announcements.some(
      ad => ad.authorId === currentUser.id && new Date(ad.createdAt).getTime() > last24h
    );

    if (hasRecentAd) {
      setCreateAdError('Límite excedido: Solo puedes publicar 1 anuncio cada 24 horas.');
      return;
    }

    // Check price optional for Vivienda / Alquiler
    let priceNum: number | undefined = undefined;
    if ((newAdCategory === 'Vivienda' || newAdCategory === 'Alquiler') && newAdPrice.trim() !== '') {
      const parsed = parseFloat(newAdPrice);
      if (!isNaN(parsed)) {
        priceNum = parsed;
      }
    }

    const newAd: Announcement = {
      id: `ad-${Date.now()}`,
      title: titleValue,
      authorName: `${currentUser.name} ${currentUser.lastName || ''}`.trim(),
      authorUsername: currentUser.username,
      authorId: currentUser.id,
      category: newAdCategory,
      description: descValue,
      city: newAdCity || currentUser.currentCity || SPANISH_CITIES[0],
      phone: phoneValue,
      price: priceNum,
      images: (newAdCategory === 'Vivienda' || newAdCategory === 'Alquiler' || newAdCategory === 'Eventos') ? newAdImages : undefined,
      createdAt: new Date().toISOString()
    };

    setAnnouncements(prev => [newAd, ...prev]);
    setNewAdTitle('');
    setNewAdDescription('');
    setNewAdPrice('');
    setNewAdImages([]);
    setAcceptResponsibility(false);
    setIsCreateAdModalOpen(false);
  };

  // --- AUTH HANDLERS ---
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    safeLocalStorage.setItem('tierrita_current_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
  };

  const handleRegisterUser = (newUser: AppUser) => {
    const updated = [newUser, ...usersList];
    setUsersList(updated);
    safeLocalStorage.setItem('tierrita_users', JSON.stringify(updated));
    setCurrentUser(newUser);
    safeLocalStorage.setItem('tierrita_current_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    const guest = createGuestUser();
    setCurrentUser(guest);
    safeLocalStorage.setItem('tierrita_current_user', JSON.stringify(guest));
    setIsAuthModalOpen(true);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setCurrentUser(updatedUser);
    safeLocalStorage.setItem('tierrita_current_user', JSON.stringify(updatedUser));
    
    // Also update in usersList if already present
    const updatedList = usersList.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsersList(updatedList);
    safeLocalStorage.setItem('tierrita_users', JSON.stringify(updatedList));

    // Synchronize new avatar and username across all user's posts
    const updatePostAuthor = (posts: ProfilePost[]) =>
      posts.map(p => {
        if (p.authorId === updatedUser.id || p.authorUsername === updatedUser.username) {
          return {
            ...p,
            authorName: updatedUser.name,
            authorUsername: updatedUser.username,
            authorAvatar: updatedUser.avatar
          };
        }
        return p;
      });

    setUserPosts(prev => updatePostAuthor(prev));
    setTaggedPosts(prev => updatePostAuthor(prev));
    setSavedPosts(prev => updatePostAuthor(prev));
    setActiveFeedList(prev => updatePostAuthor(prev));
  };

  // --- POST INTERACTION HANDLERS ---
  const handleOpenFeed = (tab: ProfileTabType, postId: string) => {
    setSelectedFeedPostId(postId);
    if (tab === 'publicaciones') {
      setFeedModalTitle('Publicaciones');
      const authorPosts = safeUserPosts.filter(p => 
        p.authorId === currentUser.id || 
        p.authorUsername === currentUser.username ||
        p.authorUsername.toLowerCase() === currentUser.username.toLowerCase()
      );
      setActiveFeedList(authorPosts);
    } else if (tab === 'etiquetas') {
      setFeedModalTitle('Etiquetas');
      setActiveFeedList(taggedPosts);
    } else {
      setFeedModalTitle('Guardados');
      setActiveFeedList(savedPosts);
    }
    setIsFeedModalOpen(true);
  };

  const handleTogglePostLike = (postId: string) => {
    if (currentUser.role === 'invitado') {
      setGuestNoticeMessage('Inicia sesión o regístrate para dar Me Gusta a las publicaciones.');
      return;
    }
    const updateList = (list: ProfilePost[]) =>
      list.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
          };
        }
        return p;
      });

    setUserPosts(prev => updateList(prev));
    setTaggedPosts(prev => updateList(prev));
    setSavedPosts(prev => updateList(prev));
    setActiveFeedList(prev => updateList(prev));
  };

  const handleTogglePostSave = (postId: string) => {
    if (currentUser.role === 'invitado') {
      setGuestNoticeMessage('Inicia sesión o regístrate para guardar publicaciones.');
      return;
    }
    const allPosts = [...userPosts, ...taggedPosts, ...savedPosts];
    const targetPost = allPosts.find(p => p.id === postId);

    const updateList = (list: ProfilePost[], savedState: boolean) =>
      list.map(p => {
        if (p.id === postId) {
          const currentCount = typeof p.savesCount === 'number' ? p.savesCount : (p.isSaved ? 1 : 0);
          const newCount = savedState ? currentCount + 1 : Math.max(0, currentCount - 1);
          return { ...p, isSaved: savedState, savesCount: newCount };
        }
        return p;
      });

    const isAlreadySaved = savedPosts.some(p => p.id === postId);

    if (isAlreadySaved) {
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
      setUserPosts(prev => updateList(prev, false));
      setTaggedPosts(prev => updateList(prev, false));
      setActiveFeedList(prev => updateList(prev, false));
    } else if (targetPost) {
      const currentCount = typeof targetPost.savesCount === 'number' ? targetPost.savesCount : (targetPost.isSaved ? 1 : 0);
      const newSaved = { ...targetPost, isSaved: true, savesCount: currentCount + 1 };
      setSavedPosts(prev => [newSaved, ...prev]);
      setUserPosts(prev => updateList(prev, true));
      setTaggedPosts(prev => updateList(prev, true));
      setActiveFeedList(prev => updateList(prev, true));
    }
  };

  const handleAddPostComment = (postId: string, text: string, parentCommentId?: string) => {
    if (currentUser.role === 'invitado') {
      setGuestNoticeMessage('Inicia sesión o regístrate para comentar en las publicaciones.');
      return;
    }
    const newComment = {
      id: 'c-' + Date.now(),
      username: currentUser.username,
      avatar: currentUser.avatar,
      text,
      timestamp: 'Ahora mismo',
      parentId: parentCommentId
    };

    const updateList = (list: ProfilePost[]) =>
      list.map(p => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          let updatedComments: PostComment[];

          if (parentCommentId) {
            updatedComments = currentComments.map(c => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment]
                };
              }
              return c;
            });
          } else {
            updatedComments = [...currentComments, newComment];
          }

          return {
            ...p,
            commentsCount: (p.commentsCount || 0) + 1,
            comments: updatedComments
          };
        }
        return p;
      });

    setUserPosts(prev => updateList(prev));
    setTaggedPosts(prev => updateList(prev));
    setSavedPosts(prev => updateList(prev));
    setActiveFeedList(prev => updateList(prev));
  };

  const handleDeletePostComment = (postId: string, commentId: string, parentCommentId?: string) => {
    const updateList = (list: ProfilePost[]) =>
      list.map(p => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          let updatedComments: PostComment[];

          if (parentCommentId) {
            updatedComments = currentComments.map(c => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: (c.replies || []).filter(r => r.id !== commentId)
                };
              }
              return c;
            });
          } else {
            updatedComments = currentComments.filter(c => c.id !== commentId);
          }

          return {
            ...p,
            commentsCount: countTotalComments(updatedComments),
            comments: updatedComments
          };
        }
        return p;
      });

    setUserPosts(prev => updateList(prev));
    setTaggedPosts(prev => updateList(prev));
    setSavedPosts(prev => updateList(prev));
    setActiveFeedList(prev => updateList(prev));
  };

  const handlePublishPost = async (newPost: ProfilePost) => {
    setUserPosts(prev => {
      const updated = [newPost, ...prev];
      safeLocalStorage.setItem('tierrita_user_posts', JSON.stringify(updated));
      return updated;
    });
    setProfileTab('publicaciones');
    
    // Update user posts count
    if (currentUser) {
      const updatedUser: AppUser = {
        ...currentUser,
        postsCount: (currentUser.postsCount || 0) + 1
      };
      handleUpdateUser(updatedUser);
    }

    // Persist to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      try {
        await client.from('posts').insert({
          id: newPost.id,
          author_name: newPost.authorName,
          author_username: newPost.authorUsername,
          author_avatar: newPost.authorAvatar,
          location: newPost.location || '',
          image_url: newPost.imageUrl,
          caption: newPost.caption,
          likes_count: 0,
          comments_count: 0,
          saves_count: 0,
          disable_comments: Boolean(newPost.disableComments),
          hide_likes_count: Boolean(newPost.hideLikesCount),
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving post to Supabase:', err);
      }
    }
  };

  const handleUpdatePostOptions = (postId: string, options: { disableComments?: boolean; hideLikesCount?: boolean; hideSavesCount?: boolean }) => {
    const updateList = (list: ProfilePost[]) =>
      list.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            ...options
          };
        }
        return p;
      });

    setUserPosts(prev => updateList(prev));
    setTaggedPosts(prev => updateList(prev));
    setSavedPosts(prev => updateList(prev));
    setActiveFeedList(prev => updateList(prev));
  };

  const handleDeletePost = (postId: string) => {
    setUserPosts(prev => prev.filter(p => p.id !== postId));
    setTaggedPosts(prev => prev.filter(p => p.id !== postId));
    setSavedPosts(prev => prev.filter(p => p.id !== postId));
    setActiveFeedList(prev => prev.filter(p => p.id !== postId));
    setIsFeedModalOpen(false);

    if (currentUser && currentUser.postsCount && currentUser.postsCount > 0) {
      const updatedUser: AppUser = {
        ...currentUser,
        postsCount: Math.max(0, currentUser.postsCount - 1)
      };
      handleUpdateUser(updatedUser);
    }
  };

  const handleEditPost = (updatedPost: ProfilePost) => {
    const updateList = (list: ProfilePost[]) =>
      list.map(p => p.id === updatedPost.id ? updatedPost : p);

    setUserPosts(prev => updateList(prev));
    setTaggedPosts(prev => updateList(prev));
    setSavedPosts(prev => updateList(prev));
    setActiveFeedList(prev => updateList(prev));
  };


  // Helper to format role presentation & styling
  const getRolePresentation = (role: UserRole) => {
    switch (role) {
      case 'administrador':
        return {
          title: 'Administrador (ADMIN) (Staff)',
          shortLabel: 'ADMIN',
          isStaff: true,
          icon: <Crown className="w-4 h-4 text-purple-600" />,
          pillBadge: 'bg-purple-100 text-purple-900 border-purple-300',
          gradientBg: 'from-purple-900 via-slate-900 to-slate-950',
          accentColor: 'text-purple-400',
          description: 'Acceso total de administración. Puede gestionar usuarios, moderación, configuración y políticas de la plataforma.'
        };
      case 'moderador':
        return {
          title: 'Moderador (MOD) (Staff)',
          shortLabel: 'MOD',
          isStaff: true,
          icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
          pillBadge: 'bg-blue-100 text-blue-900 border-blue-300',
          gradientBg: 'from-blue-950 via-slate-900 to-slate-950',
          accentColor: 'text-blue-400',
          description: 'Miembro del Staff oficial. Encargado de mantener la armonía, moderar contenidos y velar por las normas de la comunidad.'
        };
      case 'soporte':
        return {
          title: 'Soporte (Soporte) (Staff)',
          shortLabel: 'Soporte',
          isStaff: true,
          icon: <Headphones className="w-4 h-4 text-amber-600" />,
          pillBadge: 'bg-amber-100 text-amber-900 border-amber-300',
          gradientBg: 'from-amber-950 via-slate-900 to-slate-950',
          accentColor: 'text-amber-400',
          description: 'Miembro del Staff oficial. Asistencia prioritaria a usuarios colombianos, resolución de dudas y orientación en trámites.'
        };
      case 'usuario':
        return {
          title: 'Usuario (Default)',
          shortLabel: 'Usuario',
          isStaff: false,
          icon: <User className="w-4 h-4 text-emerald-600" />,
          pillBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          gradientBg: 'from-emerald-950 via-slate-900 to-slate-950',
          accentColor: 'text-emerald-400',
          description: 'Usuario verificado regular de la comunidad con perfil registrado (@nombre_usuario, ciudad natal y ciudad actual).'
        };
      case 'invitado':
      default:
        return {
          title: 'Invitado',
          shortLabel: 'Invitado',
          isStaff: false,
          icon: <User className="w-4 h-4 text-slate-500" />,
          pillBadge: 'bg-slate-100 text-slate-700 border-slate-300',
          gradientBg: 'from-slate-800 via-slate-900 to-slate-950',
          accentColor: 'text-slate-400',
          description: 'Modo de exploración libre. No requiere contraseña ni registro previo.'
        };
    }
  };

  const roleInfo = getRolePresentation(currentUser.role);

  // Helper to calculate age from birthDate (YYYY-MM-DD)
  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return null;
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  const userAge = currentUser.age || calculateAge(currentUser.birthDate);

  // If Auth Modal is open, display exclusively the Auth Screen with zero background bleed
  if (isAuthModalOpen) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        initialMode={authModalMode}
        usersList={usersList}
        onRegisterUser={handleRegisterUser}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] flex justify-center text-[#003087] dark:text-[#C4C4C4] font-sans transition-colors duration-200">
      {/* ================= MODAL FULL-SCREEN INFO SECTIONS CON EDITOR DE TEXTO ================= */}
      {activeInfoSection && (
        <InfoSectionDetailModal
          isOpen={true}
          section={activeInfoSection}
          onClose={() => setActiveInfoSection(null)}
          canEdit={currentUser.role === 'administrador' || currentUser.isStaff}
          onSave={handleSaveInfoSection}
          onDelete={handleDeleteInfoSection}
        />
      )}

      {/* ================= MODAL CREAR NUEVA SECCIÓN INFORMATIVA ================= */}
      {isCreateInfoModalOpen && (
        <CreateInfoSectionModal
          isOpen={true}
          onClose={() => setIsCreateInfoModalOpen(false)}
          onCreateSection={handleCreateSection}
          authorName={currentUser.name}
        />
      )}
      
      {/* ================= DESKTOP SIDEBAR LEFT ================= */}
      <aside className="hidden xl:flex flex-col w-80 p-6 sticky top-0 h-screen justify-between border-r border-transparent dark:border-transparent bg-white dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] transition-colors">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-6">
            <FlagEmoji country="co" size="lg" className="shadow-sm" />
            <div>
              <h1 className="text-xl font-sans font-black tracking-tight text-[#003087] dark:text-[#FFCD00]">La Tierrita</h1>
              <p className="text-xs text-[#C4C4C4] dark:text-[#C4C4C4] font-medium tracking-tight">Colombianos en España</p>
            </div>
          </div>

          {/* Logged User Info Card on Sidebar */}
          <div className="bg-[#003087]/5 dark:bg-[#002266]/60 rounded-2xl p-4 border border-transparent dark:border-transparent mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#C4C4C4] dark:text-[#FFCD00] uppercase tracking-wider">Sesión Activa</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.pillBadge}`}>
                {roleInfo.shortLabel} {roleInfo.isStaff && '· Staff'}
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#003087] border border-transparent dark:border-transparent shadow-xs flex items-center justify-center text-xl shrink-0 overflow-hidden">
                {currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http') ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.avatar}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#003087] dark:text-[#C4C4C4] truncate">{currentUser.name} {currentUser.lastName}</p>
                <p className="text-[11px] text-[#C4C4C4] dark:text-[#FFCD00] font-mono truncate">{currentUser.username}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-transparent dark:border-transparent grid grid-cols-2 gap-2 text-center text-[10px]">
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="py-1 px-2 rounded-lg bg-white dark:bg-[#003087] border border-transparent dark:border-transparent font-bold text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-white/10 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="py-1 px-2 rounded-lg bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] font-bold hover:bg-[#002266] dark:hover:bg-[#E6B800] transition-colors"
              >
                + Registro (3P)
              </button>
            </div>
          </div>

          {/* Quick weather / nostalgia widget */}
          <div className="bg-[#003087]/5 dark:bg-[#002266]/60 rounded-2xl p-4 border border-transparent dark:border-transparent mb-6">
            <h3 className="text-xs font-semibold text-[#003087] dark:text-[#FFCD00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Clima en Directo
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white dark:bg-[#003087]/70 rounded-xl p-2 border border-transparent dark:border-transparent">
                <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00] font-semibold uppercase">Bogotá</p>
                <p className="text-lg font-bold text-[#003087] dark:text-[#C4C4C4] font-mono">{weatherInBogota}°C 🌧️</p>
              </div>
              <div className="bg-white dark:bg-[#003087]/70 rounded-xl p-2 border border-transparent dark:border-transparent">
                <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00] font-semibold uppercase">Madrid</p>
                <p className="text-lg font-bold text-[#003087] dark:text-[#C4C4C4] font-mono">{weatherInMadrid}°C ☀️</p>
              </div>
            </div>
            <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00] mt-2 text-center">¡No importa el frío, el café está caliente!</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#C4C4C4] dark:text-[#C4C4C4]/70">
          <p>© 2026 La Tierrita App</p>
          <p className="mt-1">Hecho con amor y nostalgia por la comunidad colombiana en España. <TextWithFlags text="🇨🇴💛💙❤️🇪🇸" /></p>
        </div>
      </aside>

      {/* ================= CENTER DEVICE VIEWPORT ================= */}
      <main className="w-full max-w-md xl:max-w-lg bg-white dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] h-screen h-[100dvh] relative flex flex-col shadow-xl border-none overflow-hidden transition-colors">
        
        {/* APP TOP BAR */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#003087]/80 backdrop-blur-md border-b border-transparent dark:border-transparent px-4 py-2.5 flex items-center justify-between transition-colors">
          {activeTab === 'perfil' ? (
            <>
              {/* Izquierdo - Botón de volver (si se visita otro perfil) o Botón de + (si es el perfil propio) */}
              <div className="w-10 flex justify-start">
                {viewingProfileUser && viewingProfileUser.username !== currentUser.username ? (
                  <button 
                    onClick={() => setViewingProfileUser(null)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-[#FFCD00]/15 active:scale-95 transition-all" 
                    title="Volver a mi perfil"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (currentUser.role === 'invitado') {
                        setGuestNoticeMessage('Inicia sesión o regístrate para publicar fotos y momentos.');
                        return;
                      }
                      setIsCreatePostModalOpen(true);
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-[#FFCD00]/15 active:scale-95 transition-all" 
                    title="Nueva publicación"
                  >
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                  </button>
                )}
              </div>

              {/* Centro - Nombre de usuario */}
              <div className="flex-1 flex justify-center text-center">
                <h2 className="font-sans font-bold text-base text-[#003087] dark:text-[#C4C4C4] tracking-tight truncate max-w-[200px]">
                  {viewingProfileUser && viewingProfileUser.username !== currentUser.username
                    ? viewingProfileUser.username
                    : currentUser.username}
                </h2>
              </div>

              {/* Derecho - Botón de tres puntos tipo menú (Abre Menú) */}
              <div className="w-10 flex justify-end">
                {(!viewingProfileUser || viewingProfileUser.username === currentUser.username) ? (
                  <button 
                    onClick={() => setIsMenuModalOpen(true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-[#FFCD00]/15 active:scale-95 transition-all" 
                    title="Menú de opciones"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                ) : null}
              </div>
            </>
          ) : activeTab === 'explorar' ? (
            <div className="w-full flex items-center justify-between gap-3 relative">
              {/* Lado Izquierdo - Logo de la App */}
              <div className="flex items-center shrink-0">
                <div className="flex items-center h-9">
                  <img 
                    src="/src/assets/images/la_tierrita_logo.png" 
                    alt="La Tierrita" 
                    className="h-7 max-h-7 object-contain cursor-pointer"
                    onClick={() => setActiveTab('inicio')}
                    onError={(e) => {
                      e.currentTarget.className = 'hidden';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <span 
                    onClick={() => setActiveTab('inicio')}
                    className="hidden font-sans font-black text-base text-[#003087] dark:text-[#FFCD00] tracking-tight leading-none cursor-pointer"
                  >
                    La Tierrita <FlagEmoji country="co" size="sm" />
                  </span>
                </div>
              </div>

              {/* Lado Derecho - Barra de búsqueda para buscar usuarios (Tipo Instagram) */}
              <div className="relative flex-1 max-w-[230px] sm:max-w-[260px] ml-auto">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#C4C4C4] dark:text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    value={exploreSearchQuery}
                    onChange={(e) => {
                      setExploreSearchQuery(e.target.value);
                      setIsExploreSearchFocused(true);
                    }}
                    onFocus={() => setIsExploreSearchFocused(true)}
                    placeholder="Buscar usuarios..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-xs text-[#003087] dark:text-[#FFCD00] placeholder-[#C4C4C4] dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/60 transition-all font-medium"
                  />
                  {exploreSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setExploreSearchQuery('');
                        setIsExploreSearchFocused(true);
                      }}
                      className="absolute right-2.5 text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* DESPLEGABLE DE BÚSQUEDA DE USUARIOS */}
                {isExploreSearchFocused && (() => {
                  const rawPool = [...usersList, ...DEFAULT_USERS];
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
                      if (!userMap.has(u.id)) userMap.set(u.id, u);
                    }
                  });
                  const allUsersPool = Array.from(userMap.values());

                  const q = exploreSearchQuery.toLowerCase().trim();
                  const results = allUsersPool.filter(u => {
                    if (!q) return true;
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.username.toLowerCase().includes(q) ||
                      (u.originCity && u.originCity.toLowerCase().includes(q)) ||
                      (u.currentCity && u.currentCity.toLowerCase().includes(q))
                    );
                  });

                  return (
                    <>
                      {/* Overlay para cerrar al hacer clic fuera */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsExploreSearchFocused(false)} 
                      />

                      <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#001B44] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto animate-fadeIn">
                        <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#003087] dark:text-[#FFCD00] uppercase tracking-wider border-b border-black/5 dark:border-white/5 pb-1">
                          <span>{q ? 'Resultados' : 'Parceros sugeridos'}</span>
                          <button 
                            type="button" 
                            onClick={() => setIsExploreSearchFocused(false)}
                            className="text-[10px] text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white font-normal"
                          >
                            Cerrar
                          </button>
                        </div>

                        {results.length === 0 ? (
                          <div className="py-8 text-center text-xs text-[#C4C4C4]">
                            No se encontraron usuarios para &quot;{exploreSearchQuery}&quot;
                          </div>
                        ) : (
                          results.map((userItem, idx) => (
                            <div
                              key={`${userItem.id}-${idx}`}
                              onClick={() => {
                                handleViewProfile(userItem.username);
                                setIsExploreSearchFocused(false);
                                setExploreSearchQuery('');
                              }}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-[#003087]/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-base border border-black/5 dark:border-white/10 shadow-2xs">
                                  {userItem.avatar && (userItem.avatar.startsWith('data:') || userItem.avatar.startsWith('http')) ? (
                                    <img src={userItem.avatar} alt={userItem.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{userItem.avatar || '🇨🇴'}</span>
                                  )}
                                </div>
                                <div className="min-w-0 text-xs">
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-[#003087] dark:text-[#FFCD00] truncate group-hover:underline">
                                      {userItem.username}
                                    </span>
                                    {userItem.isStaff && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-[#FFCD00] shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[#003087]/70 dark:text-white/70 text-[11px] truncate">
                                    {userItem.name} {userItem.lastName || ''}
                                  </p>
                                </div>
                              </div>
                              {userItem.currentCity && (
                                <div className="shrink-0 text-[10px] text-[#C4C4C4]">
                                  <span>{userItem.currentCity.replace(/🇨🇴|🇪🇸/g, '').trim()}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : activeTab === 'anuncios' ? (
            <div className="w-full flex items-center justify-between gap-3 relative">
              {/* Lado izquierdo - Barra de búsqueda para buscar anuncios */}
              <div className="relative flex-1 max-w-[200px] sm:max-w-[240px]">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[#C4C4C4] dark:text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    value={adSearchQuery}
                    onChange={(e) => setAdSearchQuery(e.target.value)}
                    placeholder="Buscar anuncios..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-xs text-[#003087] dark:text-[#FFCD00] placeholder-[#C4C4C4] dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFCD00]/60 transition-all font-medium"
                  />
                  {adSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAdSearchQuery('')}
                      className="absolute right-2.5 text-[#C4C4C4] hover:text-[#003087] dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lado derecho - Título de la sección */}
              <div className="shrink-0">
                <h2 className="font-sans font-black text-base text-[#003087] dark:text-[#FFCD00] tracking-tight">
                  Anuncios
                </h2>
              </div>
            </div>
          ) : (
            <>
              {/* Izquierda - Botón de bandeja de chat */}
              <div className="w-10 flex justify-start">
                <button 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-[#FFCD00]/15 active:scale-95 transition-all" 
                  title="Chats (Próximamente)"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Centro - Logo de la app */}
              <div className="flex-1 flex justify-center">
                <div className="flex items-center justify-center h-9">
                  <img 
                    src="/src/assets/images/la_tierrita_logo.png" 
                    alt="La Tierrita" 
                    className="h-7 max-h-7 object-contain"
                    onError={(e) => {
                      e.currentTarget.className = 'hidden';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden font-sans font-black text-base text-[#003087] dark:text-[#FFCD00] tracking-tight block leading-none text-center">
                    La Tierrita <FlagEmoji country="co" size="sm" />
                  </span>
                </div>
              </div>

              {/* Derecha - Campana de notificaciones */}
              <div className="w-10 flex justify-end">
                <button 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#003087] dark:text-[#C4C4C4] hover:bg-[#003087]/10 dark:hover:bg-[#FFCD00]/15 active:scale-95 transition-all" 
                  title="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </header>

        {/* ================= APP PAGES CONTENT ================= */}
        <section className="flex-1 overflow-y-auto pb-24">
          
          {/* PAGE: INICIO */}
          {activeTab === 'inicio' && (
            <div className="p-4 space-y-5 animate-fadeIn">
              <ExploreCarousel isAdmin={currentUser.role === 'administrador' || currentUser.isStaff} />

              {/* GRID CON DOS OPCIONES (COMUNIDAD - INFORMACIÓN) */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setInicioSubTab('comunidad')}
                  className={`py-3 px-4 rounded-2xl font-bold text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                    inicioSubTab === 'comunidad'
                      ? 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] border-transparent shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-[#003087] dark:text-[#C4C4C4] border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  👥 Comunidad
                </button>
                <button
                  type="button"
                  onClick={() => setInicioSubTab('informacion')}
                  className={`py-3 px-4 rounded-2xl font-bold text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                    inicioSubTab === 'informacion'
                      ? 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] border-transparent shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-[#003087] dark:text-[#C4C4C4] border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  ℹ️ Información
                </button>
              </div>

              {/* CONTENIDO SEGÚN LA OPCIÓN SELECCIONADA */}
              <div className="mt-1 animate-fadeIn">
                {inicioSubTab === 'comunidad' && (
                  <div className="p-8 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 text-center min-h-[160px] flex flex-col items-center justify-center">
                    <p className="text-xs text-[#C4C4C4] font-medium">Sección Comunidad en desarrollo</p>
                  </div>
                )}

                 {inicioSubTab === 'informacion' && (
                  <div className="space-y-4">
                    {/* Indicador de conexión a Supabase visible únicamente para administradores */}
                    {(currentUser.role === 'administrador' || currentUser.isStaff) && (
                      <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2.5 transition-all ${
                        isSupabaseConfigured()
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`} />
                          <div>
                            <p className="font-bold text-[11px] leading-tight">
                              {isSupabaseConfigured() ? 'Base de datos Supabase conectada' : 'Base de datos Supabase NO conectada en este build'}
                            </p>
                            <p className="text-[10px] opacity-80 mt-0.5 leading-tight">
                              {isSupabaseConfigured()
                                ? 'Los botones nuevos se guardan en api.latierrita.tech y se transmiten en tiempo real a todos los usuarios.'
                                : 'Falta el archivo .env en tu VPS con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY al compilar (npm run build).'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Botón que abre el módulo de divisas */}
                    <button
                      type="button"
                      onClick={() => setIsCurrencyModalOpen(true)}
                      className="w-full py-4 px-5 rounded-2xl bg-[#003087]/5 dark:bg-[#002266]/40 hover:bg-[#003087]/10 dark:hover:bg-[#002266]/60 text-[#003087] dark:text-[#C4C4C4] border border-black/5 dark:border-white/10 font-bold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <h4 className="font-bold text-xs text-[#003087] dark:text-[#FFCD00] leading-tight">Calculadora de Cambio</h4>
                          <p className="text-[10px] text-[#C4C4C4] dark:text-[#C4C4C4]/80 font-medium mt-0.5">Euro (EUR) ↔ Peso Colombiano (COP)</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#C4C4C4] group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Lista dinámica de secciones informativas ordenadas de nuevo a antiguo */}
                    {sortedInfoSections.map((item) => {
                      const isNewForUser = (item.isCustom || item.id.startsWith('info-custom')) && !visitedSectionIds.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleOpenInfoSection(item)}
                          className="w-full py-4 px-5 rounded-2xl bg-[#003087]/5 dark:bg-[#002266]/40 hover:bg-[#003087]/10 dark:hover:bg-[#002266]/60 text-[#003087] dark:text-[#C4C4C4] border border-black/5 dark:border-white/10 font-bold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-left min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-xs text-[#003087] dark:text-[#FFCD00] leading-tight">
                                  {item.title}
                                </h4>
                                {isNewForUser && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FFCD00] text-[#003087] dark:bg-[#FFCD00] dark:text-[#003087] shadow-xs uppercase tracking-wider animate-pulse shrink-0">
                                    Nuevo
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#C4C4C4] dark:text-[#C4C4C4]/80 font-medium mt-0.5 truncate">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#C4C4C4] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                        </button>
                      );
                    })}
                    
                    {/* Botón Flotante (+) para Administradores y Staff */}
                    {(currentUser.role === 'administrador' || currentUser.isStaff) && (
                      <button
                        type="button"
                        onClick={() => setIsCreateInfoModalOpen(true)}
                        className="fixed bottom-20 right-6 z-40 w-13 h-13 rounded-full bg-[#FFCD00] hover:bg-[#ffe066] text-[#003087] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-[#001845]"
                        title="Crear nueva sección informativa"
                      >
                        <Plus className="w-6 h-6 stroke-[3]" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGE: EXPLORAR */}
          {activeTab === 'explorar' && (() => {
            const rawPool = [...usersList, ...DEFAULT_USERS];
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
                if (!userMap.has(u.id)) userMap.set(u.id, u);
              }
            });
            const communityUsers = Array.from(userMap.values());

            const allPostsPool = (() => {
              const postMap = new Map<string, ProfilePost>();
              [...safeUserPosts, ...safeTaggedPosts, ...safeSavedPosts].forEach(p => {
                if (p && p.id && !postMap.has(p.id)) postMap.set(p.id, p);
              });
              return Array.from(postMap.values());
            })();

            return (
              <div className="p-4 space-y-5 animate-fadeIn">
                {/* EXPLORE IMAGE CAROUSEL */}
                <ExploreCarousel isAdmin={currentUser.role === 'administrador' || currentUser.isStaff} />

                {/* SUGGESTED USERS TO DISCOVER */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-sans font-bold text-xs text-[#003087] dark:text-[#FFCD00] uppercase tracking-wider">
                      Parceros destacados
                    </h3>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {communityUsers.slice(0, 8).map((userItem) => (
                      <div
                        key={userItem.id}
                        onClick={() => handleViewProfile(userItem.username)}
                        className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-3 min-w-[130px] flex flex-col items-center text-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all shrink-0 active:scale-95 group"
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-2xl mb-2 border border-black/5 dark:border-white/10 shadow-2xs">
                          {isImageAvatar(userItem.avatar) ? (
                            <img src={userItem.avatar} alt={userItem.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{userItem.avatar || '🇨🇴'}</span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-[#003087] dark:text-[#FFCD00] truncate max-w-[110px] group-hover:underline">
                          {userItem.username}
                        </p>
                        <p className="text-[10px] text-[#C4C4C4] truncate max-w-[110px] mt-0.5">
                          {userItem.name}
                        </p>
                        {userItem.currentCity && (
                          <div className="mt-1 text-[9px] text-[#C4C4C4]">
                            <span>{userItem.currentCity.replace(/🇨🇴|🇪🇸/g, '').trim()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXPLORE POSTS GRID */}
                <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-sans font-bold text-xs text-[#003087] dark:text-[#FFCD00] uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5" /> Explorar
                    </h3>
                  </div>

                  {allPostsPool.length === 0 ? (
                    <div className="py-12 px-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center text-xl text-[#003087] dark:text-[#FFCD00]">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#003087] dark:text-[#FFCD00]">
                          Aún no hay publicaciones en la comunidad
                        </h4>
                        <p className="text-[11px] text-[#C4C4C4] max-w-xs mt-1 font-medium">
                          ¡Sé el primero en compartir un momento o foto con los compatriotas en España!
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentUser.role === 'invitado') {
                            setGuestNoticeMessage('Inicia sesión o regístrate para subir una publicación.');
                          } else {
                            setIsCreatePostModalOpen(true);
                          }
                        }}
                        className="px-4 py-2 bg-[#FFCD00] hover:bg-[#ffe066] text-[#003087] font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Compartir publicación</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
                      {allPostsPool.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            setSelectedFeedPostId(post.id);
                            setFeedModalTitle('Explorar publicaciones');
                            setActiveFeedList(allPostsPool);
                            setIsFeedModalOpen(true);
                          }}
                          className="relative aspect-square bg-black/10 dark:bg-black/30 overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={post.imageUrl}
                            alt={post.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                            {(post.likesCount || 0) > 0 && (
                              <div className="flex items-center gap-1">
                                <HeartIcon className="w-3.5 h-3.5 fill-white" />
                                <span>{post.likesCount}</span>
                              </div>
                            )}
                            {(countTotalComments(post.comments) || post.commentsCount || 0) > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                <span>{countTotalComments(post.comments) || post.commentsCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PAGE: PERFIL (VISTA DIRECTA DE PERFIL PROPIO O DE OTRO USUARIO) */}
          {activeTab === 'perfil' && (() => {
            const currentDisplayUser = (viewingProfileUser && viewingProfileUser.username !== currentUser.username)
              ? viewingProfileUser
              : currentUser;
            const isViewingSelf = currentDisplayUser.id === currentUser.id || currentDisplayUser.username === currentUser.username;

            return (
              <div className="bg-transparent p-5 space-y-3.5 animate-fadeIn">
                
                {/* 1. FOTO DE PERFIL - CENTRADA */}
                <div className="flex justify-center pt-2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-[#003087] border-2 border-transparent dark:border-transparent flex items-center justify-center text-4xl shadow-xs text-[#003087] dark:text-[#C4C4C4] overflow-hidden">
                      {isImageAvatar(currentDisplayUser.avatar) ? (
                        <img src={currentDisplayUser.avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
                      ) : (
                        <span>{currentDisplayUser.avatar || '🇨🇴'}</span>
                      )}
                    </div>
                    {currentDisplayUser.isStaff && (
                      <span className="absolute bottom-0 right-0 bg-[#FFCD00] text-[#003087] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border-2 border-transparent dark:border-transparent">
                        Staff
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. NOMBRE Y APELLIDO - CENTRADO */}
                <div className="text-center">
                  <h1 className="font-sans font-bold text-xl text-[#003087] dark:text-[#C4C4C4] tracking-tight leading-tight">
                    {currentDisplayUser.name} {currentDisplayUser.lastName || ''}
                  </h1>
                </div>

                {/* 3. BIOGRAFIA - CENTRADA (Solo usuarios registrados) */}
                {currentDisplayUser.role !== 'invitado' && (
                  <div className="text-center max-w-xs mx-auto">
                    <p className="text-xs text-[#C4C4C4] dark:text-[#C4C4C4] leading-relaxed font-sans font-semibold whitespace-pre-line">
                      <TextWithFlags text={currentDisplayUser.bio || 'Miembro de la comunidad colombiana en España 🇨🇴'} />
                    </p>
                  </div>
                )}

                {/* 4. SITIO WEB (SI EXISTE) */}
                {currentDisplayUser.website && (
                  <div className="flex justify-center">
                    <a 
                      href={currentDisplayUser.website.startsWith('http') ? currentDisplayUser.website : `https://${currentDisplayUser.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#FFCD00] hover:underline font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{currentDisplayUser.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  </div>
                )}

                {/* 5. REDES SOCIALES (SOLO ICONOS) */}
                {(currentDisplayUser.instagram || currentDisplayUser.tiktok || currentDisplayUser.facebook || currentDisplayUser.xTwitter) && (
                  <div className="flex items-center justify-center gap-2.5 pt-0.5">
                    {currentDisplayUser.instagram && (
                      <a 
                        href={currentDisplayUser.instagram.startsWith('http') ? currentDisplayUser.instagram : `https://instagram.com/${currentDisplayUser.instagram.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-[#FFCD00]/20 text-[#003087] dark:text-[#FFCD00] active:scale-95 transition-all"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {currentDisplayUser.tiktok && (
                      <a 
                        href={currentDisplayUser.tiktok.startsWith('http') ? currentDisplayUser.tiktok : `https://tiktok.com/@${currentDisplayUser.tiktok.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-[#FFCD00]/20 text-[#003087] dark:text-[#FFCD00] active:scale-95 transition-all"
                        title="TikTok"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.31 6.31 0 0 0 1.96-4.49V8.65a8.28 8.28 0 0 0 4.81 1.54V6.74a4.84 4.84 0 0 1-1-.05Z"/>
                        </svg>
                      </a>
                    )}
                    {currentDisplayUser.facebook && (
                      <a 
                        href={currentDisplayUser.facebook.startsWith('http') ? currentDisplayUser.facebook : `https://facebook.com/${currentDisplayUser.facebook}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-[#FFCD00]/20 text-[#003087] dark:text-[#FFCD00] active:scale-95 transition-all"
                        title="Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {currentDisplayUser.xTwitter && (
                      <a 
                        href={currentDisplayUser.xTwitter.startsWith('http') ? currentDisplayUser.xTwitter : `https://x.com/${currentDisplayUser.xTwitter.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-[#FFCD00]/20 text-[#003087] dark:text-[#FFCD00] active:scale-95 transition-all"
                        title="X"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* 6. EDAD / CIUDAD ORIGEN */}
                <div className="text-center text-xs text-[#C4C4C4] dark:text-[#C4C4C4] font-semibold flex items-center justify-center gap-1.5 flex-wrap">
                  {currentDisplayUser.role !== 'invitado' && userAge ? (
                    <>
                      <span>{`${userAge} años`}</span>
                      <span className="text-[#C4C4C4]/60">/</span>
                    </>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <span>{(currentDisplayUser.originCity || 'Colombia').replace(/🇨🇴|🇪🇸/g, '').trim()}</span>
                    <FlagEmoji country="co" size="sm" />
                  </span>
                </div>

                {/* 7. CIUDAD ACTUAL */}
                <div className="text-center text-xs text-[#C4C4C4] dark:text-[#C4C4C4] font-semibold flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FFCD00]" />
                  <span className="inline-flex items-center gap-1.5">
                    <span>{(currentDisplayUser.currentCity || 'España').replace(/🇨🇴|🇪🇸/g, '').trim()}</span>
                    <FlagEmoji country="es" size="sm" />
                  </span>
                </div>

                {/* 8. BOTÓN SEGUIR / SIGUIENDO (Si es perfil de otro usuario) */}
                {!isViewingSelf && (
                  <div className="flex justify-center pt-1 pb-1">
                    <button
                      type="button"
                      onClick={() => handleToggleFollowUser(currentDisplayUser.id)}
                      className={`w-full max-w-xs py-2 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                        followedUserIds.includes(currentDisplayUser.id)
                          ? 'bg-black/5 dark:bg-white/10 text-[#003087] dark:text-white border border-black/10 dark:border-white/20'
                          : 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] hover:scale-[1.01] active:scale-[0.99]'
                      }`}
                    >
                      {followedUserIds.includes(currentDisplayUser.id) ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Siguiendo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Seguir usuario</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 9. CONTADORES DE PUBLICACIONES - SEGUIDORES - SEGUIDOS O BANNER MODO INVITADO */}
                {currentDisplayUser.role === 'invitado' ? (
                  <div className="bg-gradient-to-r from-[#003087] via-[#002266] to-[#001844] dark:from-[#002266] dark:to-[#001133] rounded-2xl p-4 text-center border border-[#FFCD00]/30 shadow-md my-2 animate-fadeIn">
                    <div className="flex items-center justify-center h-12 mb-2">
                      <img 
                        src="/src/assets/images/la_tierrita_logo.png" 
                        alt="La Tierrita" 
                        className="h-10 max-h-10 object-contain drop-shadow-md"
                        onError={(e) => {
                          e.currentTarget.className = 'hidden';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <span className="hidden font-sans font-black text-sm text-[#FFCD00] tracking-tight">
                        La Tierrita 🇨🇴
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-[#FFCD00] uppercase tracking-wider mb-1">
                      Modo Invitado
                    </h3>
                    <p className="text-xs text-white/90 leading-relaxed mb-3">
                      Para una mejor experiencia y disfrutar de todas las funciones (publicar, comentar, chatear y conectar), ¡regístrate o inicia sesión!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2 bg-[#FFCD00] hover:bg-[#ffe066] text-[#003087] font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
                    >
                      Crear Cuenta / Iniciar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="flex items-center justify-around py-3 px-4 rounded-2xl border border-transparent dark:border-transparent bg-black/5 dark:bg-white/5">
                      <div className="text-center flex-1 cursor-pointer" onClick={() => setProfileTab('publicaciones')}>
                        <span className="block font-bold text-base text-[#003087] dark:text-[#C4C4C4] font-sans leading-tight">
                          {safeUserPosts.filter(p => 
                            p.authorId === currentDisplayUser.id || 
                            p.authorUsername === currentDisplayUser.username ||
                            p.authorUsername.toLowerCase() === currentDisplayUser.username.toLowerCase()
                          ).length}
                        </span>
                        <span className="text-[11px] text-[#C4C4C4] dark:text-[#FFCD00] font-medium">publicaciones</span>
                      </div>
                      <div className="h-6 w-px bg-transparent dark:bg-transparent"></div>
                      <div 
                        className="text-center flex-1 cursor-pointer hover:opacity-80 active:scale-95 transition-all group"
                        onClick={() => {
                          if (currentUser.role === 'invitado') {
                            setGuestNoticeMessage('Inicia sesión o regístrate para ver la lista de seguidores.');
                            return;
                          }
                          setUserListModalTab('followers');
                          setIsUserListModalOpen(true);
                        }}
                      >
                        <span className="block font-bold text-base text-[#003087] dark:text-[#C4C4C4] font-sans leading-tight group-hover:underline">
                          {(currentDisplayUser.followersCount ?? 120) + (followedUserIds.includes(currentDisplayUser.id) ? 1 : 0)}
                        </span>
                        <span className="text-[11px] text-[#C4C4C4] dark:text-[#FFCD00] font-medium">seguidores</span>
                      </div>
                      <div className="h-6 w-px bg-transparent dark:bg-transparent"></div>
                      <div 
                        className="text-center flex-1 cursor-pointer hover:opacity-80 active:scale-95 transition-all group"
                        onClick={() => {
                          if (currentUser.role === 'invitado') {
                            setGuestNoticeMessage('Inicia sesión o regístrate para ver a quiénes sigue.');
                            return;
                          }
                          setUserListModalTab('following');
                          setIsUserListModalOpen(true);
                        }}
                      >
                        <span className="block font-bold text-base text-[#003087] dark:text-[#C4C4C4] font-sans leading-tight group-hover:underline">
                          {currentDisplayUser.followingCount ?? 180}
                        </span>
                        <span className="text-[11px] text-[#C4C4C4] dark:text-[#FFCD00] font-medium">seguidos</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. GRID DE PUBLICACIONES */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5">
                  {isViewingSelf ? (
                    <>
                      {/* Segmented Tab Bar for self */}
                      <div className="flex items-center justify-around border-b border-black/5 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setProfileTab('publicaciones')}
                          className={`flex items-center justify-center gap-2 py-3 flex-1 border-b-2 font-bold text-xs transition-all ${
                            profileTab === 'publicaciones'
                              ? 'border-[#FFCD00] text-[#FFCD00]'
                              : 'border-transparent text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00]'
                          }`}
                        >
                          <LayoutGrid className="w-4 h-4" />
                          <span>Publicaciones</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (currentUser.role === 'invitado') {
                              setGuestNoticeMessage('Inicia sesión o regístrate para ver publicaciones etiquetadas.');
                              return;
                            }
                            setProfileTab('etiquetas');
                          }}
                          className={`flex items-center justify-center gap-2 py-3 flex-1 border-b-2 font-bold text-xs transition-all ${
                            profileTab === 'etiquetas'
                              ? 'border-[#FFCD00] text-[#FFCD00]'
                              : 'border-transparent text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00]'
                          }`}
                        >
                          <Tag className="w-4 h-4" />
                          <span>Etiquetas</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (currentUser.role === 'invitado') {
                              setGuestNoticeMessage('Inicia sesión o regístrate para guardar publicaciones en tu perfil.');
                              return;
                            }
                            setProfileTab('guardados');
                          }}
                          className={`flex items-center justify-center gap-2 py-3 flex-1 border-b-2 font-bold text-xs transition-all ${
                            profileTab === 'guardados'
                              ? 'border-[#FFCD00] text-[#FFCD00]'
                              : 'border-transparent text-[#C4C4C4] hover:text-[#003087] dark:hover:text-[#FFCD00]'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                          <span>Guardados</span>
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="pt-2">
                        {profileTab === 'publicaciones' && (() => {
                          const publishedPosts = safeUserPosts.filter(p => 
                            p.authorId === currentDisplayUser.id || 
                            p.authorUsername === currentDisplayUser.username ||
                            p.authorUsername.toLowerCase() === currentDisplayUser.username.toLowerCase()
                          );

                          if (publishedPosts.length === 0) {
                            return (
                              <div className="py-12 text-center text-[#C4C4C4]">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-60 text-[#FFCD00]" />
                                <p className="text-xs font-semibold text-[#FFCD00]">Aún no has compartido publicaciones</p>
                                <p className="text-[11px] text-[#C4C4C4] mt-0.5">Tus fotos y momentos aparecerán aquí</p>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-3 gap-1">
                              {publishedPosts.map((post) => (
                                <div
                                  key={post.id}
                                  onClick={() => handleOpenFeed('publicaciones', post.id)}
                                  className="relative aspect-square bg-black/10 dark:bg-black/30 overflow-hidden group cursor-pointer"
                                >
                                  <img
                                    src={post.imageUrl}
                                    alt={post.caption}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                                    {(post.likesCount || 0) > 0 && (
                                      <div className="flex items-center gap-1">
                                        <HeartIcon className="w-3.5 h-3.5 fill-white" />
                                        <span>{post.likesCount}</span>
                                      </div>
                                    )}
                                    {(countTotalComments(post.comments) || post.commentsCount || 0) > 0 && (
                                      <div className="flex items-center gap-1">
                                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                        <span>{countTotalComments(post.comments) || post.commentsCount}</span>
                                      </div>
                                    )}
                                    {(post.savesCount || 0) > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Bookmark className="w-3.5 h-3.5 fill-white" />
                                        <span>{post.savesCount}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {profileTab === 'etiquetas' && (
                          <div>
                            {safeTaggedPosts.length === 0 ? (
                              <div className="py-12 text-center text-[#C4C4C4]">
                                <Tag className="w-8 h-8 mx-auto mb-2 opacity-60 text-[#FFCD00]" />
                                <p className="text-xs font-semibold text-[#FFCD00]">Sin fotos etiquetadas</p>
                                <p className="text-[11px] text-[#C4C4C4] mt-0.5">Las fotos donde te etiqueten tus amigos aparecerán aquí</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-1">
                                {safeTaggedPosts.map((post) => (
                                  <div
                                    key={post.id}
                                    onClick={() => handleOpenFeed('etiquetas', post.id)}
                                    className="relative aspect-square bg-black/10 dark:bg-black/30 overflow-hidden group cursor-pointer"
                                  >
                                    <img
                                      src={post.imageUrl}
                                      alt={post.caption}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                    <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-xs rounded-full p-1 text-white">
                                      <Tag className="w-2.5 h-2.5 text-[#FFCD00]" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                                      {(post.likesCount || 0) > 0 && (
                                        <div className="flex items-center gap-1">
                                          <HeartIcon className="w-3.5 h-3.5 fill-white" />
                                          <span>{post.likesCount}</span>
                                        </div>
                                      )}
                                      {(countTotalComments(post.comments) || post.commentsCount || 0) > 0 && (
                                        <div className="flex items-center gap-1">
                                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                          <span>{countTotalComments(post.comments) || post.commentsCount}</span>
                                        </div>
                                      )}
                                      {(post.savesCount || 0) > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Bookmark className="w-3.5 h-3.5 fill-white" />
                                          <span>{post.savesCount}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {profileTab === 'guardados' && (
                          <div>
                            <div className="mb-2 px-1 flex items-center justify-between text-[11px] text-[#C4C4C4]">
                              <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3 text-[#FFCD00]" />
                                Solo tú puedes ver lo que guardas
                              </span>
                              <span className="font-semibold text-[#FFCD00]">{safeSavedPosts.length} guardadas</span>
                            </div>
                            {safeSavedPosts.length === 0 ? (
                              <div className="py-12 text-center text-[#C4C4C4]">
                                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-60 text-[#FFCD00]" />
                                <p className="text-xs font-semibold text-[#FFCD00]">Aún no has guardado publicaciones</p>
                                <p className="text-[11px] text-[#C4C4C4] mt-0.5">Guarda publicaciones con el ícono de marcador para verlas aquí</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-1">
                                {safeSavedPosts.map((post) => (
                                  <div
                                    key={post.id}
                                    onClick={() => handleOpenFeed('guardados', post.id)}
                                    className="relative aspect-square bg-black/10 dark:bg-black/30 overflow-hidden group cursor-pointer"
                                  >
                                    <img
                                      src={post.imageUrl}
                                      alt={post.caption}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                                      {(post.likesCount || 0) > 0 && (
                                        <div className="flex items-center gap-1">
                                          <HeartIcon className="w-3.5 h-3.5 fill-white" />
                                          <span>{post.likesCount}</span>
                                        </div>
                                      )}
                                      {(countTotalComments(post.comments) || post.commentsCount || 0) > 0 && (
                                        <div className="flex items-center gap-1">
                                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                          <span>{countTotalComments(post.comments) || post.commentsCount}</span>
                                        </div>
                                      )}
                                      {(post.savesCount || 0) > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Bookmark className="w-3.5 h-3.5 fill-white" />
                                          <span>{post.savesCount}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Single Publicaciones Grid for another user */
                    <div>
                      <div className="flex items-center justify-between px-1 pb-2 font-bold text-xs text-[#003087] dark:text-[#FFCD00]">
                        <span className="flex items-center gap-1.5">
                          <LayoutGrid className="w-4 h-4" /> Publicaciones
                        </span>
                      </div>
                      {(() => {
                        const postMap = new Map<string, ProfilePost>();
                        [...safeUserPosts, ...safeTaggedPosts, ...safeSavedPosts].forEach(p => {
                          if (p && p.id && !postMap.has(p.id)) postMap.set(p.id, p);
                        });
                        const visitedUserPosts = Array.from(postMap.values()).filter(
                          p => p.authorUsername === currentDisplayUser.username || p.authorId === currentDisplayUser.id
                        );

                        if (visitedUserPosts.length === 0) {
                          return (
                            <div className="py-12 text-center text-[#C4C4C4]">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-60 text-[#FFCD00]" />
                              <p className="text-xs font-semibold text-[#FFCD00]">Aún no ha compartido publicaciones</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-3 gap-1">
                            {visitedUserPosts.map((post) => (
                              <div
                                key={post.id}
                                onClick={() => {
                                  setSelectedFeedPostId(post.id);
                                  setFeedModalTitle(`Publicaciones de ${currentDisplayUser.username}`);
                                  setActiveFeedList(visitedUserPosts);
                                  setIsFeedModalOpen(true);
                                }}
                                className="relative aspect-square bg-black/10 dark:bg-black/30 overflow-hidden group cursor-pointer"
                              >
                                <img
                                  src={post.imageUrl}
                                  alt={post.caption}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                                  {(post.likesCount || 0) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <HeartIcon className="w-3.5 h-3.5 fill-white" />
                                      <span>{post.likesCount}</span>
                                    </div>
                                  )}
                                  {(countTotalComments(post.comments) || post.commentsCount || 0) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                      <span>{countTotalComments(post.comments) || post.commentsCount}</span>
                                    </div>
                                  )}
                                  {(post.savesCount || 0) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Bookmark className="w-3.5 h-3.5 fill-white" />
                                      <span>{post.savesCount}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

              </div>
            );
          })()}

          {/* PAGE: ANUNCIOS */}
          {activeTab === 'anuncios' && (
            <div className="p-4 space-y-4 animate-fadeIn">
              {/* ACCIONES SUPERIORES (Publicar + Selector de ciudades) */}
              <div className="flex items-center justify-between gap-3">
                {/* Lado izquierdo - Botón para publicar anuncios */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser.role === 'invitado') {
                      setGuestNoticeMessage('Inicia sesión o regístrate para publicar anuncios.');
                      return;
                    }
                    setIsCreateAdModalOpen(true);
                  }}
                  className="py-2.5 px-4 bg-[#003087] hover:bg-[#002266] text-white dark:bg-[#FFCD00] dark:text-[#003087] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar anuncio</span>
                </button>

                {/* Lado derecho - Selector de ciudades */}
                <div className="relative flex-1 max-w-[160px]">
                  <select
                    value={selectedAdCity}
                    onChange={(e) => setSelectedAdCity(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/10 text-xs font-bold text-[#003087] dark:text-[#FFCD00] border border-black/5 dark:border-white/10 rounded-xl px-2.5 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-[#FFCD00]/50"
                  >
                    <option value="Todos" className="text-black">🌍 Todas las ciudades</option>
                    {SPANISH_CITIES.map(city => (
                      <option key={city} value={city} className="text-black">{city}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#C4C4C4]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* CARRUSEL DE CATEGORÍAS */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
                {["Todos", "Vivienda", "Alquiler", "Empleo", "Eventos"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedAdCategory(cat)}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 border cursor-pointer ${
                      selectedAdCategory === cat
                        ? 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] border-transparent shadow-xs'
                        : 'bg-black/5 dark:bg-white/10 text-[#003087] dark:text-[#C4C4C4] border-black/5 dark:border-white/10 hover:bg-[#003087]/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* LISTADO DE TARJETAS DE ANUNCIOS */}
              <div className="space-y-4">
                {(() => {
                  const query = adSearchQuery.toLowerCase().trim();
                  console.log('Filtering announcements, total:', announcements.length);
                  const filtered = announcements.filter(ad => {
                    // Filter by search query: supports username, title, category, city, and description
                    const matchesQuery = !query || 
                      (ad.title && ad.title.toLowerCase().includes(query)) ||
                      ad.description.toLowerCase().includes(query) ||
                      ad.authorName.toLowerCase().includes(query) ||
                      ad.authorUsername.toLowerCase().includes(query) ||
                      ad.category.toLowerCase().includes(query) ||
                      ad.city.toLowerCase().includes(query);

                    // Filter by city
                    const matchesCity = selectedAdCity === 'Todos' || ad.city === selectedAdCity;

                    // Filter by category
                    const matchesCategory = selectedAdCategory === 'Todos' || ad.category === selectedAdCategory;

                    return matchesQuery && matchesCity && matchesCategory;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center text-[#C4C4C4]">
                        <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-50 text-[#FFCD00]" />
                        <p className="text-xs font-bold text-[#FFCD00]">No hay anuncios publicados en este momento</p>
                        <p className="text-[10px] mt-1 text-gray-400">Prueba cambiando los filtros o sé el primero en publicar.</p>
                      </div>
                    );
                  }

                  return filtered.map((ad) => {
                    // Category color helper
                    const getCategoryColor = (category: string) => {
                      switch (category.toLowerCase()) {
                        case 'vivienda': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
                        case 'alquiler': return 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
                        case 'empleo': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
                        case 'eventos': return 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
                        default: return 'bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
                      }
                    };

                    return (
                      <div
                        key={ad.id}
                        onClick={() => {
                          setSelectedAdDetail(ad);
                          setActiveCarouselIndex(0);
                        }}
                        className="bg-white dark:bg-[#002266]/40 border border-black/5 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer text-left block"
                      >
                        {/* Header de la tarjeta */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-[#003087] dark:text-[#FFCD00] border border-black/5 dark:border-white/5 shadow-2xs shrink-0">
                              {ad.authorUsername.slice(1, 3).toUpperCase()}
                            </div>
                            <div className="text-left min-w-0">
                              <h4 className="font-bold text-xs text-[#003087] dark:text-white leading-tight truncate">{ad.authorName}</h4>
                              <p className="text-[9px] text-[#C4C4C4] font-medium truncate">{ad.authorUsername}</p>
                            </div>
                          </div>
                          
                          {/* Categoría de anuncio */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getCategoryColor(ad.category)}`}>
                            {ad.category}
                          </span>
                        </div>

                        {/* Título de la publicación y Precio */}
                        <div className="flex justify-between items-start gap-2 pt-0.5 text-left">
                          <h3 className="font-sans font-extrabold text-xs sm:text-sm text-[#003087] dark:text-[#FFCD00] leading-snug line-clamp-2">
                            {ad.title}
                          </h3>
                          {ad.price !== undefined && (
                            <span className="shrink-0 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-950/30">
                              {ad.price} €
                            </span>
                          )}
                        </div>

                        {/* Descripción del anuncio */}
                        <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed font-medium text-left line-clamp-2">
                          {ad.description}
                        </p>

                        {/* Ciudad del anuncio */}
                        <div className="flex items-center justify-between pt-1 border-t border-black/[0.03] dark:border-white/[0.03] text-[10px] font-bold">
                          <div className="flex items-center gap-1 text-[#C4C4C4]">
                            <MapPin className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" />
                            <span className="truncate max-w-[150px]">{ad.city}</span>
                          </div>
                          <span className="text-[#003087] dark:text-[#FFCD00] flex items-center gap-1 hover:underline">
                            Ver detalles ➔
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* PAGE: LUGARES (Limpia sin ningún contenido) */}
          {activeTab === 'lugares' && (
            <div className="flex-1"></div>
          )}
        </section>

        {/* ================= APP BOTTOM NAVIGATION MENU ================= */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/80 backdrop-blur-md border-t border-transparent dark:border-transparent grid grid-cols-5 h-16 pb-safe shrink-0 transition-colors">
          
          {/* TAB 1: INICIO */}
          <button 
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'inicio' ? 'text-[#003087] dark:text-[#FFCD00]' : 'text-[#C4C4C4] dark:text-[#C4C4C4]/70 hover:text-[#003087] dark:hover:text-[#FFCD00]'}`}
          >
            <Home className="w-5.5 h-5.5 transition-transform active:scale-90" />
            <span className="text-[10px] font-bold tracking-tight mt-1">Inicio</span>
            {activeTab === 'inicio' && <span className="w-1 h-1 bg-[#003087] dark:bg-[#FFCD00] rounded-full mt-0.5"></span>}
          </button>

          {/* TAB 2: EXPLORAR */}
          <button 
            onClick={() => setActiveTab('explorar')}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'explorar' ? 'text-[#003087] dark:text-[#FFCD00]' : 'text-[#C4C4C4] dark:text-[#C4C4C4]/70 hover:text-[#003087] dark:hover:text-[#FFCD00]'}`}
          >
            <Compass className="w-5.5 h-5.5 transition-transform active:scale-90" />
            <span className="text-[10px] font-bold tracking-tight mt-1">Explorar</span>
            {activeTab === 'explorar' && <span className="w-1 h-1 bg-[#003087] dark:bg-[#FFCD00] rounded-full mt-0.5"></span>}
          </button>

          {/* TAB 3: PERFIL (Donde se visualizan los roles y cuentas) */}
          <button 
            onClick={() => {
              setViewingProfileUser(null);
              setActiveTab('perfil');
            }}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'perfil' ? 'text-[#003087] dark:text-[#FFCD00]' : 'text-[#C4C4C4] dark:text-[#C4C4C4]/70 hover:text-[#003087] dark:hover:text-[#FFCD00]'}`}
          >
            <div className="relative">
              <User className="w-5.5 h-5.5 transition-transform active:scale-90" />
              {currentUser.isStaff && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFCD00] rounded-full"></span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-1">Perfil</span>
            {activeTab === 'perfil' && <span className="w-1 h-1 bg-[#003087] dark:bg-[#FFCD00] rounded-full mt-0.5"></span>}
          </button>

          {/* TAB 4: ANUNCIOS */}
          <button 
            onClick={() => {
              if (currentUser.role === 'invitado') {
                setGuestNoticeMessage('Inicia sesión o regístrate para explorar anuncios de la comunidad colombiana.');
                return;
              }
              setActiveTab('anuncios');
            }}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'anuncios' ? 'text-[#003087] dark:text-[#FFCD00]' : 'text-[#C4C4C4] dark:text-[#C4C4C4]/70 hover:text-[#003087] dark:hover:text-[#FFCD00]'}`}
          >
            <Megaphone className="w-5.5 h-5.5 transition-transform active:scale-90" />
            <span className="text-[10px] font-bold tracking-tight mt-1">Anuncios</span>
            {activeTab === 'anuncios' && <span className="w-1 h-1 bg-[#003087] dark:bg-[#FFCD00] rounded-full mt-0.5"></span>}
          </button>

          {/* TAB 5: LUGARES */}
          <button 
            onClick={() => {
              if (currentUser.role === 'invitado') {
                setGuestNoticeMessage('Inicia sesión o regístrate para descubrir lugares colombianos en España.');
                return;
              }
              setActiveTab('lugares');
            }}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'lugares' ? 'text-[#003087] dark:text-[#FFCD00]' : 'text-[#C4C4C4] dark:text-[#C4C4C4]/70 hover:text-[#003087] dark:hover:text-[#FFCD00]'}`}
          >
            <MapPin className="w-5.5 h-5.5 transition-transform active:scale-90" />
            <span className="text-[10px] font-bold tracking-tight mt-1">Lugares</span>
            {activeTab === 'lugares' && <span className="w-1 h-1 bg-[#003087] dark:bg-[#FFCD00] rounded-full mt-0.5"></span>}
          </button>
        </nav>

        {/* ================= MODAL DEL MENÚ DE PERFIL ================= */}
        <ProfileMenuModal
          isOpen={isMenuModalOpen}
          onClose={() => setIsMenuModalOpen(false)}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
          onLogout={handleLogout}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
        />

        {/* ================= MODAL DEL FEED TIPO INSTAGRAM ================= */}
        <ProfileFeedModal
          isOpen={isFeedModalOpen}
          onClose={() => setIsFeedModalOpen(false)}
          posts={activeFeedList}
          initialPostId={selectedFeedPostId}
          feedTitle={feedModalTitle}
          currentUser={currentUser}
          usersList={usersList}
          onToggleLike={handleTogglePostLike}
          onToggleSave={handleTogglePostSave}
          onAddComment={handleAddPostComment}
          onDeleteComment={handleDeletePostComment}
          onUpdatePostOptions={handleUpdatePostOptions}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
          onViewProfile={handleViewProfile}
        />

        {/* ================= MODAL PARA SUBIR PUBLICACIÓN ================= */}
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          currentUser={currentUser}
          onPublishPost={handlePublishPost}
          availableUsers={usersList}
        />

        {/* ================= MODAL DE LISTA DE SEGUIDORES / SEGUIDOS ================= */}
        <UserListModal
          isOpen={isUserListModalOpen}
          onClose={() => setIsUserListModalOpen(false)}
          initialTab={userListModalTab}
          targetUser={(viewingProfileUser && viewingProfileUser.username !== currentUser.username) ? viewingProfileUser : currentUser}
          currentUser={currentUser}
          usersList={usersList}
          followedUserIds={followedUserIds}
          onToggleFollow={handleToggleFollowUser}
          onSelectUser={handleViewProfile}
        />

        {/* ================= MODAL NOTIFICACIÓN MODO INVITADO ================= */}
        {guestNoticeMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-sm bg-white dark:bg-[#002266] rounded-3xl p-6 shadow-2xl border border-black/10 dark:border-[#FFCD00]/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FFCD00]/20 text-[#003087] dark:text-[#FFCD00] flex items-center justify-center mx-auto text-2xl">
                🔒
              </div>
              <div>
                <h3 className="font-bold text-base text-[#003087] dark:text-[#FFCD00]">
                  Función para Usuarios Registrados
                </h3>
                <p className="text-xs text-[#C4C4C4] dark:text-[#C4C4C4] mt-1.5 leading-relaxed font-medium">
                  {guestNoticeMessage}
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setGuestNoticeMessage(null);
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-[#FFCD00] hover:bg-[#ffe066] text-[#003087] font-bold text-xs rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Crear Cuenta Gratis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGuestNoticeMessage(null);
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-black/5 dark:bg-white/10 text-[#003087] dark:text-white font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setGuestNoticeMessage(null)}
                  className="w-full py-1 text-[11px] text-[#C4C4C4] hover:underline font-semibold cursor-pointer"
                >
                  Continuar como Invitado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL DE DIVISAS (EURO ↔ COP) ================= */}
        {isCurrencyModalOpen && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-[#001133] flex flex-col p-0 animate-fadeIn">
              <header className="sticky top-0 bg-white dark:bg-[#001845] border-b border-black/5 dark:border-white/10 px-5 py-4 flex items-center justify-between shrink-0 z-10 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsCurrencyModalOpen(false)}
                  className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#003087] dark:text-[#FFCD00] cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                   <img src={logo} alt="La Tierrita" className="h-8 w-auto" />
                </div>
                <div className="w-10"></div>
              </header>
              <div className="py-4 text-center border-b border-black/5 dark:border-white/10">
                <h3 className="font-sans font-black text-lg text-[#003087] dark:text-[#FFCD00]">
                  Calculadora de Cambio
                </h3>
              </div>
            <div className="flex-1 overflow-y-auto p-6 animate-slideUp text-center space-y-4">

              {/* Google Style Header */}
              <div className="text-left space-y-0.5 px-1 pt-1">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-tight">1 Euro es igual a</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#FFCD00] tracking-tight">
                  {exchangeRate.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pesos colombianos
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-400 font-medium">
                  {lastUpdated} · Renuncia de responsabilidad
                </p>
              </div>

              {/* Interactive Rate Info / Simulated Remittances */}
              <div className="bg-[#003087]/5 dark:bg-black/25 rounded-2xl p-3 border border-transparent text-xs text-left">
                <div className="flex justify-between font-bold text-[#003087] dark:text-white">
                  <span>Simular Tasa de Envío:</span>
                  <span className="text-[#FFCD00]">{exchangeRate.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} COP</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                  {[Math.round(exchangeRate - 50), Math.round(exchangeRate), Math.round(exchangeRate + 50)].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleRateChange(rate)}
                      className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        exchangeRate === rate
                          ? 'bg-[#003087] text-white dark:bg-[#FFCD00] dark:text-[#003087] border-transparent'
                          : 'bg-white dark:bg-[#003087]/50 text-[#003087] dark:text-white border-black/5 dark:border-white/10 hover:bg-[#003087]/5'
                      }`}
                    >
                      {rate} COP
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Style Inputs */}
              <div className="space-y-3 text-left pt-1">
                {/* EURO BOX */}
                <div className="flex items-center bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-3 justify-between shadow-2xs">
                  <input
                    type="number"
                    value={eurAmount}
                    onChange={(e) => handleEurChange(e.target.value)}
                    className="w-2/3 bg-transparent text-base font-bold text-gray-900 dark:text-white font-mono outline-none"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-white/10 pl-3 min-w-[70px] justify-end">
                    <span>EUR</span>
                  </div>
                </div>

                {/* COP BOX */}
                <div className="flex items-center bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-3 justify-between shadow-2xs">
                  <input
                    type="number"
                    value={copAmount}
                    onChange={(e) => handleCopChange(e.target.value)}
                    className="w-2/3 bg-transparent text-base font-bold text-gray-900 dark:text-white font-mono outline-none"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-white/10 pl-3 min-w-[70px] justify-end">
                    <span>COP</span>
                  </div>
                </div>
              </div>

              {/* Quick Remittance Helper / Reference values */}
              <div className="space-y-1.5 pt-1.5 border-t border-black/5 dark:border-white/10 text-left">
                <span className="text-[10px] font-bold text-[#C4C4C4] dark:text-[#FFCD00] uppercase tracking-wider">Valores de Referencia Rápidos:</span>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[50, 100, 200, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setEurAmount(val.toString());
                        setCopAmount((val * exchangeRate).toFixed(2));
                      }}
                      className="py-1 px-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[10px] text-center rounded-lg font-bold text-[#003087] dark:text-[#C4C4C4] transition-all cursor-pointer"
                    >
                      {val} €
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCurrencyModalOpen(false)}
                  className="w-full py-2.5 bg-[#003087] hover:bg-[#002266] text-white dark:bg-[#FFCD00] dark:text-[#003087] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Entendido / Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL PARA CREAR ANUNCIO (PANTALLA COMPLETA) ================= */}
        {isCreateAdModalOpen && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-[#001133] flex flex-col overflow-hidden animate-fadeIn">
            {/* Cabecera del modal pantalla completa */}
            <header className="sticky top-0 bg-white dark:bg-[#001845] border-b border-black/5 dark:border-white/10 px-5 py-4 flex items-center justify-between shrink-0 z-10 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <h3 className="font-sans font-extrabold text-sm sm:text-base text-[#003087] dark:text-[#FFCD00] uppercase tracking-wider">
                  Publicar Anuncio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAdModalOpen(false)}
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Formulario que cubre el contenedor intermedio */}
            <form onSubmit={handlePublishAd} className="flex-1 flex flex-col overflow-hidden">
              {/* Cuerpo del formulario scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 max-w-md mx-auto w-full">
                {createAdError && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs font-bold text-red-600 dark:text-red-400">
                    ⚠️ {createAdError}
                  </div>
                )}

                {/* 1. Título del Anuncio* (máximo 32 caracteres) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-extrabold text-[#003087] dark:text-[#C4C4C4]">
                      Título del Anuncio * <span className="text-[10px] text-gray-400 font-normal">(Máx. 32 carácteres)</span>
                    </label>
                    <span className={`text-[10px] font-bold ${newAdTitle.length > 32 ? 'text-red-500' : 'text-gray-400'}`}>
                      {newAdTitle.length}/32
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="Ej. Alquilo Habitación en Sol"
                    value={newAdTitle}
                    onChange={(e) => setNewAdTitle(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/20 border border-transparent focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#003087] dark:text-white font-bold outline-none transition-all"
                  />
                </div>

                {/* 2. Descripción* (máximo 300 caracteres) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-extrabold text-[#003087] dark:text-[#C4C4C4]">
                      Descripción del Anuncio * <span className="text-[10px] text-gray-400 font-normal">(Máx. 300 carácteres)</span>
                    </label>
                    <span className={`text-[10px] font-bold ${newAdDescription.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>
                      {newAdDescription.length}/300
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={350}
                    placeholder="Escribe aquí de forma detallada todo lo referente a tu anuncio. Recuerda ser claro, transparente y respetuoso..."
                    value={newAdDescription}
                    onChange={(e) => setNewAdDescription(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/20 border border-transparent focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#003087] dark:text-white font-bold outline-none resize-none transition-all"
                  />
                </div>

                {/* 3. Categoría* */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#003087] dark:text-[#C4C4C4]">
                    Categoría *
                  </label>
                  <select
                    value={newAdCategory}
                    onChange={(e) => {
                      setNewAdCategory(e.target.value);
                      if (e.target.value !== 'Vivienda' && e.target.value !== 'Alquiler') {
                        setNewAdPrice('');
                      }
                    }}
                    className="w-full bg-black/5 dark:bg-black/20 border border-transparent focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#003087] dark:text-white font-bold outline-none transition-all cursor-pointer"
                  >
                    {["Vivienda", "Alquiler", "Empleo", "Eventos"].map(cat => (
                      <option key={cat} value={cat} className="text-black">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Expandir opción de precio (opcional) si es Vivienda o Alquiler */}
                {(newAdCategory === 'Vivienda' || newAdCategory === 'Alquiler') && (
                  <div className="animate-fadeIn p-4 bg-[#003087]/5 dark:bg-white/5 border border-dashed border-[#003087]/15 dark:border-white/10 rounded-2xl space-y-1">
                    <label className="block text-xs font-extrabold text-[#003087] dark:text-[#FFCD00]">
                      Precio (€) <span className="text-[11px] text-gray-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 450"
                      value={newAdPrice}
                      onChange={(e) => setNewAdPrice(e.target.value)}
                      className="w-full bg-white dark:bg-black/40 border border-transparent focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#003087] dark:text-white font-bold outline-none"
                    />
                  </div>
                )}

                {/* 4. Teléfono* (que ya tenga el indicativo +34) */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#003087] dark:text-[#C4C4C4]">
                    Teléfono de Contacto * <span className="text-[11px] text-gray-400 font-normal">(Debe incluir +34)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. +34 600 112 233"
                    value={newAdPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.startsWith('+34')) {
                        setNewAdPhone('+34 ' + val.replace(/^\+34\s*/, ''));
                      } else {
                        setNewAdPhone(val);
                      }
                    }}
                    className="w-full bg-black/5 dark:bg-black/20 border border-transparent focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#003087] dark:text-white font-bold outline-none font-mono transition-all"
                  />
                </div>

                {/* 5. Ciudad* */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#003087] dark:text-[#C4C4C4]">
                    Ciudad de Ubicación *
                  </label>
                  <select
                    value={newAdCity}
                    onChange={(e) => setNewAdCity(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/20 border border-transparent focus:border-[#003087] dark:focus:border-[#FFCD00] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#003087] dark:text-white font-bold outline-none transition-all cursor-pointer"
                  >
                    {SPANISH_CITIES.map(city => (
                      <option key={city} value={city} className="text-black">{city}</option>
                    ))}
                  </select>
                </div>

                {/* 5.5. Imágenes (solo para Vivienda, Alquiler, Eventos) */}
                {(newAdCategory === 'Vivienda' || newAdCategory === 'Alquiler' || newAdCategory === 'Eventos') && (
                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-black/30 border border-black/5 dark:border-white/5 rounded-2xl animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-extrabold text-[#003087] dark:text-[#C4C4C4]">
                        Imágenes del Anuncio <span className="text-[10px] text-gray-400 font-normal">(Máx. 4)</span>
                      </label>
                      <span className="text-[10px] font-bold text-gray-400">
                        {newAdImages.length}/4
                      </span>
                    </div>

                    {/* Thumbnail grid */}
                    {newAdImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {newAdImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-black/10 dark:border-white/10 group">
                            <img src={img} alt={`ad-thumb-${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewAdImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-md transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button */}
                    {newAdImages.length < 4 && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (!e.target.files) return;
                            const files = Array.from(e.target.files);
                            const remaining = 4 - newAdImages.length;
                            const limitFiles = files.slice(0, remaining);

                            limitFiles.forEach(file => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setNewAdImages(prev => [...prev, reader.result as string]);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border border-dashed border-gray-300 dark:border-white/20 hover:border-[#003087] dark:hover:border-[#FFCD00] rounded-xl py-3 text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-white dark:bg-black/10">
                          <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-300">
                            Subir imágenes ({4 - newAdImages.length} disponibles)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Checking de aceptar responsabilidad de lo publicado en este anuncio* */}
                <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl flex items-start gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="acceptResponsibility"
                    checked={acceptResponsibility}
                    onChange={(e) => setAcceptResponsibility(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-white/20 text-[#003087] dark:text-[#FFCD00] focus:ring-[#003087] cursor-pointer"
                  />
                  <label htmlFor="acceptResponsibility" className="text-[11px] font-bold text-[#003087] dark:text-amber-300 leading-snug cursor-pointer select-none">
                    Acepto la responsabilidad total y legal de todo el contenido e información que publique en este anuncio *
                  </label>
                </div>

                <div className="text-[10px] text-[#C4C4C4] dark:text-gray-400 font-semibold text-center py-2">
                  ℹ️ Límite: Solo se permite publicar 1 anuncio cada 24 horas por usuario.
                </div>
              </div>

              {/* Pie del modal sticky con botón de enviar */}
              <footer className="sticky bottom-0 bg-white dark:bg-[#001845] border-t border-black/5 dark:border-white/10 p-5 shrink-0 z-10 shadow-lg">
                <div className="max-w-md mx-auto w-full">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#003087] hover:bg-[#002266] text-white dark:bg-[#FFCD00] dark:text-[#003087] font-sans font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center active:scale-95 uppercase tracking-wider"
                  >
                    Publicar Anuncio Ahora
                  </button>
                </div>
              </footer>
            </form>
          </div>
        )}

        {/* ================= MODAL DETALLE DE ANUNCIO (PANTALLA COMPLETA) ================= */}
        {selectedAdDetail && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-[#001133] flex flex-col overflow-hidden animate-fadeIn">
            {/* Cabecera del detalle */}
            <header className="sticky top-0 bg-white dark:bg-[#001845] border-b border-black/5 dark:border-white/10 px-5 py-4 flex items-center justify-between shrink-0 z-10 shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedAdDetail(null)}
                className="py-1 px-3 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#003087] dark:text-[#FFCD00] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                ← Volver
              </button>
              <span className="font-sans font-black text-xs text-gray-400 dark:text-gray-400 uppercase tracking-widest hidden sm:inline">
                Anuncio en detalle
              </span>
              <button
                type="button"
                onClick={() => setSelectedAdDetail(null)}
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Cuerpo del detalle scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-md mx-auto w-full text-left">
              {/* Carrusel de Imágenes (solo para Vivienda, Alquiler, Eventos si tienen imágenes) */}
              {(selectedAdDetail.category.toLowerCase() === 'vivienda' ||
                selectedAdDetail.category.toLowerCase() === 'alquiler' ||
                selectedAdDetail.category.toLowerCase() === 'eventos') &&
                selectedAdDetail.images &&
                selectedAdDetail.images.length > 0 && (
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 bg-black shadow-inner group animate-fadeIn">
                  {/* Active slide */}
                  <img
                    src={selectedAdDetail.images[activeCarouselIndex] || selectedAdDetail.images[0]}
                    alt={`slide-${activeCarouselIndex}`}
                    className="w-full h-full object-cover transition-all duration-300 select-none pointer-events-none"
                  />

                  {/* Left chevron button */}
                  {selectedAdDetail.images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCarouselIndex(prev =>
                          prev === 0 ? selectedAdDetail.images!.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 text-sm font-bold transition-all cursor-pointer select-none active:scale-90"
                    >
                      ‹
                    </button>
                  )}

                  {/* Right chevron button */}
                  {selectedAdDetail.images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCarouselIndex(prev =>
                          prev === selectedAdDetail.images!.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 text-sm font-bold transition-all cursor-pointer select-none active:scale-90"
                    >
                      ›
                    </button>
                  )}

                  {/* Indicators / Dot pagination */}
                  {selectedAdDetail.images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {selectedAdDetail.images.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCarouselIndex(dotIdx);
                          }}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            activeCarouselIndex === dotIdx
                              ? 'bg-white scale-125 px-1.5'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Categoría Badge */}
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  selectedAdDetail.category.toLowerCase() === 'vivienda' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  selectedAdDetail.category.toLowerCase() === 'alquiler' ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' :
                  selectedAdDetail.category.toLowerCase() === 'empleo' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                  {selectedAdDetail.category}
                </span>
              </div>

              {/* Título */}
              <h2 className="font-sans font-black text-lg sm:text-xl text-[#003087] dark:text-[#FFCD00] leading-snug">
                {selectedAdDetail.title}
              </h2>

              {/* Caja de Precio (si existe) */}
              {selectedAdDetail.price !== undefined && (
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-300">Precio de Referencia:</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {selectedAdDetail.price} €
                  </span>
                </div>
              )}

              {/* Perfil del Autor */}
              <div className="bg-[#003087]/5 dark:bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-black/[0.02] dark:border-white/[0.02]">
                <div className="w-10 h-10 rounded-full bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center font-bold text-sm text-[#003087] dark:text-[#FFCD00]">
                  {selectedAdDetail.authorUsername.slice(1, 3).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#003087] dark:text-white leading-tight">{selectedAdDetail.authorName}</h4>
                  <p className="text-[10px] text-[#C4C4C4] font-semibold">{selectedAdDetail.authorUsername}</p>
                </div>
              </div>

              {/* Descripción Completa */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#003087] dark:text-[#FFCD00] uppercase tracking-wider">Descripción</h4>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap bg-gray-50 dark:bg-black/10 p-4 rounded-2xl border border-black/[0.02] dark:border-white/[0.02]">
                  {selectedAdDetail.description}
                </p>
              </div>

              {/* Detalles de Ubicación y Fecha */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-[#003087] dark:text-[#FFCD00]" />
                  <span>{selectedAdDetail.city}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold">
                  Publicado el {new Date(selectedAdDetail.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Sección de Acciones Adicionales (Eliminar / Moderar / Reportar) */}
              <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
                {/* Toast de reporte exitoso */}
                {reportAdSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center animate-fadeIn">
                    🎉 ¡Anuncio reportado con éxito! Nuestro equipo de moderación revisará este contenido a la brevedad.
                  </div>
                )}

                {/* Botón de eliminar (para el Autor) */}
                {currentUser.id === selectedAdDetail.authorId && (
                  <div className="space-y-1 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        const adIdToDelete = selectedAdDetail?.id;
                        if (!adIdToDelete) return;
                        
                        setAnnouncements(prev => prev.filter(ad => ad.id !== adIdToDelete));
                        setSelectedAdDetail(null);
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-sans font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                    >
                      <Trash className="w-4 h-4" />
                      <span>Eliminar mi Anuncio</span>
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-1 font-semibold leading-normal">
                      Al eliminar este anuncio, liberarás tu espacio de publicación y podrás crear uno nuevo inmediatamente.
                    </p>
                  </div>
                )}


                {/* Botón de eliminar (para Admin / Soporte / Mod) */}
                {currentUser.id !== selectedAdDetail.authorId && (currentUser.role === 'administrador' || currentUser.role === 'soporte' || currentUser.role === 'moderador' || currentUser.isStaff) && (
                  <div className="animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('SOPORTE/ADMINISTRACIÓN: ¿Seguro que deseas eliminar permanentemente este anuncio del sistema?')) {
                          setAnnouncements(prev => prev.filter(ad => ad.id !== selectedAdDetail.id));
                          setSelectedAdDetail(null);
                        }
                      }}
                      className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-sans font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-red-500/20 shadow-md"
                    >
                      <Trash className="w-4 h-4" />
                      <span>Eliminar Anuncio (ADMIN - Soporte - Mod)</span>
                    </button>
                  </div>
                )}

                {/* Botón de reportar anuncio (para cualquier usuario que no sea el dueño) */}
                {currentUser.id !== selectedAdDetail.authorId && (
                  <div className="space-y-1 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setReportAdSuccess(true);
                        setTimeout(() => setReportAdSuccess(false), 3500);
                      }}
                      className="w-full py-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-red-600 dark:text-red-400 font-sans font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-transparent dark:border-white/5"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Reportar Anuncio</span>
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-1 font-semibold leading-normal">
                      Reporta este anuncio si consideras que infringe nuestras políticas de respeto, contiene estafas o contenido ofensivo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pie de Página Sticky con Botones de Acción */}
            <footer className="sticky bottom-0 bg-white dark:bg-[#001845] border-t border-black/5 dark:border-white/10 p-5 shrink-0 z-10 shadow-lg">
              <div className="max-w-md mx-auto w-full grid grid-cols-2 gap-3">
                {/* Chat privado */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdDetail(null);
                    // Open a chat transition / alert mock if desired
                  }}
                  className="py-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#003087] dark:text-[#C4C4C4] font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Chat privado</span>
                </button>

                {/* Llamar */}
                <a
                  href={`tel:${selectedAdDetail.phone}`}
                  className="py-3 bg-[#003087] hover:bg-[#002266] text-white dark:bg-[#FFCD00] dark:text-[#003087] font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center active:scale-95"
                >
                  <Phone className="w-4.5 h-4.5" />
                  <span>Llamar</span>
                </a>
              </div>
            </footer>
          </div>
        )}


      </main>

      {/* ================= DESKTOP WIDGET PANEL RIGHT ================= */}
      <section className="hidden lg:flex flex-col w-80 p-6 sticky top-0 h-screen border-l border-transparent dark:border-transparent bg-white dark:bg-gradient-to-b dark:from-[#003087] dark:to-[#000000] transition-colors">
        <div className="space-y-6">
          
          {/* Quick guide of Consulado checks */}
          <div className="bg-[#003087]/5 dark:bg-[#002266]/60 rounded-2xl p-4 border border-transparent dark:border-transparent">
            <h3 className="text-xs font-bold text-[#003087] dark:text-[#C4C4C4] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#003087] dark:text-[#FFCD00]" /> Checklist de Llegada <FlagEmoji country="es" size="sm" />
            </h3>
            <p className="text-[11px] text-[#C4C4C4] dark:text-[#FFCD00] mb-3">Guía rápida de primeros trámites indispensables para colombianos:</p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#003087] dark:text-[#FFCD00] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#003087] dark:text-[#C4C4C4]">1. Empadronamiento</p>
                  <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00]">Inscripción oficial en el ayuntamiento de tu ciudad.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#003087] dark:text-[#FFCD00] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#003087] dark:text-[#C4C4C4]">2. Cita de NIE / TIE</p>
                  <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00]">Obtención de la tarjeta de identidad de extranjero.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#003087] dark:text-[#FFCD00] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#003087] dark:text-[#C4C4C4]">3. Tarjeta Sanitaria (SIP)</p>
                  <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00]">Acceso al sistema de salud de tu comunidad autónoma.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#003087] dark:text-[#FFCD00] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#003087] dark:text-[#C4C4C4]">4. Homologación de Títulos</p>
                  <p className="text-[10px] text-[#C4C4C4] dark:text-[#FFCD00]">Trámite ante el Ministerio de Universidades.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Colombia nostalgia box */}
          <div className="bg-gradient-to-br from-[#003087]/5 to-[#FFCD00]/10 dark:from-[#002266]/60 dark:to-[#001D52]/60 rounded-2xl p-4 border border-transparent dark:border-transparent text-center">
            <span className="text-2xl inline-flex items-center justify-center gap-1">☕ <FlagEmoji country="co" size="md" /></span>
            <h3 className="font-sans font-black text-[#003087] dark:text-[#FFCD00] text-sm mt-1">¿Sabías qué?</h3>
            <p className="text-xs text-[#003087] dark:text-[#C4C4C4] mt-1.5 leading-relaxed italic">
              "En España hay registrados más de 600,000 colombianos. ¡Somos una de las comunidades más grandes, alegres, camelladoras y queridas del país!"
            </p>
            <div className="mt-3 text-[10px] text-[#C4C4C4] dark:text-[#FFCD00] font-semibold tracking-wider uppercase">
              Orgullo Colombiano
            </div>
          </div>

          {/* Community rules */}
          <div className="bg-[#003087]/5 dark:bg-[#002266]/60 rounded-2xl p-4 border border-transparent dark:border-transparent text-[11px] text-[#C4C4C4] dark:text-[#FFCD00] space-y-1.5">
            <h4 className="font-bold text-[#003087] dark:text-[#C4C4C4] uppercase tracking-wider text-xs mb-2">Normas de la Casa</h4>
            <p>1. 🤝 Respeto total entre paisanos, costeños, rolos, caleños, santandereanos, etc.</p>
            <p>2. 🚫 Prohibida la venta de citas de asilo o citas de extranjería.</p>
            <p>3. 💡 Apoyo mutuo: si sabes de un empleo o habitación disponible, compártelo.</p>
          </div>

        </div>
      </section>

    </div>
  );
}
