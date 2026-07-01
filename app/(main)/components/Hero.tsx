'use client';

import { useState, useEffect } from 'react';
import type { Movie } from '@/app/(main)/types';
import { getBackdropUrl, formatYear, formatRating, truncate } from '@/app/(main)/lib/utils';

interface HeroProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
}

export default function Hero({ movies, onPlay, onMoreInfo }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const movie = movies[currentIndex] || movies[0];

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movie) return null;

  return (
    <section className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden">
      {movies.slice(0, 5).map((m, i) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${getBackdropUrl(m.backdrop_path)})` }}
          />
        </div>
      ))}

      <div className="hero-gradient absolute inset-0 z-10" />
      <div className="hero-gradient-left absolute inset-0 z-10" />

      <div
        className={`absolute bottom-0 left-0 right-0 z-20 px-4 md:px-12 pb-16 md:pb-24 transition-all duration-700 ${
          loaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="max-w-2xl">
          <p className="text-sm md:text-base text-netflix-light mb-2 flex items-center gap-2">
            <span className="text-green-500 font-semibold">
              {formatRating(movie.vote_average)}
            </span>
            <span className="w-1 h-1 bg-netflix-gray rounded-full" />
            <span>{formatYear(movie.release_date)}</span>
          </p>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
            {movie.title}
          </h2>

          <p className="text-sm md:text-base text-netflix-light max-w-lg mb-6 line-clamp-3 leading-relaxed">
            {truncate(movie.overview, 200)}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlay(movie)}
              className="flex items-center gap-2 bg-white text-black font-bold px-6 md:px-8 py-2.5 md:py-3 rounded text-lg hover:bg-white/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </button>
            <button
              onClick={() => onMoreInfo(movie)}
              className="flex items-center gap-2 bg-white/20 text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded text-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 md:right-12 z-20 flex gap-2">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
