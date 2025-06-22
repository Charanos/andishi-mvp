// lib/blogData.ts
export type BlogPostType = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  gradient: string;
};

export const blogData: Record<string, BlogPostType> = {
  "ai-remote-hiring": {
    slug: "ai-remote-hiring",
    title: "The Future of Remote Work: How AI is Transforming Tech Hiring",
    excerpt: "Discover how AI-powered tools are revolutionizing remote hiring processes, reducing bias, and helping companies find the best global tech talent faster than ever before.",
    content: `<p>AI content...</p>`,
    author: "Sarah Mitchell",
    date: "June 8, 2025",
    readTime: "5 min read",
    category: "AI & Hiring",
    image: "/blog1.jpg",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  "high-performance-teams": {
    slug: "high-performance-teams",
    title: "Building High-Performance Remote Development Teams",
    excerpt: "Learn the proven strategies for creating cohesive, productive remote engineering teams that deliver exceptional results across time zones and cultural boundaries.",
    content: `<p>Team content...</p>`,
    author: "Michael Rodriguez",
    date: "June 5, 2025",
    readTime: "7 min read",
    category: "Team Management",
    image: "/blog2.jpg",
    gradient: "from-purple-500/20 to-pink-500/10",
  },
  "web3-development-skills": {
    slug: "web3-development-skills",
    title: "Web3 Development: Skills That Are in High Demand",
    excerpt: "Explore the essential blockchain and decentralized technology skills that are commanding premium salaries in today's rapidly evolving Web3 job market.",
    content: `<p>Web3 content...</p>`,
    author: "Alex Chen",
    date: "June 2, 2025",
    readTime: "6 min read",
    category: "Web3 & Blockchain",
    image: "/blog3.jpg",
    gradient: "from-green-500/20 to-emerald-500/10",
  },
};