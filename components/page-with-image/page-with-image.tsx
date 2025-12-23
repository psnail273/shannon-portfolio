'use client';

import { useState, useEffect } from 'react';
import Loading from '@/components/loading/loading';

interface PageWithImageProps {
  imageSrcs: string[];
  children: React.ReactNode;
}

export default function PageWithImage({ imageSrcs, children }: PageWithImageProps) {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    if (imageSrcs.length === 0) {
      setAllImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageSrcs.length;
    const imageElements: HTMLImageElement[] = [];

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setAllImagesLoaded(true);
      }
    };

    for (const src of imageSrcs) {
      const img = new window.Image();
      img.src = src;
      
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded); // Count errors as loaded to not block forever
      }
      
      imageElements.push(img);
    }

    return () => {
      for (const img of imageElements) {
        img.removeEventListener('load', checkAllLoaded);
        img.removeEventListener('error', checkAllLoaded);
      }
    };
  }, [imageSrcs]);

  if (!allImagesLoaded) {
    return <Loading />;
  }

  return <>{ children }</>;
}
