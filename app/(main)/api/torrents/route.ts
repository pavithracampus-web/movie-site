import { NextResponse } from 'next/server';
import { buildMagnet, formatBytes } from '@/app/(main)/lib/utils';

interface TPBResult {
  id: string;
  name: string;
  info_hash: string;
  leechers: string;
  seeders: string;
  num_files: string;
  size: string;
  username: string;
  added: string;
  status: string;
  category: string;
  imdb: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=0`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      throw new Error(`TPB API responded with ${res.status}`);
    }

    const data: TPBResult[] = await res.json();

    const results = data
      .filter(item => item.id !== '0' && Number(item.seeders) > 0)
      .slice(0, 20)
      .map(item => ({
        id: item.id,
        name: item.name,
        magnet: buildMagnet(item.info_hash, item.name),
        infoHash: item.info_hash,
        seeders: Number(item.seeders),
        leechers: Number(item.leechers),
        size: formatBytes(Number(item.size)),
        sizeBytes: Number(item.size),
        added: item.added,
        status: item.status,
      }))
      .sort((a, b) => b.seeders - a.seeders);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Torrent search error:', error);
    return NextResponse.json(
      { error: 'Torrent search failed. The API may be blocked in your region.' },
      { status: 502 }
    );
  }
}
