import React from 'react';

interface FlagEmojiProps {
  country: 'co' | 'es' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const FLAG_MAP: Record<string, { src: string; alt: string; name: string }> = {
  co: {
    src: 'https://flagcdn.com/co.svg',
    alt: '🇨🇴',
    name: 'Colombia'
  },
  es: {
    src: 'https://flagcdn.com/es.svg',
    alt: '🇪🇸',
    name: 'España'
  },
  '🇨🇴': {
    src: 'https://flagcdn.com/co.svg',
    alt: '🇨🇴',
    name: 'Colombia'
  },
  '🇪🇸': {
    src: 'https://flagcdn.com/es.svg',
    alt: '🇪🇸',
    name: 'España'
  }
};

export const FlagEmoji: React.FC<FlagEmojiProps> = ({ country, size = 'md', className = '' }) => {
  const code = country.toLowerCase();
  const info = FLAG_MAP[code] || FLAG_MAP[country] || {
    src: `https://flagcdn.com/${code}.svg`,
    alt: country,
    name: country
  };

  const sizeClasses = {
    sm: 'w-4 h-3 rounded-[2px]',
    md: 'w-5 h-3.5 rounded-[2px]',
    lg: 'w-6 h-4 rounded-xs',
    xl: 'w-8 h-5 rounded-xs'
  }[size];

  return (
    <img
      src={info.src}
      alt={info.alt}
      title={info.name}
      loading="lazy"
      className={`inline-block object-cover shadow-2xs align-middle select-none shrink-0 ${sizeClasses} ${className}`}
    />
  );
};

export const TextWithFlags: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split string by Colombia and Spain flag emoji characters
  const regex = /(🇨🇴|🇪🇸)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part === '🇨🇴') {
          return (
            <span key={index} className="inline-flex items-center align-baseline mx-0.5">
              <FlagEmoji country="co" size="sm" />
            </span>
          );
        }
        if (part === '🇪🇸') {
          return (
            <span key={index} className="inline-flex items-center align-baseline mx-0.5">
              <FlagEmoji country="es" size="sm" />
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};
