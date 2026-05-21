import Link from 'next/link';
import Image from 'next/image';

export default function BackgroundCorner() {
  return (
    <div className="w-full flex justify-end">
      <Link href="/" className="inline-block relative w-[200px] 3xl:w-[300px] aspect-[323/365]">
        <Image
          src="/corner.png"
          alt="Corner"
          fill={ true }
          unoptimized
          sizes="(min-width: 1920px) 300px, 200px"
          priority
          className="object-contain"
        />
      </Link>
    </div>
  );
}
