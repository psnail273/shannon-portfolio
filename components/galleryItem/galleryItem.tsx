import { ProjectType } from '@/lib/types';
import { getImagesByUrls } from '@/lib/db';
import Image from 'next/image';
import Markdown from 'react-markdown';

export default async function GalleryItem({ project }: { project: ProjectType }) {
  // Extract image URLs from markdown description
  const imageUrlRegex = /!\[.*?\]\((.*?)\)/g;
  const imageUrls: string[] = [];
  let match;
  while ((match = imageUrlRegex.exec(project.description)) !== null) {
    if (match[1]) imageUrls.push(match[1]);
  }

  // Fetch dimensions from database
  const imageDimensions = await getImagesByUrls(imageUrls);
  const dimensionMap: Record<string, { width: number; height: number }> = {};
  for (const img of imageDimensions) {
    dimensionMap[img.src] = { width: img.width, height: img.height };
  }

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
          <Markdown
            components={ {
              img: (props) => {
                const imgSrc = String(props.src || '');
                const imgAlt = String(props.alt || '');
                const dims = dimensionMap[imgSrc] || { width: 800, height: 600 };
                return (
                  <Image
                    src={ imgSrc }
                    alt={ imgAlt }
                    width={ dims.width }
                    height={ dims.height }
                    className="object-contain w-full"
                  />
                );
              }
            } }
          >
            { project.description }
          </Markdown>
        </div>
        <hr className="w-full h-[2px] border-none bg-muted/30"/>
      </div>
    </div>
  );
}
