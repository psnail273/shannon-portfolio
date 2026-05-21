'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BackgroundLogo() {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="absolute flex px-8 pt-4 justify-start z-1">
      <Link href="/" className="inline-block relative w-[200px] 3xl:w-[300px] aspect-[412/243]">
        <Image
          src={ isDarkMode ? '/shannon_logo_light.png' : '/shannon_logo_dark.png' }
          alt="Shannon Logo"
          fill={ true }
          sizes="(min-width: 1920px) 300px, 200px"
          priority
          className="object-contain"
        />
      </Link>
    </div>
  );
}
