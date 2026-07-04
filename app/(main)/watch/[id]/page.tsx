'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { MovieDetails, TVShowDetails, TVEpisode } from '@/app/(main)/types';
import Footer from '@/app/(main)/components/Footer';

const SERVERS = [
  { name: 'Server 1', label: 'VidSrc To' },
  { name: 'Server 2', label: 'Embed.su' },
  { name: 'Server 3', label: 'Cinezo' },
];

const AUTO_TIMEOUT = 8000;

const TV_SERVER_URLS = [
  (tmdbId: string, s: number, e: number) => `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`,
  (tmdbId: string, s: number, e: number) => `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`,
  (tmdbId: string, s: number, e: number) => `https://player.cinezo.live/embed/tv/${tmdbId}/${s}/${e}`,
];

const MOVIE_SERVER_URLS = [
  (tmdbId: string) => `https://vidsrc.to/embed/movie/${tmdbId}`,
  (tmdbId: string) => `https://embed.su/embed/movie/${tmdbId}`,
  (tmdbId: string) => `https://player.cinezo.live/embed/movie/${tmdbId}`,
];

function PlayIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 001.302-4.665c0-1.194-.232-2.333-.654-3.375zM3.375 7.5h2.25m0 0h2.25m-2.25 0V3m0 4.5v4.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  );
}

function ActionButtons({
  liked,
  onLike,
  onShare,
  copied,
  downloadUrl,
  canDownload,
}: {
  liked: 'up' | 'down' | null;
  onLike: (v: 'up' | 'down' | null) => void;
  onShare: () => void;
  copied: boolean;
  downloadUrl: string;
  canDownload: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex items-center bg-white/10 rounded-full overflow-hidden">
        <button
          onClick={() => onLike(liked === 'up' ? null : 'up')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 active:bg-white/20 ${liked === 'up' ? 'text-white' : 'text-[#aaaaaa]'}`}
          aria-label="Like"
        >
          <ThumbsUpIcon />
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button
          onClick={() => onLike(liked === 'down' ? null : 'down')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 active:bg-white/20 ${liked === 'down' ? 'text-white' : 'text-[#aaaaaa]'}`}
          aria-label="Dislike"
        >
          <ThumbsDownIcon />
        </button>
      </div>
      <button
        onClick={onShare}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium text-[#aaaaaa] bg-white/10 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors"
        aria-label={copied ? 'Copied' : 'Share'}
      >
        <ShareIcon />
      </button>
      {canDownload && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium rounded-full bg-white/10 text-[#aaaaaa] hover:bg-white/20 active:bg-white/30 transition-colors"
          aria-label="Download"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mediaType = searchParams.get('type') || 'tv';

  const [tvDetails, setTvDetails] = useState<TVShowDetails | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [playerKey, setPlayerKey] = useState(0);
  const [activeServer, setActiveServer] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout>>();
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDesc, setShowDesc] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<'up' | 'down' | null>(null);

  const id = params.id;
  const isTV = mediaType !== 'movie';

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        if (isTV) {
          const res = await fetch(`/api/movies?type=tv-detail&id=${id}`);
          if (!res.ok) throw new Error('Failed to fetch TV details');
          const data: TVShowDetails = await res.json();
          setTvDetails(data);
          const firstRealSeason = data.seasons?.find((s) => s.season_number > 0);
          if (firstRealSeason) {
            setSelectedSeason(firstRealSeason.season_number);
          }
        } else {
          const res = await fetch(`/api/movies?type=detail&id=${id}`);
          if (!res.ok) throw new Error('Failed to fetch movie details');
          const data: MovieDetails = await res.json();
          setMovieDetails(data);
        }
      } catch {
        setError(isTV
          ? 'Failed to load TV series details. It may not exist or the ID is invalid.'
          : 'Failed to load movie details. It may not exist or the ID is invalid.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isTV]);

  useEffect(() => {
    if (!tvDetails) return;

    const fetchEpisodes = async () => {
      setEpisodesLoading(true);
      setSelectedEpisode(null);
      try {
        const res = await fetch(
          `/api/movies?type=tv-season&id=${id}&season=${selectedSeason}`
        );
        if (!res.ok) throw new Error('Failed to fetch episodes');
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch {
        setEpisodes([]);
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [id, tvDetails, selectedSeason]);

  const embedUrl = isTV
    ? (selectedEpisode ? TV_SERVER_URLS[activeServer](id, selectedSeason, selectedEpisode) : null)
    : (movieDetails ? MOVIE_SERVER_URLS[activeServer](id) : null);

  const nextServer = useCallback(() => {
    setActiveServer((prev) => {
      const next = prev + 1;
      if (next < SERVERS.length) {
        setIframeLoading(true);
        setIframeError(false);
        setPlayerKey((pk) => pk + 1);
        return next;
      }
      return prev;
    });
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
    setIframeError(false);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
  }, []);

  const onIframeError = useCallback(() => {
    setIframeLoading(false);
    setIframeError(true);
    nextServer();
  }, [nextServer]);

  useEffect(() => {
    if (!embedUrl) return;
    setIframeLoading(true);
    setIframeError(false);
    fallbackTimer.current = setTimeout(() => {
      if (fallbackTimer.current) {
        setIframeLoading(false);
        setIframeError(true);
        nextServer();
      }
    }, AUTO_TIMEOUT);
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerKey]);

  const handleServerChange = useCallback((index: number) => {
    if (index === activeServer) return;
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    setActiveServer(index);
    setIframeError(false);
    setIframeLoading(true);
    setPlayerKey((prev) => prev + 1);
  }, [activeServer]);

  const handleEpisodeClick = useCallback((episodeNum: number) => {
    setSelectedEpisode(episodeNum);
    setActiveServer(0);
    setIframeError(false);
    setIframeLoading(true);
    setPlayerKey((prev) => prev + 1);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    const title = tvDetails?.name || movieDetails?.title || 'Watch';
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentEpisode = episodes?.find((ep) => ep.episode_number === selectedEpisode);
  const isLastServer = activeServer >= SERVERS.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-[#aaaaaa]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || (!tvDetails && !movieDetails)) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center px-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#aaaaaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[#aaaaaa] text-lg mb-2">{isTV ? 'Series not found' : 'Movie not found'}</p>
          <p className="text-sm text-[#aaaaaa]/60 mb-6">{error || 'Unable to load.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-white text-black font-medium px-6 py-2 rounded-full hover:bg-white/90 transition-colors text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const title = movieDetails?.title || tvDetails?.name || '';
  const year = movieDetails?.release_date?.split('-')[0] || tvDetails?.first_air_date?.split('-')[0] || '';
  const rating = movieDetails?.vote_average?.toFixed(1) || tvDetails?.vote_average?.toFixed(1) || '';
  const genres = movieDetails?.genres || tvDetails?.genres || [];
  const overview = movieDetails?.overview || tvDetails?.overview || '';

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0f0f0f]/95">
        <div className="flex items-center justify-between px-3 sm:px-8 h-12 sm:h-14">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => router.back()} className="text-white hover:text-white/70 transition-colors p-1 -ml-1" aria-label="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Link href="/">
              <h1 className="text-[#ff0000] text-lg sm:text-xl font-bold tracking-tight">FLARE</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/series" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">Series</Link>
            <Link href="/movies" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">Movies</Link>
          </div>
        </div>
      </header>

      <div className="pt-12 sm:pt-14">
        <div className="bg-black">
          <div className="max-w-[1280px] mx-auto relative aspect-video">
            {embedUrl ? (
              <>
                {iframeLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <p className="text-xs sm:text-sm text-[#aaaaaa]">
                        {iframeError ? `Trying ${SERVERS[activeServer].label}...` : `Loading ${SERVERS[activeServer].label}...`}
                      </p>
                      {iframeError && !isLastServer && (
                        <p className="text-[10px] sm:text-xs text-yellow-400/80">Auto-selecting best server...</p>
                      )}
                    </div>
                  </div>
                )}
                {iframeError && !iframeLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                    <div className="text-center px-4 sm:px-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-[#aaaaaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm sm:text-base text-[#aaaaaa] mb-1">{SERVERS[activeServer].label} failed</p>
                      <p className="text-[10px] sm:text-xs text-[#aaaaaa]/60">
                        {isLastServer
                          ? 'All servers failed. Try again later.'
                          : 'Auto-switching to next server...'}
                      </p>
                    </div>
                  </div>
                )}
                <iframe
                  key={playerKey}
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  onLoad={handleIframeLoad}
                  onError={onIframeError}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center px-4 sm:px-6">
                  <PlayIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-[#aaaaaa]" />
                  <p className="text-base sm:text-lg text-[#aaaaaa] mb-1 sm:mb-2">Select an Episode</p>
                  <p className="text-xs sm:text-sm text-[#aaaaaa]/60">
                    Choose a season and episode below to start watching.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-3 sm:px-8 py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
            {title}
            {isTV && selectedEpisode && currentEpisode && (
              <span className="text-white/70 font-normal block sm:inline text-sm sm:text-base mt-0.5 sm:mt-0">
                S{selectedSeason}:E{selectedEpisode} — {currentEpisode.name}
              </span>
            )}
          </h1>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 text-xs sm:text-sm text-[#aaaaaa] flex-wrap">
            {rating && <span className="text-white font-medium">{rating}</span>}
            {rating && year && <span className="text-[#aaaaaa]">•</span>}
            {year && <span>{year}</span>}
{movieDetails?.runtime ? (
  <><span className="text-[#aaaaaa]">•</span><span>{Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m</span></>
) : null}
            {isTV && tvDetails && (
              <>
                <span className="text-[#aaaaaa] hidden sm:inline">•</span>
                <span className="hidden sm:inline">{tvDetails.number_of_seasons} Season{tvDetails.number_of_seasons !== 1 ? 's' : ''}</span>
                <span className="text-[#aaaaaa] hidden sm:inline">•</span>
                <span className="hidden sm:inline">{tvDetails.number_of_episodes} Episode{tvDetails.number_of_episodes !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
            <ActionButtons
              liked={liked}
              onLike={setLiked}
              onShare={handleShare}
              copied={copied}
              downloadUrl={
                movieDetails
                  ? `https://vidsrc.to/download/movie/${id}`
                  : `https://vidsrc.to/download/tv/${id}/${selectedSeason}/${selectedEpisode}`
              }
              canDownload={!isTV || !!selectedEpisode}
            />
            <div className="flex items-center gap-1 ml-auto">
              {SERVERS.map((server, i) => (
                <button
                  key={i}
                  onClick={() => handleServerChange(i)}
                  disabled={isTV && !selectedEpisode}
                  className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-full transition-colors active:scale-95 ${
                    i === activeServer
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-[#aaaaaa] hover:bg-white/20 hover:text-white'
                  } ${isTV && !selectedEpisode ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={server.label}
                >
                  {server.name}
                </button>
              ))}
              {iframeLoading && iframeError && !isLastServer && (
                <span className="text-[10px] sm:text-xs text-yellow-400 ml-1 whitespace-nowrap">Auto...</span>
              )}
            </div>
          </div>

          {overview && (
            <div
              className={`mt-2 sm:mt-3 bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 cursor-pointer transition-colors hover:bg-white/10 ${showDesc ? '' : 'max-h-[60px] sm:max-h-[72px] overflow-hidden'}`}
              onClick={() => setShowDesc(!showDesc)}
            >
              {genres.length > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                  {genres.map((g) => (
                    <span key={g.id} className="text-[10px] sm:text-xs bg-white/10 text-[#aaaaaa] px-1.5 sm:px-2 py-0.5 rounded-full">{g.name}</span>
                  ))}
                </div>
              )}
              <p className="text-xs sm:text-sm text-[#aaaaaa] leading-relaxed">{overview}</p>
              <button className="text-[10px] sm:text-sm text-white/70 mt-0.5 sm:mt-1 hover:text-white">
                {showDesc ? 'Show less' : '... more'}
              </button>
            </div>
          )}

          {isTV && tvDetails && (
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <label className="text-xs sm:text-sm font-medium text-white">Season</label>
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-full pl-3 pr-7 sm:pl-4 sm:pr-8 py-1.5 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                  >
                    {tvDetails.seasons?.filter((s) => s.season_number > 0).map((s) => (
                      <option key={s.id} value={s.season_number} className="bg-[#1a1a1a] text-white">{s.name}</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-[#aaaaaa] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-xs text-[#aaaaaa]">{episodes.length} ep</span>
              </div>
              {episodesLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12"><div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
              ) : episodes.length === 0 ? (
                <p className="text-xs sm:text-sm text-[#aaaaaa] text-center py-6 sm:py-8">No episodes available for this season.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2">
                  {episodes.map((ep) => {
                    const isActive = selectedEpisode === ep.episode_number;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => handleEpisodeClick(ep.episode_number)}
                        className={`group relative flex flex-col rounded-lg sm:rounded-xl overflow-hidden text-left transition-all active:scale-[0.98] ${
                          isActive ? 'ring-2 ring-white' : 'hover:ring-1 hover:ring-white/30'
                        }`}
                      >
                        <div className={`aspect-video flex items-center justify-center text-sm font-bold ${isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'}`}>
                          {isActive ? <PlayIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" /> : <span className="text-base sm:text-lg font-bold text-white/60">{ep.episode_number}</span>}
                        </div>
                        <div className="p-1.5 sm:p-2 bg-[#1a1a1a] min-h-[44px] sm:min-h-[60px]">
                          <p className={`text-[10px] sm:text-xs font-medium truncate ${isActive ? 'text-white' : 'text-white/80'}`}>{ep.episode_number}. {ep.name}</p>
                          {ep.air_date && (
                            <p className="text-[9px] sm:text-[10px] text-[#aaaaaa]/60 mt-0.5 sm:mt-1">
                              {new Date(ep.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <div className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 bg-white text-black text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded">Playing</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
