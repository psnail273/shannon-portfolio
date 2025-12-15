import 'server-only'

import { notFound } from 'next/navigation';
import GalleryItem from '@/components/galleryItem/galleryItem';
import { getImageBySlug } from '@/lib/db';

export default async function SecretsDesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const image = await getImageBySlug(slug);

  if (!image) {
    notFound();
  }

  return (
    <GalleryItem image={ image } />
  );
}