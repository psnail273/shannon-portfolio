import 'server-only'

import { secrets } from '@/lib/secrets';
import { notFound } from 'next/navigation';
import GalleryItem from '@/components/galleryItem/galleryItem';

export default async function SecretsDesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const image = secrets.find((image) => image.slug === slug);

  if (!image) {
    notFound();
  }

  return (
    <GalleryItem image={ image } />
  );
}