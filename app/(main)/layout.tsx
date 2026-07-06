import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FLARE - Stream Movies & Shows',
  description: 'Discover and stream the latest movies, trending titles, and timeless classics.',
  keywords: 'movies, streaming, watch online, film, cinema',
  openGraph: {
    title: 'FLARE - Stream Movies & Shows',
    description: 'Discover and stream the latest movies, trending titles, and timeless classics.',
    type: 'website',
    siteName: 'FLARE',
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {[
          'https://vidsrc.pro',
          'https://vidsrc.in',
          'https://vidsrc.to',
          'https://embed.su',
          'https://multiembed.mov',
          'https://www.nontongo.win',
          'https://player.cinezo.live',
          'https://player.embed-api.stream',
        ].map((domain) => (
          <link key={domain} rel="preconnect" href={domain} crossOrigin="anonymous" />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
