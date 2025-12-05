import Intro from '@/components/intro/intro';
import Gallery from '@/components/gallery/gallery';

export default function Home() {
  return (
    <div className="flex flex-col gap-6 sm:gap-10 md:gap-14 lg:gap-18 xl:gap-24 py-2 sm:py-4 md:py-8 xl:py-12 px-8">
      <Intro />
      <Gallery />
    </div>
  );
}
