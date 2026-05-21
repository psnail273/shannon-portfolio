'use client';

import HamburgerMenu from '../icons/hamburgerIcon';
import Link from 'next/link';

interface HeaderProps {
  onHamburgerMenuOpen: () => void;
  isAuthenticated?: boolean;
}

export default function Header({ onHamburgerMenuOpen, isAuthenticated = true }: HeaderProps) {
  return (
    <>
      <div className="flex flex-row justify-between px-8 py-12 items-center">
        <div></div>
        { isAuthenticated && (
          <button className='cursor-pointer' onClick={ onHamburgerMenuOpen }>
            <HamburgerMenu />
          </button>
        ) }
      </div>
    </>
  );
}
