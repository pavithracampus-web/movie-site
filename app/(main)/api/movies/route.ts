import { NextResponse } from 'next/server';
import {
  getTrending,
  getMoviesByGenre,
  getPopular,
  getTopRated,
  searchMovies,
  getMovieDetails,
  getNowPlaying,
} from '@/app/(main)/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const genreSlug = searchParams.get('genre');
  const query = searchParams.get('q');
  const id = searchParams.get('id');
  const page = searchParams.get('page') || '1';

  try {
    let data;

    switch (type) {
      case 'trending':
        data = await getTrending();
        break;

      case 'genre': {
        const { getGenreBySlug } = await import('@/app/(main)/lib/tmdb');
        const genre = getGenreBySlug(genreSlug || '');
        if (!genre) {
          return NextResponse.json({ error: 'Invalid genre' }, { status: 400 });
        }
        data = await getMoviesByGenre(genre.id, Number(page));
        break;
      }

      case 'popular':
        data = await getPopular(Number(page));
        break;

      case 'top-rated':
        data = await getTopRated(Number(page));
        break;

      case 'now-playing':
        data = await getNowPlaying(Number(page));
        break;

      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        data = await searchMovies(query, Number(page));
        return NextResponse.json(data);

      case 'detail':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        data = await getMovieDetails(Number(id));
        return NextResponse.json(data);

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
