import { NextResponse } from 'next/server';
import {
  getTrending,
  getMoviesByGenre,
  getPopular,
  getTopRated,
  searchMovies,
  getMovieDetails,
  getNowPlaying,
  getTVShowDetails,
  getSeasonEpisodes,
  getTrendingTV,
  getPopularTV,
  getTopRatedTV,
  getAiringToday,
  searchMulti,
  normalizeTVResults,
} from '@/app/(main)/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const genreSlug = searchParams.get('genre');
  const query = searchParams.get('q');
  const id = searchParams.get('id');
  const page = searchParams.get('page') || '1';

  try {
    switch (type) {
      case 'trending': {
        const data = await getTrending(Number(page));
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'genre': {
        const { getGenreBySlug } = await import('@/app/(main)/lib/tmdb');
        const genre = getGenreBySlug(genreSlug || '');
        if (!genre) {
          return NextResponse.json({ error: 'Invalid genre' }, { status: 400 });
        }
        const data = await getMoviesByGenre(genre.id, Number(page));
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'popular': {
        const data = await getPopular(Number(page));
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'top-rated': {
        const data = await getTopRated(Number(page));
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'now-playing': {
        const data = await getNowPlaying(Number(page));
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        return NextResponse.json(await searchMovies(query, Number(page)));

      case 'search-multi':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        const multiData = await searchMulti(query, Number(page));
        const filtered = (multiData.results || []).filter(
          (r: Record<string, unknown>) => r.media_type === 'movie' || r.media_type === 'tv'
        );
        multiData.results = normalizeTVResults(filtered);
        return NextResponse.json(multiData);

      case 'detail':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        return NextResponse.json(await getMovieDetails(Number(id)));

      case 'tv-detail':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        return NextResponse.json(await getTVShowDetails(Number(id)));

      case 'tv-season':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        const seasonNum = searchParams.get('season');
        if (!seasonNum) {
          return NextResponse.json({ error: 'Season parameter required' }, { status: 400 });
        }
        return NextResponse.json(await getSeasonEpisodes(Number(id), Number(seasonNum)));

      case 'tv-trending': {
        const data = await getTrendingTV(Number(page));
        data.results = normalizeTVResults(data.results || []);
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'tv-popular': {
        const data = await getPopularTV(Number(page));
        data.results = normalizeTVResults(data.results || []);
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'tv-top-rated': {
        const data = await getTopRatedTV(Number(page));
        data.results = normalizeTVResults(data.results || []);
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      case 'tv-airing-today': {
        const data = await getAiringToday(Number(page));
        data.results = normalizeTVResults(data.results || []);
        return NextResponse.json({ results: data.results || [], total_pages: data.total_pages || 1 });
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
