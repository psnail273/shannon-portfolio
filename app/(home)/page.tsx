import Intro from '@/components/intro/intro';
import Gallery from '@/components/gallery/gallery';

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-12 px-[18.4px]">
      <Intro />
      <Gallery />
    </div>
  );
}
