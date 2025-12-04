'use client';

import SideMenu from '../sideMenu/sideMenu';
import HamburgerMenu from '../icons/hamburgerIcon';
import { useState } from 'react';

export default function Header() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const handleHamburgerMenuOpen = () => {
    setIsSideMenuOpen(true);
  };

  const handleHamburgerMenuClose = () => {
    setIsSideMenuOpen(false);
  };

  return (
    <>
      <div
        className={ `fixed inset-0 z-1 transition-colors duration-1000 ${isSideMenuOpen ? 'bg-black/50' : 'bg-black/0 pointer-events-none'}` }
        onClick={ handleHamburgerMenuClose }
      ></div>
      <SideMenu isSideMenuOpen={ isSideMenuOpen } handleHamburgerMenuClose={ handleHamburgerMenuClose } />
      <div className="flex flex-row justify-between py-[55px] px-[18.4px] items-center">
        <div className="text-4xl font-bold  uppercase">Shannon</div>
        <button className='cursor-pointer' onClick={ handleHamburgerMenuOpen }>
          <HamburgerMenu />
        </button>
      </div>
    </>
  );
}
