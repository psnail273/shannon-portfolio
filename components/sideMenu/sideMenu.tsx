'use client';

import { pages } from '@/lib/pages';
import XIcon from '../icons/xIcon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideMenu({ isSideMenuOpen, handleHamburgerMenuClose }: { isSideMenuOpen: boolean, handleHamburgerMenuClose: () => void }) {
  const pathname = usePathname();

  const normalizePath = (path: string) => (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path);

  return (
    <div
      className={ `fixed flex text-2xl flex-col right-0 top-0 bottom-0 w-full sm:w-[51%] lg:w-[39%] bg-surface z-2 transition-transform duration-1000 ease-in-out ${isSideMenuOpen ? 'translate-x-0' : 'translate-x-full'}` }
    >
      <div className='flex flex-row items-center justify-end min-h-[150px] pr-8'>
        <button className='cursor-pointer' onClick={ handleHamburgerMenuClose }>
          <XIcon />
        </button>
      </div>
      <ul className='flex flex-col gap-3 '>
        { pages.map((page) => (
          <Link
            href={ page.href }
            className='group relative'
            key={ page.name }
            onClick={ () => {
              // Keep menu open for external links (new tab) and for the current route.
              if (page.external) return;
              if (normalizePath(pathname) === normalizePath(page.href)) return;
              handleHamburgerMenuClose();
            } }
            target={ page.external ? '_blank' : undefined }
            rel={ page.external ? 'noopener noreferrer' : undefined }
          >
            <hr className='absolute left-0 w-0 group-hover:w-5 group-active:w-5 group-focus-visible:w-5 sm:group-hover:w-12 sm:group-active:w-12 sm:group-focus-visible:w-12 lg:group-hover:w-20 lg:group-active:w-20 lg:group-focus-visible:w-20 transistion-transform duration-400 delay-150 ease-in-out top-4 bg-accent h-1'/>
            <li className='group-hover:text-accent group-active:text-accent group-focus-visible:text-accent transition-colors duration-200 transition-ease-in-out px-8 sm:px-16 lg:px-24'>{ page.name }</li>
          </Link>
        )) }
      </ul>
      { /* <div className="fixed flex items-start bottom-0 left-0 right-0 h-20 px-8 sm:px-16 lg:px-24 bg-white">
        <input 
          type="text"
          placeholder="Search Keywords"
          className="py-[12px] text-lg w-full outline-none border-b-2 transition-colors duration-400 ease-in-out focus:border-[#b997ce]"
        />
      </div> */ }
    </div>
  );
}