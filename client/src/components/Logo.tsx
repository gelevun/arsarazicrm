import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        viewBox="0 0 24 24"
        className={cn(sizeClasses[size])}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ana konum pimi şekli - yeşil, sarı, mavi renklerle */}
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="#228B22"
        />
        
        {/* Sarı/Altın segment - üst sağda */}
        <path
          d="M12 2L16 6L12 10L8 6L12 2Z"
          fill="#FFD700"
        />
        
        {/* Merkezi mavi daire */}
        <circle
          cx="12"
          cy="9"
          r="2.5"
          fill="#1E40AF"
        />
        
        {/* Alt sağdaki mavi segment */}
        <path
          d="M14 11L16 13L14 15L12 13L14 11Z"
          fill="#1E40AF"
        />
      </svg>
    </div>
  );
}

// Daha detaylı versiyon - gördüğünüz logoya daha yakın
export function DetailedLogo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        viewBox="0 0 24 24"
        className={cn(sizeClasses[size])}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ana konum pimi şekli */}
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="#228B22"
        />
        
        {/* Sarı segment - üst sağda kavisli */}
        <path
          d="M12 2C14.5 2 16.5 3.5 17 5.5C17.5 7.5 16.5 9 15 9.5C13.5 10 12 9.5 10.5 9C9 8.5 8 7 8.5 5.5C9 4 10.5 2 12 2Z"
          fill="#FFD700"
        />
        
        {/* Merkezi mavi daire */}
        <circle
          cx="12"
          cy="9"
          r="2.5"
          fill="#1E40AF"
        />
        
        {/* Alt sağdaki mavi dikdörtgen segment */}
        <rect
          x="13"
          y="11"
          width="3"
          height="2"
          fill="#1E40AF"
        />
        
        {/* Sol alttaki yeşil segment */}
        <path
          d="M5 9L7 11L5 13L3 11L5 9Z"
          fill="#228B22"
        />
      </svg>
    </div>
  );
}

// Basit versiyon - performans için
export function SimpleLogo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        viewBox="0 0 24 24"
        className={cn(sizeClasses[size])}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ana konum pimi - yeşil */}
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="#228B22"
        />
        
        {/* Sarı üst segment */}
        <path
          d="M12 2L16 6L12 10L8 6L12 2Z"
          fill="#FFD700"
        />
        
        {/* Merkezi mavi daire */}
        <circle
          cx="12"
          cy="9"
          r="2.5"
          fill="#1E40AF"
        />
      </svg>
    </div>
  );
}