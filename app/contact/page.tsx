import Image from 'next/image';
import Link from 'next/link';
import PageWithImage from '@/components/page-with-image/page-with-image';

export default function Contact() {
  return (
    <PageWithImage imageSrcs={ ['/shannon_contact.png'] }>
      <div className="flex flex-col gap-6 py-2 sm:py-4 md:py-8 xl:py-12 px-8">
        <div className="text-5xl  font-playfair">Let&apos;s Connect!</div>
        <div className="prose dark:prose-invert max-w-none">Want to collaborate on a potential project or grab a coffee and talk about design? Here&apos;s how to reach me.</div>
        <div className="prose dark:prose-invert max-w-none">
          <div className="flex flex-row gap-2">
            <div className="font-bold">Email:</div>
            <Link
              href="mailto:shannon@shannoncall.com"
              className="underline underline-offset-4 hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              shannon@shannoncall.com
            </Link>
          </div>
          <div className="flex flex-row gap-2">
            <div className="font-bold">Mobile:</div>
            <Link
              href="tel:+18126050700"
              className="underline underline-offset-4 hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              (812) 605-0700
            </Link> 
          </div>
          <div className="flex flex-row gap-2">
            <div className="font-bold">Instagram:</div>
            <div>@scall3</div>
          </div>
        </div>
        <Image src="/shannon_contact.png" alt="Shannon" width={ 500 } height={ 501 } style={ { objectFit: 'contain' } }/>
      </div>
    </PageWithImage>
  );
}
