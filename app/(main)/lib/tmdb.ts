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

export async function getTrending() {
  const data = await tmdbFetch('/trending/movie/week');
  return data.results || [];
}

export async function getMoviesByGenre(genreId: number, page = 1) {
  const data = await tmdbFetch('/discover/movie', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page: String(page),
  });
  return data.results || [];
}

export async function getPopular(page = 1) {
  const data = await tmdbFetch('/movie/popular', { page: String(page) });
  return data.results || [];
}

export async function getTopRated(page = 1) {
  const data = await tmdbFetch('/movie/top_rated', { page: String(page) });
  return data.results || [];
}

export async function searchMovies(query: string, page = 1) {
  const data = await tmdbFetch('/search/movie', {
    query,
    page: String(page),
  });
  return data;
}

export async function getMovieDetails(movieId: number) {
  const data = await tmdbFetch(`/movie/${movieId}`, {
    append_to_response: 'videos,credits',
  });
  return data;
}

export async function getNowPlaying(page = 1) {
  const data = await tmdbFetch('/movie/now_playing', { page: String(page) });
  return data.results || [];
}
