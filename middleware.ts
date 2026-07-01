import { NextResponse, NextRequest } from 'next/server';

const BOT_PATTERNS = [
  'Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video',
  'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot',
  'YandexImages', 'YandexVideo', 'YandexBlogs', 'YandexNews',
  'Facebot', 'ia_archiver', 'Twitterbot', 'Applebot',
  'AdsBot-Google', 'AdsBot-Google-Mobile', 'AdIdxBot',
  'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot', 'rogerbot',
  'Exabot', 'Screaming Frog', 'BLEXBot', 'Spinn3r',
  'Wget', 'curl', 'python-requests', 'Go-http-client',
  'Scrapy', 'PetalBot', 'AspiegelBot', 'DataForSeoBot',
  'SeekportBot', 'Yeti', 'Claude-Web', 'GPTBot',
  'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot',
  'Amazonbot', 'Pinterestbot', 'Slackbot',
  'CCBot', 'VelenPublicWebCrawler',
  'MegaIndex', 'archive.org_bot', 'TurnitinBot',
  'SafeSearch', 'ScoutJet', 'Nutch',
];

const GOOGLE_IP_RANGES = [
  '66.249.',     '74.125.',     '216.239.',
  '64.233.',     '72.14.',      '209.85.',
  '66.102.',     '66.249.',     '173.194.',
  '207.126.',    '216.58.',     '35.184.',
  '35.185.',     '35.186.',     '35.187.',
  '35.188.',     '35.189.',     '35.190.',
  '35.191.',     '35.192.',     '35.193.',
  '35.194.',     '35.195.',     '35.196.',
  '35.197.',     '35.198.',     '35.199.',
  '35.200.',     '35.201.',     '35.202.',
  '35.203.',     '35.204.',     '35.205.',
  '35.206.',     '35.207.',     '35.208.',
  '104.154.',    '104.155.',    '104.156.',
  '130.211.',    '146.148.',    '23.236.',
];

function isBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();

  if (ua.includes('mozilla') && !BOT_PATTERNS.some(p => ua.includes(p.toLowerCase()))) {
    return false;
  }

  return BOT_PATTERNS.some(pattern => ua.includes(pattern.toLowerCase()));
}

function isBotIp(ip: string): boolean {
  return GOOGLE_IP_RANGES.some(range => ip.startsWith(range));
}

async function checkReverseDns(ip: string): Promise<boolean> {
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') return false;
  try {
    const hostname = await fetch(
      `https://dns.google/resolve?name=${ip}&type=PTR`,
      { signal: AbortSignal.timeout(2000) }
    ).then(r => r.json());
    const answer = hostname?.Answer?.[0]?.data?.toLowerCase() || '';
    return (
      answer.includes('googlebot') ||
      answer.includes('google.com') ||
      answer.includes('bing.com') ||
      answer.includes('search.msn.com')
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const skipPaths = ['/_next', '/cloak', '/favicon.ico', '/robots.txt', '/sitemap.xml'];
  if (skipPaths.some(p => pathname.startsWith(p)) || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isApiRequest = pathname.startsWith('/api');
  const userAgent = request.headers.get('user-agent') || '';
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';

  const isBot = isBotUserAgent(userAgent);

  if (isBot) {
    const ipCheck = ip ? isBotIp(ip) || await checkReverseDns(ip) : false;
    if (ipCheck || isBot) {
      const url = request.nextUrl.clone();
      url.pathname = '/cloak';
      url.search = '';
      return NextResponse.rewrite(url, { status: 200 });
    }
  }

  if (isApiRequest) {
    if (isBot) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
