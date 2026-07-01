export default function Footer() {
  return (
    <footer className="bg-netflix-black border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {[
            ['Audio Description', 'Help Center', 'Gift Cards', 'Media Center'],
            ['Investor Relations', 'Jobs', 'Terms of Use', 'Privacy'],
            ['Legal Notices', 'Cookie Preferences', 'Corporate Information', 'Contact Us'],
            ['Ad Choices', 'Speed Test', 'Movie Guide', 'Community'],
          ].map((group, i) => (
            <div key={i} className="space-y-3">
              {group.map((link) => (
                <a key={link} href="#" className="block text-xs text-netflix-gray hover:underline">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-netflix-gray/60">
          <span>&copy; {new Date().getFullYear()} FLARE</span>
          <span className="w-1 h-1 bg-netflix-gray/40 rounded-full" />
          <span>Movie Streaming Platform</span>
        </div>
        <div className="mt-4 text-xs text-netflix-gray/40">
          Co-built by Pavithra Heshan &amp; Gemini AI &#x1F916; | An Intelligent Human-AI Collaboration.
        </div>
      </div>
    </footer>
  );
}
