import GalleryItem from '@/components/galleryItem/galleryItem';
import { notFound } from 'next/navigation';
import { getImageBySlug } from '@/lib/db';

export default async function DesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const image = await getImageBySlug(slug);

  if (!image) {
    notFound();
  }

  return (
    <GalleryItem image={ image } />
  );
}