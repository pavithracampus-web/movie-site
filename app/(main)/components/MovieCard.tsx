'use client';

import { useState } from 'react';
import type { Movie } from '@/app/(main)/types';
import { getPosterUrl, formatYear, formatRating } from '@/app/(main)/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);

  const poster = getPosterUrl(movie.poster_path);

  return (
    <button
      onClick={() => onClick(movie)}
      className="card-hover relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] rounded-md overflow-hidden cursor-pointer group text-left"
    >
      <div className="aspect-[2/3] rounded-md overflow-hidden bg-netflix-darker">
        {!imgError ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-netflix-darker p-4">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-netflix-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="text-xs text-netflix-gray">{movie.title}</span>
            </div>
          </div>
        )}
      </div>

      <div className="card-overlay">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-semibold text-sm mb-1 line-clamp-2">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-netflix-light">
            <span className="text-green-400 font-medium">{formatRating(movie.vote_average)}</span>
            <span className="w-1 h-1 bg-netflix-gray rounded-full" />
            <span>{formatYear(movie.release_date)}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-medium backdrop-blur-sm">
        HD
      </div>
    </button>
  );
}
