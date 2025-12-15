import Gallery from '@/components/gallery/gallery';
import { getImages } from '@/lib/db';

export default async function Secrets() {
  const images = await getImages(true);
  
  return (
    <Gallery images={ images } uriPrefix="/secrets" />
  );
}
