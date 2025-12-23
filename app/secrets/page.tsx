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
      <Gallery projects={ projects } uriPrefix="/secrets" />
    </PageWithGallery>
  );
}

export default function Secrets() {
  return (
    <Suspense fallback={ <Loading /> }>
      <GalleryLoader />
    </Suspense>
  );
}
