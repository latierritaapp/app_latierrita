import { ProfilePost } from '../types/post';

import bunuelosImg from '../assets/images/colombian_bakery_bunuelos_1790958795549.jpg';
import empanadasImg from '../assets/images/colombian_empanadas_sauce_1790958816339.jpg';
import bannerImg from '../assets/images/la_tierrita_banner_1790958782956.jpg';
import salsaClubImg from '../assets/images/vallenato_salsa_club_1790958805100.jpg';

export const INITIAL_USER_POSTS: ProfilePost[] = [
  {
    id: 'post-latierrita-1',
    authorId: 'user-latierrita-app',
    authorName: 'La Tierrita',
    authorUsername: '@latierrita_app',
    authorAvatar: '🇨🇴',
    location: 'Madrid, España 🇪🇸',
    imageUrl: bannerImg,
    caption: '¡Bienvenidos a La Tierrita App! 🇨🇴 La comunidad oficial de colombianos en España. Conecta, comparte y siéntete como en casa. 💛💙❤️',
    likesCount: 1250,
    commentsCount: 94,
    timestamp: 'Hace 1 día',
    isLiked: true,
    isSaved: false
  },
  {
    id: 'post-latierrita-2',
    authorId: 'user-latierrita-app',
    authorName: 'La Tierrita',
    authorUsername: '@latierrita_app',
    authorAvatar: '🇨🇴',
    location: 'Barcelona, España 🇪🇸',
    imageUrl: salsaClubImg,
    caption: 'Tarde de café y encuentro cultural de la comunidad colombiana en España. ¡Gracias a todos los parceros que asistieron! ☕✨',
    likesCount: 840,
    commentsCount: 42,
    timestamp: 'Hace 3 días',
    isLiked: false,
    isSaved: false
  },
  {
    id: 'post-latierrita-3',
    authorId: 'user-latierrita-app',
    authorName: 'La Tierrita',
    authorUsername: '@latierrita_app',
    authorAvatar: '🇨🇴',
    location: 'Valencia, España 🇪🇸',
    imageUrl: empanadasImg,
    caption: 'Sabor de hogar: feria gastronomica colombiana con empanadas, arepas y el mejor ají casero 🤤🥟🇨🇴',
    likesCount: 960,
    commentsCount: 58,
    timestamp: 'Hace 5 días',
    isLiked: false,
    isSaved: false
  }
];

export const INITIAL_TAGGED_POSTS: ProfilePost[] = [];

// Saved posts start completely empty so that no default "fictitious" saved posts are shown
export const INITIAL_SAVED_POSTS: ProfilePost[] = [];
