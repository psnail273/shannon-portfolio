'use client';

import HamburgerMenu from '../icons/hamburgerIcon';
import Link from 'next/link';

export default function Header({ onHamburgerMenuOpen }: { onHamburgerMenuOpen: () => void }) {
  return (
    <>
      <div className="flex flex-row justify-between py-12 px-8 items-center">
        <Link href="/" className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold  uppercase">Shannon Call Creative</Link>
        <button className='cursor-pointer' onClick={ onHamburgerMenuOpen }>
          <HamburgerMenu />
        </button>
      </div>
    </>
  );
}
