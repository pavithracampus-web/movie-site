'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/(main)/components/Header';
import Hero from '@/app/(main)/components/Hero';
import MovieRow from '@/app/(main)/components/MovieRow';
import SearchModal from '@/app/(main)/components/SearchModal';
import Footer from '@/app/(main)/components/Footer';
import type { Movie } from '@/app/(main)/types';

type RowData = {
  title: string;
  type: string;
  genre?: string;
  category: 'movie' | 'series' | 'both';
};

const ROWS: RowData[] = [
  { title: 'Trending Now', type: 'trending', category: 'both' },
  { title: 'Action', type: 'genre', genre: 'action', category: 'movie' },
  { title: 'Science Fiction', type: 'genre', genre: 'sci-fi', category: 'movie' },
  { title: 'Horror', type: 'genre', genre: 'horror', category: 'movie' },
  { title: 'Comedy', type: 'genre', genre: 'comedy', category: 'movie' },
  { title: 'Top Rated', type: 'top-rated', category: 'both' },
  { title: 'Now Playing', type: 'now-playing', category: 'both' },
  { title: 'Trending TV Series', type: 'tv-trending', category: 'series' },
  { title: 'Popular TV Series', type: 'tv-popular', category: 'series' },
  { title: 'Top Rated TV', type: 'tv-top-rated', category: 'series' },
  { title: 'Airing Today', type: 'tv-airing-today', category: 'series' },
];

async function fetchMoviesPage(type: string, page = 1, genre?: string): Promise<{ results: Movie[]; total_pages: number }> {
  const params = new URLSearchParams({ type, page: String(page) });
  if (genre) params.set('genre', genre);

  const res = await fetch(`/api/movies?${params}`);
  if (!res.ok) throw new Error('Failed to fetch');

  return res.json();
}

function getFilteredRows(activeNav: string): RowData[] {
  if (activeNav === 'Home') return ROWS;
  if (activeNav === 'My List') return [];
  const category = activeNav === 'Movies' ? 'movie' : 'series';
  return ROWS.filter((r) => r.category === category || r.category === 'both');
}

export default function HomePage() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [rowData, setRowData] = useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('Home');
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});
  const [rowHasMore, setRowHasMore] = useState<Record<string, boolean>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const filteredRows = getFilteredRows(activeNav);

  useEffect(() => {
    const loadAll = async () => {
      const newPages: Record<string, number> = {};
      const newHasMore: Record<string, boolean> = {};

      try {
        const trendingRes = await fetchMoviesPage('trending');
        setHeroMovies(trendingRes.results.slice(0, 5));
        setRowData(prev => ({ ...prev, 'Trending Now': trendingRes.results }));
        newPages['Trending Now'] = 1;
        newHasMore['Trending Now'] = trendingRes.total_pages > 1;
      } catch {
        setErrors(prev => ({ ...prev, 'Trending Now': 'Failed' }));
      }

      for (const row of ROWS.slice(1)) {
        setLoading(prev => ({ ...prev, [row.title]: true }));
        try {
          const res = await fetchMoviesPage(row.type, 1, row.genre);
          setRowData(prev => ({ ...prev, [row.title]: res.results }));
          newPages[row.title] = 1;
          newHasMore[row.title] = res.total_pages > 1;
        } catch {
          setErrors(prev => ({ ...prev, [row.title]: 'Failed to load' }));
        } finally {
          setLoading(prev => ({ ...prev, [row.title]: false }));
        }
      }

      setCurrentPages(newPages);
      setRowHasMore(newHasMore);
      setInitialLoading(false);
    };

    loadAll();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          const rowsWithMore = filteredRows.filter((r) => rowHasMore[r.title]);
          if (rowsWithMore.length === 0) return;

          setLoadingMore(true);

          const loadNextPages = async () => {
            const newPages = { ...currentPages };
            const updates: Record<string, Movie[]> = {};

            for (const row of rowsWithMore) {
              const nextPage = (currentPages[row.title] || 1) + 1;
              try {
                const res = await fetchMoviesPage(row.type, nextPage, row.genre);
                updates[row.title] = res.results;
                newPages[row.title] = nextPage;
                if (nextPage >= res.total_pages) {
                  setRowHasMore(prev => ({ ...prev, [row.title]: false }));
                }
              } catch {
                setRowHasMore(prev => ({ ...prev, [row.title]: false }));
              }
            }

            setRowData(prev => {
              const merged = { ...prev };
              for (const [title, results] of Object.entries(updates)) {
                merged[title] = [...(prev[title] || []), ...results];
              }
              return merged;
            });
            setCurrentPages(newPages);
            setLoadingMore(false);
          };

          loadNextPages();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredRows, rowHasMore, currentPages, loadingMore]);

  const navigateToWatch = useCallback((movie: Movie) => {
    const type = movie.media_type === 'tv' ? 'tv' : 'movie';
    router.push(`/watch/${movie.id}?type=${type}`);
  }, [router]);

  const handlePlay = useCallback((movie: Movie) => {
    navigateToWatch(movie);
  }, [navigateToWatch]);

  const handleMoreInfo = useCallback((movie: Movie) => {
    navigateToWatch(movie);
  }, [navigateToWatch]);

  const handleMovieClick = useCallback((movie: Movie) => {
    navigateToWatch(movie);
  }, [navigateToWatch]);

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
      <Header onSearchClick={() => setSearchOpen(true)} activeNav={activeNav} onNavChange={setActiveNav} />

      <main>
        <Hero
          movies={heroMovies}
          onPlay={handlePlay}
          onMoreInfo={handleMoreInfo}
        />

        <div className="relative z-30 -mt-20 space-y-6">
          {activeNav === 'My List' ? (
            <div className="flex flex-col items-center justify-center pt-32 pb-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-netflix-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-netflix-gray text-lg">Your list is empty</p>
              <p className="text-netflix-gray/60 text-sm mt-1">Movies and series you add will appear here.</p>
            </div>
          ) : (
            filteredRows.map((row) => {
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
            })
          )}
        </div>

        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin" />
          </div>
        )}

        <div ref={sentinelRef} className="h-4" />
      </main>

      <Footer />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onMovieClick={handleMovieClick}
      />

    </div>
  );
}
