'use client';

import Image from 'next/image';

import Masonry from '@mui/lab/Masonry';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProjectType } from '@/lib/types';
import { altTextFromSrc } from '@/lib/image-utils';
import Filter from '../filter/filter';

interface GalleryEntry {
  slug: string;
  name: string;
  types: string[];
  hasImage: boolean;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

function getTitleSize(name: string): string {
  const len = name.length;
  if (len <= 15) return 'text-3xl';
  if (len <= 30) return 'text-2xl';
  return 'text-xl';
}

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadedImages(prev => {
        const next = new Set(prev);
        for (const p of projects) {
          if (p.images.length === 0) next.add(p.slug);
        }
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
    setTimeout(() => {
      setLoadedImages(prev => {
        const next = new Set(prev);
        for (const p of projects) {
          if (p.images.length === 0) next.add(p.slug);
        }
        return next;
      });
    }, 300);
  }

  const galleryEntries: GalleryEntry[] = filteredProjects.map((project) => {
    const firstImage = project.images[0];
    return {
      slug: project.slug,
      name: project.title,
      types: project.types,
      hasImage: !!firstImage,
      ...(firstImage && {
        src: firstImage.src,
        alt: firstImage.alt,
        width: firstImage.width,
        height: firstImage.height,
      }),
    };
  });

  const allImagesLoaded = galleryEntries.every(
    (entry) => !entry.hasImage || loadedImages.has(entry.slug)
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 xl:gap-10">
      <Filter selectedFilter={ selectedFilter } handleFilterClick={ handleFilterClick } filters={ filters } />
      <Masonry columns={ { sm: 1, md: 2, lg: 3 } } spacing={ 5 } sx={ { width: 'auto' } }>
        { galleryEntries.map((entry, index) => (
          <div
            key={ selectedFilter + '-' + entry.slug }
            className="overflow-hidden"
          >
            <Link href={ `${uriPrefix}/${entry.slug}` } className="group block">
              <div
                className={ `relative flex flex-col transition-transform ease-in-out duration-500 ${
                  loadedImages.has(entry.slug)
                    ? 'translate-x-0'
                    : '-translate-x-[calc(100%+1px)]'
                }` }
                style={ {
                  transitionDelay: `${getDelayFromSlug(entry.slug)}ms`
                } }
              >
                <div className={ `${allImagesLoaded ? 'flex' : 'hidden'} absolute z-10 text-white flex-col gap-2 justify-end p-10 inset-0 bg-accent/0 group-hover:bg-accent/75 group-active:bg-accent/75 group-focus-visible:bg-accent/75 transition-colors duration-400 ease-in-out` }>
                  <span
                    className={ `${getTitleSize(entry.name)} font-playfair capitalize opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-active:-translate-y-[15px] group-active:opacity-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100` }
                  >{ entry.name }</span>
                  <span
                    className="text-xs uppercase opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-hover:delay-100 group-active:-translate-y-[15px] group-active:opacity-100 group-active:delay-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100 group-focus-visible:delay-100"
                  >{ entry.types.join(', ') }</span>
                </div>

                { entry.hasImage ? (
                  <Image
                    src={ entry.src! }
                    alt={ entry.alt || altTextFromSrc(entry.src!) }
                    width={ entry.width! }
                    height={ entry.height! }
                    className="object-contain"
                    loading={ index < 3 ? 'eager' : 'lazy' }
                    onLoad={ () => {
                      setLoadedImages(prev => new Set(prev).add(entry.slug));
                    } }
                  />
                ) : (
                  <div className="flex items-center justify-center aspect-[4/3] bg-surface border border-border-subtle">
                    <span className="text-5xl font-playfair text-muted -translate-y-6">Blog</span>
                  </div>
                ) }

              </div>
            </Link>
          </div>
        )) }
      </Masonry>
      
    </div>
  );
}
