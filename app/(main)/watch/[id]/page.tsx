'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TVShowDetails, TVEpisode } from '@/app/(main)/types';
import Footer from '@/app/(main)/components/Footer';

const SERVERS = [
  { name: 'Server 1', label: 'VidSrc Pro' },
  { name: 'Server 2', label: 'VidSrc In' },
  { name: 'Server 3', label: 'VidSrc To' },
];

const SERVER_URLS = [
  (tmdbId: string, s: number, e: number) => `https://vidsrc.pro/embed/tv/${tmdbId}/${s}/${e}`,
  (tmdbId: string, s: number, e: number) => `https://vidsrc.in/embed/tv/${tmdbId}/${s}/${e}`,
  (tmdbId: string, s: number, e: number) => `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`,
];

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tvDetails, setTvDetails] = useState<TVShowDetails | null>(null);
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

  const id = params.id;

  useEffect(() => {
    const fetchTVDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/movies?type=tv-detail&id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch TV details');
        const data: TVShowDetails = await res.json();
        setTvDetails(data);
        const firstRealSeason = data.seasons?.find((s) => s.season_number > 0);
        if (firstRealSeason) {
          setSelectedSeason(firstRealSeason.season_number);
        }
      } catch {
        setError('Failed to load TV series details. It may not exist or the ID is invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchTVDetails();
  }, [id]);

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

  const handleEpisodeClick = useCallback((episodeNum: number) => {
    setSelectedEpisode(episodeNum);
    setIframeError(false);
    setPlayerKey((prev) => prev + 1);
  }, []);

  const handleServerChange = useCallback((index: number) => {
    if (index === activeServer) return;
    setActiveServer(index);
    setIframeError(false);
    setIframeLoading(true);
    setPlayerKey((prev) => prev + 1);
  }, [activeServer]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
    setIframeError(false);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
  }, []);

  const onIframeError = useCallback(() => {
    setIframeLoading(false);
    setIframeError(true);
    setActiveServer((prev) => {
      const next = prev + 1;
      if (next < SERVERS.length) {
        setPlayerKey((pk) => pk + 1);
        return next;
      }
      return prev;
    });
  }, []);

  const embedUrl = selectedEpisode
    ? SERVER_URLS[activeServer](id, selectedSeason, selectedEpisode)
    : null;

  useEffect(() => {
    if (!embedUrl) return;
    setIframeLoading(true);
    setIframeError(false);
    fallbackTimer.current = setTimeout(() => {
      if (fallbackTimer.current) {
        onIframeError();
      }
    }, 15000);
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin" />
          <p className="text-sm text-netflix-gray">Loading series...</p>
        </div>
      </div>
    );
  }

  if (error || !tvDetails) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center px-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-netflix-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-netflix-gray text-lg mb-2">Series not found</p>
          <p className="text-sm text-netflix-gray/60 mb-6">{error || 'Unable to load this TV series.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-netflix-red text-white font-medium px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-netflix-black/95 shadow-lg">
        <div className="flex items-center justify-between px-4 md:px-12 h-16">
          <div className="flex items-center gap-4">
            <Link href="/series">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white hover:text-netflix-light transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <Link href="/">
              <h1 className="text-netflix-red text-2xl font-bold tracking-tight">FLARE</h1>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/series"
              className="text-sm text-netflix-light hover:text-white transition-colors"
            >
              Series
            </Link>
            <Link
              href="/movies"
              className="text-sm text-netflix-light hover:text-white transition-colors"
            >
              Movies
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row pt-16">
        {/* Left Column - Player + Info */}
        <div className="w-full lg:w-[70%]">
          {/* Player */}
          <div className="relative w-full aspect-video bg-black">
            {embedUrl ? (
              <>
                {iframeLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin" />
                      <p className="text-sm text-netflix-gray">Loading {SERVERS[activeServer].name}...</p>
                    </div>
                  </div>
                )}
                {iframeError && !iframeLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-netflix-darker">
                    <div className="text-center px-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-netflix-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-netflix-gray mb-1">{SERVERS[activeServer].name} failed</p>
                      <p className="text-xs text-netflix-gray/60">
                        {activeServer < SERVERS.length - 1
                          ? 'Falling back to next server...'
                          : 'All servers failed. Try again later.'}
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
              <div className="absolute inset-0 flex items-center justify-center bg-netflix-darker">
                <div className="text-center px-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-netflix-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-netflix-gray text-lg mb-2">Select an Episode</p>
                  <p className="text-sm text-netflix-gray/60">
                    Choose a season and episode from the sidebar to start watching.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Server Selector */}
          <div className="flex items-center gap-2 px-4 md:px-6 py-3 bg-netflix-darker border-b border-white/10 flex-wrap">
            <span className="text-xs text-netflix-gray uppercase tracking-wider font-semibold mr-1">
              Server
            </span>
            {SERVERS.map((server, i) => (
              <button
                key={i}
                onClick={() => handleServerChange(i)}
                disabled={!selectedEpisode}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  i === activeServer
                    ? 'bg-netflix-red text-white shadow-sm'
                    : 'bg-white/10 text-netflix-light hover:bg-white/20 hover:text-white'
                } ${!selectedEpisode ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {server.name}
              </button>
            ))}
            {selectedEpisode && iframeError && (
              <span className="text-xs text-yellow-400 ml-2">
                Auto-switching...
              </span>
            )}

            <div className="ml-auto">
              <a
                href={selectedEpisode ? `https://vidsrc.in/download/tv/${id}/${selectedSeason}/${selectedEpisode}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  selectedEpisode
                    ? 'bg-amber-500/80 text-white hover:bg-amber-500 cursor-pointer'
                    : 'bg-white/5 text-netflix-gray cursor-not-allowed opacity-40'
                }`}
                onClick={selectedEpisode ? undefined : (e) => e.preventDefault()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </a>
            </div>
          </div>

          {/* Show Info */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {tvDetails.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-netflix-light">
              <span className="text-green-400 font-semibold">
                {tvDetails.vote_average?.toFixed(1)}
              </span>
              <span>{tvDetails.first_air_date?.split('-')[0]}</span>
              <span>{tvDetails.number_of_seasons} Season{tvDetails.number_of_seasons !== 1 ? 's' : ''}</span>
              <span>{tvDetails.number_of_episodes} Episode{tvDetails.number_of_episodes !== 1 ? 's' : ''}</span>
            </div>
            {tvDetails.genres && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {tvDetails.genres.map((g) => (
                  <span
                    key={g.id}
                    className="text-xs bg-white/10 text-netflix-light px-2.5 py-0.5 rounded-full"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            {tvDetails.overview && (
              <p className="text-sm text-netflix-light mt-4 leading-relaxed max-w-3xl">
                {tvDetails.overview}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-[30%] lg:border-l border-white/10 bg-netflix-darker/50">
          <div className="sticky top-16">
            {/* Season Dropdown */}
            <div className="p-4 border-b border-white/10">
              <label className="text-xs text-netflix-gray uppercase tracking-wider font-semibold block mb-2">
                Season
              </label>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="w-full appearance-none bg-netflix-dark border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-netflix-red/50 transition-colors cursor-pointer"
                >
                  {tvDetails.seasons
                    ?.filter((s) => s.season_number > 0)
                    .map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-netflix-gray pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Episode List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
              {episodesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin" />
                </div>
              ) : episodes.length === 0 ? (
                <p className="text-sm text-netflix-gray text-center py-8 px-4">
                  No episodes available for this season.
                </p>
              ) : (
                <div className="p-2 space-y-1">
                  {episodes.map((ep) => {
                    const isActive = selectedEpisode === ep.episode_number;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => handleEpisodeClick(ep.episode_number)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-netflix-red/15 border border-netflix-red/40'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {/* Thumbnail / Number */}
                        <div
                          className={`w-10 h-10 rounded shrink-0 flex items-center justify-center text-sm font-bold ${
                            isActive
                              ? 'bg-netflix-red text-white'
                              : 'bg-netflix-dark text-netflix-light'
                          }`}
                        >
                          {isActive ? <PlayIcon /> : ep.episode_number}
                        </div>

                        {/* Episode Info */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              isActive ? 'text-white' : 'text-white/90'
                            }`}
                          >
                            {ep.episode_number}. {ep.name}
                          </p>
                          <p className="text-xs text-netflix-gray mt-0.5 line-clamp-2 leading-relaxed">
                            {ep.overview || 'No description available.'}
                          </p>
                          {ep.air_date && (
                            <p className="text-[11px] text-netflix-gray/60 mt-1">
                              {new Date(ep.air_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
