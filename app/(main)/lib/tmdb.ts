const TMDB_BASE = 'https://api.themoviedb.org/3';

const GENRES = [
  { id: 28, name: 'Action', slug: 'action' },
  { id: 878, name: 'Science Fiction', slug: 'sci-fi' },
  { id: 27, name: 'Horror', slug: 'horror' },
  { id: 35, name: 'Comedy', slug: 'comedy' },
  { id: 10749, name: 'Romance', slug: 'romance' },
  { id: 53, name: 'Thriller', slug: 'thriller' },
  { id: 16, name: 'Animation', slug: 'animation' },
] as const;

export type GenreSlug = typeof GENRES[number]['slug'];

export function getGenres() {
  return GENRES;
}

export function getGenreBySlug(slug: string) {
  return GENRES.find(g => g.slug === slug);
}

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY environment variable is not set');
  }

  const queryParams = new URLSearchParams({
    language: 'en-US',
    ...params,
    api_key: apiKey,
  });

  const url = `${TMDB_BASE}${endpoint}?${queryParams}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getTrending(page = 1) {
  return tmdbFetch('/trending/movie/week', { page: String(page) });
}

export async function getMoviesByGenre(genreId: number, page = 1) {
  return tmdbFetch('/discover/movie', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page: String(page),
  });
}

export async function getPopular(page = 1) {
  return tmdbFetch('/movie/popular', { page: String(page) });
}

export async function getTopRated(page = 1) {
  return tmdbFetch('/movie/top_rated', { page: String(page) });
}

export async function searchMovies(query: string, page = 1) {
  return tmdbFetch('/search/movie', { query, page: String(page) });
}

export async function getMovieDetails(movieId: number) {
  return tmdbFetch(`/movie/${movieId}`, {
    append_to_response: 'videos,credits',
  });
}

export async function getNowPlaying(page = 1) {
  return tmdbFetch('/movie/now_playing', { page: String(page) });
}

export async function getTVShowDetails(tvId: number) {
  return tmdbFetch(`/tv/${tvId}`, {
    append_to_response: 'videos,credits',
  });
}

export async function getSeasonEpisodes(tvId: number, seasonNumber: number) {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getTrendingTV(page = 1) {
  return tmdbFetch('/trending/tv/week', { page: String(page) });
}

export async function getPopularTV(page = 1) {
  return tmdbFetch('/tv/popular', { page: String(page) });
}

export async function getTopRatedTV(page = 1) {
  return tmdbFetch('/tv/top_rated', { page: String(page) });
}

export async function getAiringToday(page = 1) {
  return tmdbFetch('/tv/airing_today', { page: String(page) });
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch('/search/multi', { query, page: String(page) });
}

function normalizeTVResult(item: Record<string, unknown>) {
  return {
    ...item,
    title: (item as any).name || (item as any).title,
    release_date: (item as any).first_air_date || (item as any).release_date || '',
    media_type: (item as any).media_type || 'tv',
  };
}

export function normalizeTVResults(results: Record<string, unknown>[]) {
  return results.map(normalizeTVResult);
}
