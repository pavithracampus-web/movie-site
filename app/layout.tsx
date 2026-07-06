import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FLARE',
  description: 'Stream movies and TV series',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
