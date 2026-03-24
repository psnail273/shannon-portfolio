'use client';

import Image from 'next/image';

import Masonry from '@mui/lab/Masonry';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProjectType } from '@/lib/types';
import { altTextFromSrc } from '@/lib/image-utils';
import Filter from '../filter/filter';

function getDelayFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash % 500);
}

export default function Gallery({ projects, uriPrefix = '/designs' }: { projects: ProjectType[], uriPrefix?: string }) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState(
    projects.filter((project) => project.types.includes(selectedFilter) || selectedFilter === 'All')
  );
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const filters = useMemo(() => {
    const set = new Set<string>();
    for (const project of projects) {
      for (const t of project.types) set.add(t);
    }
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const handleFilterClick = async (filter: string) => {
    setLoadedImages(new Set());
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedFilter(filter);
    setFilteredProjects(projects.filter((project) => project.types.includes(filter) || filter === 'All'));
  }

  // Get the first image from each filtered project
  const filteredImages = filteredProjects
    .filter((project) => project.images.length > 0)
    .map((project) => ({
      ...project.images[0],
      slug: project.slug,
      name: project.title,
      types: project.types,
    }));

  const allImagesLoaded = filteredImages.every((img) => loadedImages.has(img.slug));

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 xl:gap-10">
      <Filter selectedFilter={ selectedFilter } handleFilterClick={ handleFilterClick } filters={ filters } />
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
                <div className={ `${allImagesLoaded ? 'flex' : 'hidden'} absolute z-10 text-white flex-col gap-2 justify-end p-10 inset-0 bg-accent/0 group-hover:bg-accent/75 group-active:bg-accent/75 group-focus-visible:bg-accent/75 transition-colors duration-400 ease-in-out` }>
                  <span 
                    className="text-3xl font-playfair capitalize opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-active:-translate-y-[15px] group-active:opacity-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100"
                  >{ image.name }</span>
                  <span 
                    className="text-xs uppercase opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-hover:delay-100 group-active:-translate-y-[15px] group-active:opacity-100 group-active:delay-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100 group-focus-visible:delay-100"
                  >{ image.types.join(', ') }</span>
                </div>
              
                <Image 
                  src={ image.src }
                  alt={ image.alt || altTextFromSrc(image.src) }
                  width={ image.width }
                  height={ image.height }
                  className="object-contain"
                  loading={ index < 3 ? 'eager' : 'lazy' }
                  onLoad={ () => { 
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
