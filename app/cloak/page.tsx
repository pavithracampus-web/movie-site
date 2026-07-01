const posts = [
  {
    title: 'My Morning Routine for Productive Days',
    excerpt: 'Getting up early has changed my life completely. Here are the five habits I follow every morning to stay focused and energized throughout the day.',
    date: 'March 12, 2026',
    tags: ['Productivity', 'Lifestyle', 'Health'],
  },
  {
    title: 'Homemade Sourdough: A Beginner\'s Guide',
    excerpt: 'After months of trial and error, I finally perfected my sourdough starter. This guide will help you bake your first loaf without the stress.',
    date: 'March 8, 2026',
    tags: ['Cooking', 'Baking', 'Recipes'],
  },
  {
    title: 'Building a Custom Bookshelf on a Budget',
    excerpt: 'You don\'t need expensive tools to create beautiful furniture. Follow along as I build a rustic bookshelf for under $50.',
    date: 'March 1, 2026',
    tags: ['DIY', 'Woodworking', 'Home Improvement'],
  },
  {
    title: '10 Underrated National Parks to Visit in 2026',
    excerpt: 'Everyone visits the famous parks, but these hidden gems offer incredible views without the crowds. My personal recommendations.',
    date: 'February 22, 2026',
    tags: ['Travel', 'Nature', 'Adventure'],
  },
  {
    title: 'Why I Switched to Open Source Software',
    excerpt: 'A personal journey from proprietary tools to open source alternatives. The freedom, privacy, and community surprised me.',
    date: 'February 15, 2026',
    tags: ['Technology', 'Privacy', 'Software'],
  },
];

export default function CloakPage() {
  return (
    <div className="container">
      <header>
        <h1>Wandering Thoughts</h1>
        <p className="subtitle">A personal journal about life, food, travel, and making things.</p>
        <nav>
          <a href="/">Home</a>
          <a href="#">About</a>
          <a href="#">Archive</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <main>
        {posts.map((post, i) => (
          <article key={i} className="post">
            <h2><a href="#">{post.title}</a></h2>
            <div className="post-meta">
              <span>{post.date}</span>
              <span>·</span>
              <span>5 min read</span>
            </div>
            <p className="post-excerpt">{post.excerpt}</p>
            <div className="tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </main>

      <section className="about">
        <h3>About This Space</h3>
        <p>
          This space is managed by Pavithra Heshan, built in dynamic collaboration with AI core architectures to explore the boundaries of automated full-stack environments and modern web frameworks.
        </p>
      </section>

      <footer>
        <p>&copy; {(new Date()).getFullYear()} Wandering Thoughts. All writings are my own.</p>
      </footer>
    </div>
  );
}
