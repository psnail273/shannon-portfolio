'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BackgroundLogo() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Wait for mount to detect dark mode and avoid showing wrong logo
  if (!mounted) {
    return (
      <div className="absolute flex px-8 pt-4 justify-start z-1">
        <div className="inline-block relative w-[200px] 3xl:w-[300px] aspect-[412/243]" />
      </div>
    );
  }

  const logoSrc = isDarkMode
    ? '/shannon_logo_light.png'
    : '/shannon_logo_dark.png';

  return (
    <div className="absolute flex px-8 pt-4 justify-start z-1">
      <Link href="/" className="inline-block relative w-[200px] 3xl:w-[300px] aspect-[412/243]">
        <Image
          src={ logoSrc }
          alt="Shannon Logo"
          fill={ true }
          unoptimized
          sizes="(min-width: 1920px) 300px, 200px"
          priority
          className="object-contain"
        />
      </Link>
    </div>
  );
}
