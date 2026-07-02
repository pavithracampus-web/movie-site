export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  media_type?: string;
  imdb_id?: string | null;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  videos: {
    results: {
      key: string;
      site: string;
      type: string;
      name: string;
    }[];
  };
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
}

export interface TVSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string | null;
  vote_average: number;
}

export interface TVShowDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TVSeason[];
  status: string;
  genres: { id: number; name: string }[];
  imdb_id?: string | null;
  media_type?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface SearchResult {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface VideoInfo {
  key: string;
  site: string;
  type: string;
}
