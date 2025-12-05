import { images } from '@/lib/images';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function DesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const image = images.find((image) => image.slug === slug);

  if (!image) {
    notFound();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-30 justify-center items-center lg:items-start">
      <Image 
        src={ image.src }
        alt={ image.alt }
        width={ image.width }
        height={ image.height }
        className="object-contain max-w-[600px] w-full"
      />
      <div className="flex flex-col max-w-[300px] w-full gap-8">
        <div className="text-4xl font-playfair capitalize">{ image.name }</div>
        <div className="">{ image.description }</div>
        <hr className="w-[15%] h-[2px] border-none bg-[#8d8d8d]/30"/>
        <div className="">Created on { image.date }</div>
      </div>
    </div>
  );
}