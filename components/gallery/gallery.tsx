'use client';

import Image from 'next/image';

import Masonry from '@mui/lab/Masonry';
import { filters } from '@/lib/filter';
import { useState } from 'react';
import Link from 'next/link';
import { GalleryImageType } from '@/lib/types';

function getDelayFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash % 500);
}

export default function Gallery({ images, uriPrefix = '/designs' }: { images: GalleryImageType[], uriPrefix?: string }) {
  const [selectedFilter, setSelectedFilter] = useState(filters[0].name);
  const [filteredImages, setFilteredImages] = useState(images.filter((image) => image.types.includes(selectedFilter) || selectedFilter === 'All'));
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleFilterClick = async (filter: string) => {
    setLoadedImages(new Set());
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedFilter(filter);
    setFilteredImages(images.filter((image) => image.types.includes(filter) || filter === 'All'));
  }

  const allImagesLoaded = filteredImages.every((img) => loadedImages.has(img.slug));

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 xl:gap-10">
      <div className="flex flex-row items-center gap-4 overflow-x-auto text-nowrap">
        { filters.map((filter) => (
          <div
            className="relative text-[#8d8d8d] hover:text-black active:text-black focus-visible:text-black transistion-colors duration-400 ease-in-out px-2"
            key={ filter.name }
            onClick={ async () => handleFilterClick(filter.name) }
          >
            <hr className={ `absolute left-0 ${selectedFilter === filter.name ? 'w-full': 'w-0'} top-2.75 h-[2px] bg-[#b997ce]` }/>
            <span className="cursor-pointer">{ filter.name }</span>
          </div>
        )) }
      </div>
      <Masonry columns={ { sm: 1, md: 2, lg: 3 } } spacing={ 5 } sx={ { width: 'auto' } }>
        { filteredImages.map((image, index) => (
          <div 
            key={ selectedFilter + '-' + image.slug }
            className="overflow-hidden"
          >
            <Link href={ `${uriPrefix}/${image.slug}` } className="group block">
              <div 
                className={ `relative flex flex-col transition-transform ease-in-out duration-500 ${
                  loadedImages.has(image.slug) 
                    ? 'translate-x-0' 
                    : '-translate-x-[calc(100%+1px)]'
                }` }
                style={ { 
                  transitionDelay: `${getDelayFromSlug(image.slug)}ms`
                } }
              >
                <div className={ `${allImagesLoaded ? 'flex' : 'hidden'} absolute z-10 text-white flex-col gap-2 justify-end p-10 inset-0 bg-[#b997ce] opacity-0 group-hover:opacity-75 group-active:opacity-75 group-focus-visible:opacity-75 transition-opacity duration-400 ease-in-out` }>
                  <span 
                    className="text-3xl font-playfair capitalize opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-active:-translate-y-[15px] group-active:opacity-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100"
                  >{ image.name }</span>
                  <span 
                    className="text-xs uppercase opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-hover:delay-100 group-active:-translate-y-[15px] group-active:opacity-100 group-active:delay-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100 group-focus-visible:delay-100"
                  >{ image.types.join(', ') }</span>
                </div>
              
                <Image 
                  src={ image.src }
                  alt={ image.alt }
                  width={ image.width }
                  height={ image.height }
                  className="object-contain"
                  loading={ index < 3 ? 'eager' : 'lazy' }
                  onLoad={ () => { 
                    console.log( selectedFilter + '-' + image.slug );
                    setLoadedImages(prev => new Set(prev).add(image.slug));
                  } }
                />
              
              </div>
            </Link>
          </div>
        )) }
      </Masonry>
      
    </div>
  );
}