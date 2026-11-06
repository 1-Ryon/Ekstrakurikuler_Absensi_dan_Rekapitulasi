import React from 'react';
import schoolLogoImg from '../assets/logo-smk.png';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  size = 'md', 
  showText = true,
  title = 'Absensi Estrakurikuler',
  subtitle = 'SMK Al-Amanah',
  className = '' 
}) => {
  const sizeMap = {
    sm: { icon: 'w-9 h-9', title: 'text-xs', sub: 'text-[9px]' },
    md: { icon: 'w-11 h-11', title: 'text-sm font-extrabold', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', title: 'text-base font-extrabold', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', title: 'text-xl font-extrabold', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center`}>
        <img
          src={schoolLogoImg}
          alt="Logo SMK Al-Amanah"
          className="w-full h-full object-contain drop-shadow-xs"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-slate-800 uppercase ${currentSize.title} leading-tight`}>
            {title}
          </span>
          <span className={`font-semibold tracking-wider text-[#00B884] uppercase ${currentSize.sub} leading-tight`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

