'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/app/(main)/components/Header';
import SearchModal from '@/app/(main)/components/SearchModal';
import VideoPlayerModal from '@/app/(main)/components/VideoPlayerModal';
import Footer from '@/app/(main)/components/Footer';
import type { Movie } from '@/app/(main)/types';
import { getPosterUrl, formatYear, formatRating } from '@/app/(main)/lib/utils';

export default function MoviesPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/movies?type=popular&page=${pageNum}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPage(1).then((data) => {
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetchPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loadingMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          fetchPage(nextPage).then((data) => {
            setMovies((prev) => [...prev, ...(data.results || [])]);
            setPage(nextPage);
            setLoadingMore(false);
          }).catch(() => setLoadingMore(false));
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, loading, loadingMore, fetchPage]);

  const handleMovieClick = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setPlayerOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerOpen(false);
    setSelectedMovie(null);
  }, []);

  return (
    <div className="min-h-screen bg-netflix-black">
      <Header onSearchClick={() => setSearchOpen(true)} />

      <div className="pt-20 md:pt-24 px-4 md:px-12 pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Movies</h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-netflix-darker rounded-md mb-2" />
                <div className="h-3 bg-netflix-darker rounded w-3/4 mb-1" />
                <div className="h-2 bg-netflix-darker rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <p className="text-netflix-gray text-center py-20">No movies found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="text-left group"
              >
                <div className="aspect-[2/3] rounded-md overflow-hidden bg-netflix-darker mb-2 relative">
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '';
                      target.classList.add('hidden');
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback w-full h-full flex items-center justify-center bg-netflix-darker';
                        fallback.innerHTML = `<span class="text-2xl text-netflix-gray">${movie.title.charAt(0)}</span>`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-white font-medium truncate">{movie.title}</p>
                <div className="flex items-center gap-2 text-xs text-netflix-light">
                  <span className="text-green-400">{formatRating(movie.vote_average)}</span>
                  <span>{formatYear(movie.release_date)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin" />
          </div>
        )}

        <div ref={sentinelRef} className="h-4" />
      </div>

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
