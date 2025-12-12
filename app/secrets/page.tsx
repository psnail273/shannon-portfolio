import Gallery from '@/components/gallery/gallery';
import { secrets } from '@/lib/secrets';

export default async function Secrets() {
  return (
    <Gallery images={ secrets } uriPrefix="/secrets" />
  );
}
