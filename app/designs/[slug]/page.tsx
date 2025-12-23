import GalleryItem from '@/components/galleryItem/galleryItem';
import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/db';
import PageWithImage from '@/components/page-with-image/page-with-image';

export default async function DesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <PageWithImage imageSrcs={ project.images.map((img) => img.src) }>
      <GalleryItem project={ project } />
    </PageWithImage>
  );
}
