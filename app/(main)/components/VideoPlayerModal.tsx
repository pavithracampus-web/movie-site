'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, TVShowDetails, TVSeason, TVEpisode } from '@/app/(main)/types';
import { STREAM_SOURCES, TORRENT_INDEX } from '@/app/(main)/lib/utils';

interface TorrentResult {
  id: string;
  name: string;
  magnet: string;
  infoHash: string;
  seeders: number;
  leechers: number;
  size: string;
  sizeBytes: number;
  added: string;
  status: string;
}

interface VideoPlayerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

function RequestForm({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const webhook = process.env.NEXT_PUBLIC_REQUEST_WEBHOOK;

    if (webhook) {
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: movie.title,
          imdb_id: (movie as any).imdb_id || null,
          message: message || `User requested: ${movie.title}`,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-netflix-dark border border-white/10 rounded-lg p-6 w-full max-w-md mx-4 animate-scale-in shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Request Received</h3>
            <p className="text-netflix-light text-sm leading-relaxed">
              We have received your request for <span className="text-white font-medium">{movie.title}</span>.
              Our team will work on making it available within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-netflix-red text-white font-medium px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">{movie.title ? 'Request Movie' : 'Request TV Show'}</h3>
              <button onClick={onClose} className="text-netflix-gray hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-netflix-light block mb-1.5">Movie</label>
                <input
                  type="text"
                  value={movie.title}
                  disabled
                  className="w-full bg-netflix-darker border border-white/10 rounded px-3 py-2 text-white text-sm cursor-not-allowed opacity-60"
                />
              </div>
              <div>
                <label className="text-sm text-netflix-light block mb-1.5">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Add any notes about quality, language, etc."
                  rows={3}
                  className="w-full bg-netflix-darker border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-netflix-gray focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-netflix-red text-white font-medium py-2.5 rounded hover:bg-red-700 transition-colors text-sm"
              >
                Submit Request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function TorrentPanel({
  movie,
  onStream,
}: {
  movie: Movie;
  onStream: (magnet: string) => void;
}) {
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const fetched = useRef(false);

  const searchQuery = `${movie.title} ${new Date(movie.release_date).getFullYear()}`;

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const doSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/torrents?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.results || []);
        if (!data.results?.length) {
          setError('No torrents found for this title.');
        }
      } catch {
        setError('Torrent search is currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [searchQuery]);

  const copyMagnet = async (magnet: string, id: string) => {
    try {
      await navigator.clipboard.writeText(magnet);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch {
      window.open(magnet, '_blank');
    }
  };

  return (
    <div className="absolute inset-0 bg-netflix-darker overflow-y-auto">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-white font-semibold text-sm">Torrent Search</h4>
            <p className="text-xs text-netflix-gray mt-0.5">Results for: {searchQuery}</p>
          </div>
          <a
            href="https://webtor.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-netflix-light hover:text-white underline underline-offset-2"
          >
            Need a torrent client?
          </a>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin mb-3" />
            <p className="text-sm text-netflix-gray">Searching torrents...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-netflix-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-netflix-gray mb-2">{error}</p>
            <p className="text-xs text-netflix-gray/60">
              Try requesting this movie instead using the Request button above.
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-2">
            {results.map((torrent) => (
              <div
                key={torrent.id}
                className="bg-black/30 border border-white/5 rounded-lg p-3 flex items-center gap-3 hover:border-white/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{torrent.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-netflix-gray">
                    <span className="text-green-400 font-medium">{torrent.seeders} SE</span>
                    <span className="text-red-400">{torrent.leechers} LE</span>
                    <span>{torrent.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyMagnet(torrent.magnet, torrent.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      copiedId === torrent.id
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-netflix-light hover:bg-white/20 hover:text-white'
                    }`}
                    title="Copy magnet link"
                  >
                    {copiedId === torrent.id ? 'Copied!' : 'Magnet'}
                  </button>
                  <button
                    onClick={() => onStream(torrent.magnet)}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-netflix-red/80 text-white hover:bg-netflix-red transition-colors"
                    title="Open in external torrent client"
                  >
                    Stream
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TVEpisodeSelector({
  seasons,
  selectedSeason,
  onSeasonChange,
  episodes,
  episodesLoading,
  selectedEpisode,
  onEpisodeSelect,
}: {
  seasons: TVSeason[];
  selectedSeason: number;
  onSeasonChange: (s: number) => void;
  episodes: TVEpisode[];
  episodesLoading: boolean;
  selectedEpisode: number | null;
  onEpisodeSelect: (e: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-netflix-light font-medium whitespace-nowrap">
          Season
        </label>
        <select
          value={selectedSeason}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="bg-netflix-darker border border-white/10 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/30"
        >
          {seasons
            .filter((s) => s.season_number > 0)
            .map((s) => (
              <option key={s.id} value={s.season_number}>
                {s.name} ({s.episode_count} episodes)
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-1">
        {episodesLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/20 border-t-netflix-red rounded-full animate-spin" />
          </div>
        ) : episodes.length === 0 ? (
          <p className="col-span-full text-sm text-netflix-gray text-center py-4">
            No episodes found for this season.
          </p>
        ) : (
          episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => onEpisodeSelect(ep.episode_number)}
              className={`flex flex-col items-center justify-center rounded-md p-2 transition-colors ${
                selectedEpisode === ep.episode_number
                  ? 'bg-netflix-red text-white'
                  : 'bg-white/5 text-netflix-light hover:bg-white/20 hover:text-white'
              }`}
              title={`S${ep.season_number}E${ep.episode_number} - ${ep.name}`}
            >
              <span className="text-xs font-bold">{ep.episode_number}</span>
              <span className="text-[10px] truncate w-full text-center leading-tight mt-0.5 opacity-80">
                {ep.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function VideoPlayerModal({ movie, isOpen, onClose }: VideoPlayerModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentServer, setCurrentServer] = useState(0);
  const [movieDetails, setMovieDetails] = useState<{ imdb_id?: string | null } | null>(null);
  const [fetchingId, setFetchingId] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [torrentMagnet, setTorrentMagnet] = useState<string | null>(null);

  // TV series state
  const [tvDetails, setTvDetails] = useState<TVShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const isTV = movie?.media_type === 'tv';
  const isTorrentMode = currentServer === TORRENT_INDEX;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const resetState = useCallback(() => {
    setLoading(true);
    setError('');
    setCurrentServer(0);
    setMovieDetails(null);
    setShowRequest(false);
    setTorrentMagnet(null);
    setTvDetails(null);
    setEpisodes([]);
    setSelectedSeason(1);
    setSelectedEpisode(null);
  }, []);

  useEffect(() => {
    if (!movie || !isOpen) return;

    resetState();

    const fetchData = async () => {
      setFetchingId(true);
      try {
        if (isTV) {
          const res = await fetch(`/api/movies?type=tv-detail&id=${movie.id}`);
          if (!res.ok) throw new Error('Failed to fetch TV details');
          const data: TVShowDetails = await res.json();
          setTvDetails(data);
          setMovieDetails({ imdb_id: data.imdb_id });
          const firstRealSeason = data.seasons?.find((s) => s.season_number > 0);
          if (firstRealSeason) {
            setSelectedSeason(firstRealSeason.season_number);
          }
        } else {
          const res = await fetch(`/api/movies?type=detail&id=${movie.id}`);
          if (!res.ok) throw new Error('Failed to fetch details');
          const data = await res.json();
          setMovieDetails(data);
        }
      } catch {
        setError('Failed to load video source.');
      } finally {
        setFetchingId(false);
      }
    };

    fetchData();
  }, [movie, isOpen, resetState, isTV]);

  useEffect(() => {
    if (!movie || !isTV || !tvDetails) return;

    const fetchEpisodes = async () => {
      setEpisodesLoading(true);
      setSelectedEpisode(null);
      try {
        const res = await fetch(
          `/api/movies?type=tv-season&id=${movie.id}&season=${selectedSeason}`
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
  }, [movie, isTV, tvDetails, selectedSeason]);

  useEffect(() => {
    if (!fetchingId && movieDetails && !isTorrentMode) {
      setLoading(false);
    }
  }, [fetchingId, movieDetails, isTorrentMode]);

  const handleServerSwitch = useCallback(
    (index: number) => {
      if (index === currentServer) return;

      if (index === TORRENT_INDEX) {
        setCurrentServer(index);
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      setCurrentServer(index);
      setTorrentMagnet(null);
    },
    [currentServer]
  );

  const handleTorrentStream = useCallback((magnet: string) => {
    setTorrentMagnet(magnet);
    window.open(magnet, '_blank');
    setTimeout(() => setTorrentMagnet(null), 100);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showRequest) {
        setShowRequest(false);
        return;
      }
      onClose();
    }
  };

  if (!isOpen || !movie) return null;

  const displayTitle = movie.title || movie.name || '';
  const imdbId = movieDetails?.imdb_id;

  const videoUrl =
    !isTorrentMode &&
    (isTV
      ? selectedEpisode && tvDetails?.imdb_id
        ? STREAM_SOURCES[currentServer].url(tvDetails.imdb_id, selectedSeason, selectedEpisode)
        : null
      : imdbId
        ? STREAM_SOURCES[currentServer].url(imdbId)
        : null);

  const iframeKey = isTV
    ? `tv-${movie.id}-s${selectedSeason}e${selectedEpisode}-${currentServer}`
    : `${imdbId}-${currentServer}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={handleKeyDown}>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="relative z-50 w-full max-w-5xl mx-4 animate-scale-in">
        <div className="bg-netflix-dark rounded-lg overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-netflix-darker flex-wrap gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm md:text-lg truncate max-w-xs md:max-w-md">
                {displayTitle}
                {isTV && selectedEpisode && ` - S${selectedSeason}:E${selectedEpisode}`}
              </h3>
              {imdbId && !isTorrentMode && (
                <p className="text-xs text-netflix-gray mt-0.5">IMDb: {imdbId}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              {!fetchingId && (
                <>
                  {STREAM_SOURCES.map((source, i) => (
                    <button
                      key={i}
                      onClick={() => handleServerSwitch(i)}
                      disabled={fetchingId}
                      className={`px-2 md:px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        i === currentServer
                          ? 'bg-netflix-red text-white'
                          : 'bg-white/10 text-netflix-light hover:bg-white/20 hover:text-white'
                      }`}
                      title={`Switch to ${source.name}`}
                    >
                      {source.name}
                    </button>
                  ))}
                  <button
                    onClick={() => handleServerSwitch(TORRENT_INDEX)}
                    className={`px-2 md:px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      isTorrentMode
                        ? 'bg-orange-600 text-white'
                        : 'bg-white/10 text-netflix-light hover:bg-white/20 hover:text-white'
                    }`}
                    title="Search and stream via torrent"
                  >
                    Torrent
                  </button>
                  <button
                    onClick={() => setShowRequest(true)}
                    className="px-2 md:px-2.5 py-1 text-xs font-medium rounded bg-white/5 text-netflix-light border border-dashed border-white/20 hover:bg-white/10 hover:text-white transition-colors"
                    title={`Request this ${isTV ? 'TV show' : 'movie'}`}
                  >
                    + Request
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-netflix-gray hover:text-white transition-colors ml-1"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative aspect-video bg-black">
            {fetchingId ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-sm text-netflix-gray">Loading video source...</p>
                </div>
              </div>
            ) : isTorrentMode ? (
              <TorrentPanel movie={movie} onStream={handleTorrentStream} />
            ) : !videoUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-netflix-darker">
                <div className="text-center px-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto mb-4 text-netflix-gray"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-netflix-gray mb-2">
                    {isTV
                      ? selectedEpisode
                        ? 'Video source unavailable'
                        : 'Select a season and episode to play'
                      : 'Video source unavailable'}
                  </p>
                  <p className="text-xs text-netflix-gray/60">
                    {isTV && !selectedEpisode
                      ? 'Choose a season and episode from the selector below.'
                      : !imdbId
                        ? 'No IMDb ID available. Try the Torrent tab or Request button below.'
                        : 'All servers failed to load. Try Torrent or Request.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <p className="text-sm text-netflix-gray">
                        Loading {STREAM_SOURCES[currentServer].name}...
                      </p>
                    </div>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  src={videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError('Failed to load video player.');
                  }}
                />
              </>
            )}
          </div>

          {isTV && tvDetails && (
            <div className="px-6 py-4 border-t border-white/10">
              <TVEpisodeSelector
                seasons={tvDetails.seasons || []}
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
                episodes={episodes}
                episodesLoading={episodesLoading}
                selectedEpisode={selectedEpisode}
                onEpisodeSelect={setSelectedEpisode}
              />
            </div>
          )}

          {movie.overview && !isTorrentMode && (
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-sm text-netflix-light line-clamp-2 leading-relaxed">
                {movie.overview}
              </p>
            </div>
          )}
        </div>
      </div>

      {showRequest && (
        <RequestForm movie={movie} onClose={() => setShowRequest(false)} />
      )}
    </div>
  );
}
