export function getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  return getImageUrl(path, 'original');
}

export function getPosterUrl(path: string | null): string {
  return getImageUrl(path, 'w500');
}

export function formatRating(vote: number | undefined): string {
  return vote?.toFixed(1) ?? 'N/A';
}

export function formatYear(date: string): string {
  return date ? new Date(date).getFullYear().toString() : '';
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '...';
}

type StreamUrlFn = (id: string, season?: number, episode?: number) => string;

export const STREAM_SOURCES: { name: string; url: StreamUrlFn }[] = [
  {
    name: 'Server 1',
    url: (id, s, e) =>
      s ? `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` : `https://vidsrc.pro/embed/movie/${id}`,
  },
  {
    name: 'Server 2',
    url: (id, s, e) =>
      s ? `https://vidsrc.in/embed/tv/${id}/${s}/${e}` : `https://vidsrc.in/embed/movie/${id}`,
  },
  {
    name: 'Server 3',
    url: (id, s, e) =>
      s ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}` : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    name: 'Server 4',
    url: (id, s, e) =>
      s ? `https://embed.su/embed/tv/${id}/${s}/${e}` : `https://embed.su/embed/movie/${id}`,
  },
  {
    name: 'Server 5',
    url: (id, s, e) =>
      s
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    name: 'Server 6',
    url: (id, s, e) =>
      s
        ? `https://www.nontongo.win/embed/tv/${id}/${s}/${e}`
        : `https://www.nontongo.win/embed/movie/${id}`,
  },
];

export const TORRENT_INDEX = 6;

export const TRACKERS = [
  'udp://tracker.coppersurfer.tk:6969/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://tracker.leechers-paradise.org:6969/announce',
  'udp://tracker.internetwarriors.net:1337/announce',
  'udp://tracker.tiny-vps.com:6969/announce',
  'http://tracker.files.fm:6969/announce',
];

export function buildMagnet(infoHash: string, name: string): string {
  const encoded = encodeURIComponent(name);
  const trs = TRACKERS.map(t => `&tr=${encodeURIComponent(t)}`).join('');
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encoded}${trs}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function debounce<T extends (...args: string[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
