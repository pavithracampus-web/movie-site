'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onSearchClick: () => void;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function Header({ onSearchClick, activeNav, onNavChange }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-500 ${
        scrolled ? 'bg-netflix-black/95 shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-3 md:px-12 h-14 md:h-20">
        <div className="flex items-center gap-3 md:gap-8 min-w-0">
          <Link href="/" className="shrink-0">
            <h1 className="text-netflix-red text-2xl md:text-4xl font-bold tracking-tight select-none">
              FLARE
            </h1>
          </Link>
          <nav className="flex items-center gap-2 md:gap-5 overflow-x-auto scrollbar-none">
            <Link
              href="/"
              className={`whitespace-nowrap text-[11px] md:text-sm font-medium transition-colors hover:text-white ${
                isActive('/') && pathname === '/' ? 'text-white' : 'text-netflix-light'
              }`}
            >
              Home
            </Link>
            <Link
              href="/series"
              className={`whitespace-nowrap text-[11px] md:text-sm font-medium transition-colors hover:text-white ${
                isActive('/series') ? 'text-white' : 'text-netflix-light'
              }`}
            >
              Series
            </Link>
            <Link
              href="/movies"
              className={`whitespace-nowrap text-[11px] md:text-sm font-medium transition-colors hover:text-white ${
                isActive('/movies') ? 'text-white' : 'text-netflix-light'
              }`}
            >
              Movies
            </Link>
            <a
              href="#my-list"
              onClick={(e) => { e.preventDefault(); onNavChange?.('My List'); }}
              className={`whitespace-nowrap text-[11px] md:text-sm font-medium transition-colors hover:text-white ${
                activeNav === 'My List' ? 'text-white' : 'text-netflix-light'
              }`}
            >
              My List
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSearchClick}
            className="text-netflix-light hover:text-white transition-colors"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="h-8 w-8 rounded-full bg-netflix-red flex items-center justify-center text-sm font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
