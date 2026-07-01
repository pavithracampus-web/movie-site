'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  onSearchClick: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-500 ${
        scrolled ? 'bg-netflix-black/95 shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-12 h-16 md:h-20">
        <div className="flex items-center gap-8">
          <h1 className="text-netflix-red text-3xl md:text-4xl font-bold tracking-tight select-none">
            FLARE
          </h1>
          <nav className="hidden md:flex items-center gap-5">
            {['Home', 'Series', 'Movies', 'My List'].map((item) => (
              <a
                key={item}
                href="#"
                className={`text-sm font-medium transition-colors hover:text-white ${
                  item === 'Home' ? 'text-white' : 'text-netflix-light'
                }`}
              >
                {item}
              </a>
            ))}
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
