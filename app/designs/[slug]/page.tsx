import GalleryItem from '@/components/galleryItem/galleryItem';
import { images } from '@/lib/images';
import { notFound } from 'next/navigation';

export default async function DesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const image = images.find((image) => image.slug === slug);

  if (!image) {
    notFound();
  }

  return (
    <GalleryItem image={ image } />
  );
}