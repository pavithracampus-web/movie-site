'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/app/(main)/components/Header';
import Hero from '@/app/(main)/components/Hero';
import MovieRow from '@/app/(main)/components/MovieRow';
import SearchModal from '@/app/(main)/components/SearchModal';
import VideoPlayerModal from '@/app/(main)/components/VideoPlayerModal';
import Footer from '@/app/(main)/components/Footer';
import type { Movie } from '@/app/(main)/types';

type RowData = {
  title: string;
  type: string;
  genre?: string;
};

const ROWS: RowData[] = [
  { title: 'Trending Now', type: 'trending' },
  { title: 'Action', type: 'genre', genre: 'action' },
  { title: 'Science Fiction', type: 'genre', genre: 'sci-fi' },
  { title: 'Horror', type: 'genre', genre: 'horror' },
  { title: 'Comedy', type: 'genre', genre: 'comedy' },
  { title: 'Top Rated', type: 'top-rated' },
  { title: 'Now Playing', type: 'now-playing' },
];

async function fetchMovies(type: string, genre?: string): Promise<Movie[]> {
  const params = new URLSearchParams({ type });
  if (genre) params.set('genre', genre);

  const res = await fetch(`/api/movies?${params}`);
  if (!res.ok) throw new Error('Failed to fetch');

  const data = await res.json();
  return data.results || [];
}

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [rowData, setRowData] = useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const trending = await fetchMovies('trending');
        setHeroMovies(trending.slice(0, 5));
        setRowData(prev => ({ ...prev, trending }));
      } catch {
        setErrors(prev => ({ ...prev, trending: 'Failed' }));
      }

      for (const row of ROWS.slice(1)) {
        setLoading(prev => ({ ...prev, [row.title]: true }));
        try {
          const movies = await fetchMovies(row.type, row.genre);
          setRowData(prev => ({ ...prev, [row.title]: movies }));
        } catch {
          setErrors(prev => ({ ...prev, [row.title]: 'Failed to load' }));
        } finally {
          setLoading(prev => ({ ...prev, [row.title]: false }));
        }
      }

      setInitialLoading(false);
    };

    loadAll();
  }, []);

  const handlePlay = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setPlayerOpen(true);
  }, []);

  const handleMoreInfo = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setPlayerOpen(true);
  }, []);

  const handleMovieClick = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setPlayerOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerOpen(false);
    setSelectedMovie(null);
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin mx-auto mb-4" />
          <p className="text-netflix-gray text-sm">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Header onSearchClick={() => setSearchOpen(true)} />

      <main>
        <Hero
          movies={heroMovies}
          onPlay={handlePlay}
          onMoreInfo={handleMoreInfo}
        />

        <div className="relative z-30 -mt-20 space-y-6">
          {ROWS.map((row) => {
            const movies = rowData[row.title] || [];
            const isLoading = loading[row.title];
            const hasError = errors[row.title];

            if (!isLoading && movies.length === 0 && !hasError) return null;

            return (
              <MovieRow
                key={row.title}
                title={row.title}
                movies={movies}
                loading={isLoading}
                onMovieClick={handleMovieClick}
              />
            );
          })}
        </div>
      </main>

      <Footer />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onMovieClick={handleMovieClick}
      />

      <VideoPlayerModal
        movie={selectedMovie}
        isOpen={playerOpen}
        onClose={closePlayer}
      />
    </div>
  );
}
