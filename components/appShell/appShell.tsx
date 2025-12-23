'use client';

import { useState } from 'react';
import SideMenu from '@/components/sideMenu/sideMenu';
import Header from '@/components/header/header';

interface AppShellProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export default function AppShell({ children, isAuthenticated = true }: AppShellProps) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const handleHamburgerMenuOpen = () => setIsSideMenuOpen(true);
  const handleHamburgerMenuClose = () => setIsSideMenuOpen(false);

  return (
    <>
      { /* Backdrop */ }
      <div
        className={ `fixed inset-0 z-1 transition-colors duration-1000 ${ isSideMenuOpen ? 'bg-black/50' : 'bg-black/0 pointer-events-none' }` }
        onClick={ handleHamburgerMenuClose }
      />

      { /* Menu (should NOT shift) */ }
      <SideMenu
        isSideMenuOpen={ isSideMenuOpen }
        handleHamburgerMenuClose={ handleHamburgerMenuClose }
      />

      { /* Everything else (should shift) */ }
      <div
        className={ `transition-transform duration-1000 ease-in-out ${ isSideMenuOpen ? '-translate-x-[100px]' : 'translate-x-0' }` }
      >
        <Header onHamburgerMenuOpen={ handleHamburgerMenuOpen } isAuthenticated={ isAuthenticated } />
        { children }
      </div>
    </>
  );
}


