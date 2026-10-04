import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, Sparkles, ShieldCheck } from 'lucide-react';

import bunuelosImg from '../assets/images/colombian_bakery_bunuelos_1790958795549.jpg';
import empanadasImg from '../assets/images/colombian_empanadas_sauce_1790958816339.jpg';
import bannerImg from '../assets/images/la_tierrita_banner_1790958782956.jpg';
import salsaClubImg from '../assets/images/vallenato_salsa_club_1790958805100.jpg';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  badgeColor?: string;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    title: 'Gran Encuentro Colombiano en Madrid',
    subtitle: 'Conecta con más de 1.000 compatriotas este fin de semana',
    tag: 'Evento Oficial 🇨🇴',
    imageUrl: bannerImg
  },
  {
    id: 'slide-2',
    title: 'Ruta Gastronómica: Sabores de Colombia',
    subtitle: 'Ajiaco, empanadas y bandeja paisa en los mejores rincones de España',
    tag: 'Gastronomía 🥟',
    imageUrl: empanadasImg
  },
  {
    id: 'slide-3',
    title: 'Noches de Cumbia y Salsa en Barcelona',
    subtitle: 'Siente el ritmo y la alegría de la tierrita',
    tag: 'Cultura & Música 🎶',
    imageUrl: salsaClubImg
  },
  {
    id: 'slide-4',
    title: 'Red de Emprendedores Colombianos',
    subtitle: 'Apoya el talento y los negocios de nuestra gente',
    tag: 'Emprendimiento 💼',
    imageUrl: bunuelosImg
  }
];

interface ExploreCarouselProps {
  slides?: CarouselSlide[];
  isAdmin?: boolean;
}

export const ExploreCarousel: React.FC<ExploreCarouselProps> = ({
  slides = DEFAULT_SLIDES,
  isAdmin = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-advance slide every 4.5 seconds
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 40;
    const isSwipeRight = distance < -40;

    if (isSwipeLeft) {
      handleNext();
    } else if (isSwipeRight) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-black group select-none transition-all border border-black/10 dark:border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* SLIDES CONTAINER WITH TRANSITION */}
      <div 
        className="flex transition-transform duration-500 ease-out h-48 sm:h-56"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full shrink-0 relative overflow-hidden">
            {/* Background Image */}
            <img 
              src={slide.imageUrl} 
              alt={slide.title}
              className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700"
            />

            {/* Dark Gradient Overlay for optimal legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Slide Content */}
            <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-white z-10">
              {/* Top Tag & Admin Lock Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="bg-[#003087]/80 backdrop-blur-md text-[#FFCD00] border border-[#FFCD00]/30 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#FFCD00]" />
                  {slide.tag}
                </span>

                {/* Admin Managed Indicator */}
                <span className="bg-black/60 backdrop-blur-md text-white/80 border border-white/20 font-semibold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-[#FFCD00]" />
                  <span className="hidden sm:inline">Exclusivo Admin</span>
                  <span className="sm:hidden">Admin</span>
                </span>
              </div>

              {/* Bottom Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="font-sans font-black text-sm sm:text-base text-white leading-tight drop-shadow-md">
                  {slide.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/85 font-medium line-clamp-2 drop-shadow-xs">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NAVIGATION ARROWS */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all z-20 active:scale-90"
        title="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all z-20 active:scale-90"
        title="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* PAGINATION DOTS */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`transition-all rounded-full ${
              currentIndex === idx 
                ? 'w-5 h-1.5 bg-[#FFCD00]' 
                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
            title={`Diapositiva ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
