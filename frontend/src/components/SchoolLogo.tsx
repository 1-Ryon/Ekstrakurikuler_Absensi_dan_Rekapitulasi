import React from 'react';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', title: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 'w-11 h-11', title: 'text-[15px]', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', title: 'text-lg', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      {/* Crest Badge SVG matching the green & gold emblem */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 rounded-full flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Gold Border */}
          <circle cx="50" cy="50" r="47" stroke="#EAB308" strokeWidth="4" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="43" fill="#059669" />
          <circle cx="50" cy="50" r="41" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 2" />
          
          {/* Inner Shield / Star Emblem */}
          <polygon points="50,15 59,38 84,38 64,52 71,76 50,62 29,76 36,52 16,38 41,38" fill="#FACC15" opacity="0.25" />
          
          {/* Open Book of Knowledge / Al-Quran Symbol */}
          <path d="M50 42 C 43 38, 32 38, 26 42 L 26 68 C 32 64, 43 64, 50 69 C 57 64, 68 64, 74 68 L 74 42 C 68 38, 57 38, 50 42 Z" fill="#FFFFFF" />
          
          {/* Spine and Page lines */}
          <line x1="50" y1="42" x2="50" y2="69" stroke="#059669" strokeWidth="2" />
          <path d="M30 48 C 36 45, 44 45, 48 48" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M30 55 C 36 52, 44 52, 48 55" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M52 48 C 56 45, 64 45, 70 48" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M52 55 C 56 52, 64 52, 70 55" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Top Torch / Star of Light */}
          <circle cx="50" cy="27" r="4" fill="#FDE047" />
          <path d="M50 20 L 50 34 M 43 27 L 57 27" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Laurel Leaf Wreath at Base */}
          <path d="M32 75 C 40 81, 60 81, 68 75" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-slate-800 uppercase ${currentSize.title} leading-tight`}>
            SMK AL AMANAH
          </span>
          <span className={`font-medium tracking-wider text-slate-500 uppercase ${currentSize.sub} leading-tight`}>
            KOTA TANGERANG SELATAN
          </span>
        </div>
      )}
    </div>
  );
};
