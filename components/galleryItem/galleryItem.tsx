import { GalleryImageType } from '@/lib/types';
import Image from 'next/image';

export default async function GalleryItem({ image }: { image: GalleryImageType }) {
  const date = new Date(image.date);

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 justify-between px-8 items-start">
      <Image 
        src={ image.src }
        alt={ image.alt }
        width={ image.width }
        height={ image.height }
        className="object-contain lg:max-w-[600px] w-full"
      />
      <div className="flex flex-col w-full gap-8">
        <div className="text-4xl font-playfair capitalize">{ image.name }</div>
        <div className="">{ image.description }</div>
        <hr className="w-[15%] h-[2px] border-none bg-[#8d8d8d]/30"/>
        <div className="">Created on { date.toLocaleDateString() }</div>
      </div>
    </div>
  );
}