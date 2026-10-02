import React from 'react';
import schoolLogoImg from '../assets/logo-smk.png';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const sizeMap = {
    sm: { icon: 'w-9 h-9', title: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 'w-11 h-11', title: 'text-[15px]', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', title: 'text-lg', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', title: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official SMK Al Amanah Logo from assets */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center`}>
        <img
          src={schoolLogoImg}
          alt="Logo SMK Al Amanah"
          className="w-full h-full object-contain drop-shadow-xs"
        />
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

