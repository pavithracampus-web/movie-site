import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wandering Thoughts - Personal Blog',
  description: 'A personal blog about productivity, cooking, DIY projects, travel, and technology. Updated weekly with genuine stories and practical advice.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Wandering Thoughts - Personal Blog',
    description: 'A personal blog about productivity, cooking, DIY projects, travel, and technology.',
    type: 'website',
  },
};

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafafa; color: #333; line-height: 1.6; }
  .container { max-width: 720px; margin: 0 auto; padding: 40px 20px; }
  header { text-align: center; margin-bottom: 48px; }
  h1 { font-size: 2rem; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
  .subtitle { color: #666; font-size: 1rem; }
  nav { margin: 24px 0; display: flex; justify-content: center; gap: 24px; }
  nav a { color: #555; text-decoration: none; font-size: 0.9rem; }
  nav a:hover { color: #000; text-decoration: underline; }
  .post { margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #eee; }
  .post:last-child { border-bottom: none; }
  .post h2 { font-size: 1.4rem; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; line-height: 1.3; }
  .post h2 a { color: inherit; text-decoration: none; }
  .post h2 a:hover { color: #0066cc; }
  .post-meta { font-size: 0.85rem; color: #888; margin-bottom: 10px; }
  .post-meta span { margin-right: 12px; }
  .post-excerpt { color: #444; font-size: 0.95rem; }
  .tags { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
  .tag { background: #e8e8e8; color: #555; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; }
  .about { background: #f0f0f0; padding: 24px; border-radius: 8px; margin-top: 48px; }
  .about h3 { font-size: 1.1rem; margin-bottom: 8px; }
  .about p { font-size: 0.9rem; color: #555; }
  footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; color: #888; font-size: 0.85rem; }
`;

export default function CloakLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <style>{styles}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
