'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Movie } from '@/app/(main)/types';
import { getPosterUrl, formatYear, formatRating } from '@/app/(main)/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieClick: (movie: Movie) => void;
}

export default function SearchModal({ isOpen, onClose, onMovieClick }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const doFetch = useCallback(async (searchQuery: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `/api/movies?type=search&q=${encodeURIComponent(searchQuery)}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      if (!controller.signal.aborted) {
        setResults(data.results || []);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError('Search failed. Try again.');
      setResults([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      doFetch(query);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doFetch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    doFetch(query);
  }, [query, doFetch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  const showInitialHint = !query && !hasSearched;
  const showNoResults = !loading && !error && hasSearched && results.length === 0 && query;

  return (
    <div className="fixed inset-0 z-50" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 animate-slide-up">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-netflix-gray"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, shows, genres..."
              className="w-full bg-netflix-darker border-2 border-white/20 rounded-lg pl-12 pr-32 py-4 text-white text-lg placeholder-netflix-gray focus:outline-none focus:border-white/50 transition-colors"
            />
            {query && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs text-netflix-gray hidden sm:inline">
                  Press Enter to search
                </span>
                <button
                  type="submit"
                  className="bg-netflix-red text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-red-700 transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
                  className="text-netflix-gray hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 max-h-[65vh] overflow-y-auto">
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-netflix-darker rounded-md mb-2" />
                  <div className="h-3 bg-netflix-darker rounded w-3/4 mb-1" />
                  <div className="h-2 bg-netflix-darker rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-center text-netflix-gray py-8">{error}</p>}

          {showNoResults && (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-netflix-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-netflix-gray text-lg mb-1">No results found</p>
              <p className="text-sm text-netflix-gray/60">
                No movies match &quot;{query}&quot;. Try a different search term.
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-netflix-light">
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => { onMovieClick(movie); onClose(); }}
                    className="text-left group"
                  >
                    <div className="aspect-[2/3] rounded-md overflow-hidden bg-netflix-darker mb-2">
                      <img
                        src={getPosterUrl(movie.poster_path)}
                        alt={movie.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).classList.add('hidden');
                          const parent = (e.target as HTMLImageElement).parentElement;
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
            </>
          )}

          {showInitialHint && (
            <div className="text-center py-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-6 text-netflix-gray/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-netflix-gray text-lg mb-2">Find your next watch</p>
              <p className="text-sm text-netflix-gray/60 max-w-md mx-auto leading-relaxed">
                Search thousands of movies. Type a title above, then press Enter or click Search for full results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
