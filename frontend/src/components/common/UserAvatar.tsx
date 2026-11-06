import React from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  src?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  title?: string;
}

const AVATAR_PALETTE = [
  '#00A884',
  '#0284C7',
  '#4F46E5',
  '#7C3AED',
  '#C026D3',
  '#E11D48',
  '#EA580C',
  '#D97706',
  '#059669',
  '#0D9488',
  '#2563EB',
  '#475569',
];

export function getCleanName(fullName: string): string {
  if (!fullName) return '';
  const titlesRegex = /\b(S\.Pd\.|M\.Pd\.|S\.Kom\.|M\.Kom\.|S\.Pd\.I\.|S\.T\.|M\.T\.|S\.Si\.|M\.Si\.|Lc\.|Dr\.|Drs\.|H\.|Hj\.|Ir\.|Bpk\.|Ibu|Pak|Bu)\b/gi;
  return fullName
    .replace(titlesRegex, '')
    .replace(/[,.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getInitials(fullName: string): string {
  const clean = getCleanName(fullName);
  if (!clean) return 'U';

  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return 'U';
}

export function getAvatarColor(fullName: string): string {
  if (!fullName) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs sm:text-sm',
  lg: 'w-12 h-12 text-sm sm:text-base',
  xl: 'w-16 h-16 text-lg sm:text-xl',
  '2xl': 'w-20 h-20 text-xl sm:text-2xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  avatarUrl,
  src,
  className = '',
  size = 'md',
  title,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const imageSource = avatarUrl || src;

  if (imageSource && !imageError) {
    return (
      <img
        src={imageSource}
        alt={name}
        title={title || name}
        onError={() => setImageError(true)}
        className={`rounded-full object-cover shrink-0 select-none shadow-2xs ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      title={title || name}
      className={`rounded-full flex items-center justify-center font-bold text-white select-none shrink-0 tracking-wider transition-transform duration-150 ${sizeClass} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <span>{initials}</span>
    </div>
  );
};
