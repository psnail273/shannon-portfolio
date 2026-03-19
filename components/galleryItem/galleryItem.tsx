import { ProjectType } from '@/lib/types';
import Image from 'next/image';
import Markdown from 'react-markdown';

export default async function GalleryItem({ project }: { project: ProjectType }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 justify-between items-start px-8">
      <div className="flex flex-col gap-4 w-full" >
        { project.images.map((img) => (
          <Image 
            key={ img.src }
            src={ img.src }
            alt={ img.alt }
            width={ img.width }
            height={ img.height }
            className="object-contain w-full"
          />
        )) }
      </div>
      <div className="flex flex-col gap-8 lg:max-w-[300px]">
        <div className="text-4xl font-playfair capitalize">{ project.title }</div>
        <div className="prose prose-md">
          <Markdown>{ project.description }</Markdown>
        </div>
        <hr className="w-full h-[2px] border-none bg-[#8d8d8d]/30"/>
      </div>
    </div>
  );
}
