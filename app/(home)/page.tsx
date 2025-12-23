// app/(home)/page.tsx
import Intro from '@/components/intro/intro';
import Gallery from '@/components/gallery/gallery';
import { getProjects } from '@/lib/db';
import Loading from '@/components/loading/loading';
import { Suspense } from 'react';
import PageWithGallery from '@/components/page-with-gallery/page-with-gallery';

// Separate async component for the gallery with preloading
async function GalleryLoader() {
  const projects = await getProjects(true);
  return (
    <PageWithGallery projects={ projects }>
      <Gallery projects={ projects } />
    </PageWithGallery>
  );
}

export default async function Home() {
  return (
    <div className="flex flex-col gap-6 sm:gap-10 md:gap-14 lg:gap-18 xl:gap-24 py-2 sm:py-4 md:py-8 xl:py-12 px-8">
      <Intro />
      <Suspense fallback={ <Loading /> }>
        <GalleryLoader />
      </Suspense>
    </div>
  );
}
