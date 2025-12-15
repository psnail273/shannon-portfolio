'use client';

import HamburgerMenu from '../icons/hamburgerIcon';

export default function Header({ onHamburgerMenuOpen }: { onHamburgerMenuOpen: () => void }) {
  return (
    <>
      <div className="flex flex-row justify-between py-12 px-8 items-center">
        <div className="text-4xl font-bold  uppercase">Shannon</div>
        <button className='cursor-pointer' onClick={ onHamburgerMenuOpen }>
          <HamburgerMenu />
        </button>
      </div>
    </>
  );
}
