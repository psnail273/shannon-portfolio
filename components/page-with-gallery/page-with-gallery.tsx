'use client';

import { useState, useEffect } from 'react';
import Loading from '@/components/loading/loading';
import { ProjectType } from '@/lib/types';

interface PageWithGalleryProps {
  projects: ProjectType[];
  children: React.ReactNode;
}

export default function PageWithGallery({ projects, children }: PageWithGalleryProps) {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    // Get the first image from each project
    const imagesToPreload = projects
      .filter((project) => project.images.length > 0)
      .map((project) => project.images[0]);

    if (imagesToPreload.length === 0) {
      setAllImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;
    const imageElements: HTMLImageElement[] = [];

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setAllImagesLoaded(true);
      }
    };

    for (const image of imagesToPreload) {
      const img = new window.Image();
      img.src = image.src;
      
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
  }, [projects]);

  if (!allImagesLoaded) {
    return <Loading />;
  }

  return <>{ children }</>;
}
