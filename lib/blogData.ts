// lib/blogData.ts
export type BlogPostType = {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  authorImage?: string;
  views?: string;
  likes?: string;
  size?: "large" | "medium" | "small";
};

export const blogData: Record<string, BlogPostType> = {
  "ai-remote-hiring": {
    id: "ai-remote-hiring",
    title: "The Future of Remote Work: How AI is Transforming Tech Hiring",
    excerpt: "Discover how AI-powered tools are revolutionizing remote hiring processes, reducing bias, and helping companies find the best global tech talent faster than ever before.",
    content: `<p>AI content...</p>`,
    author: "Dennis Munge",
    date: "June 8, 2025",
    readTime: "5 min read",
    category: "AI & Hiring",
    image: "/blog1.jpg",
    authorImage: "/authors/dennis.jpg",
    views: "1.2k",
    likes: "245",
    size: "large",
  },
  "high-performance-teams": {
    id: "high-performance-teams",
    title: "Building High-Performance Remote Development Teams",
    excerpt: "Learn the proven strategies for creating cohesive, productive remote engineering teams that deliver exceptional results across time zones and cultural boundaries.",
    content: `<p>Team content...</p>`,
    author: "Yvette Asewe",
    date: "June 5, 2025",
    readTime: "7 min read",
    category: "Team Management",
    image: "/blog2.jpg",
    authorImage: "/authors/yvette.jpg",
    views: "856",
    likes: "178",
    size: "medium",
  },
  "web3-development-skills": {
    id: "web3-development-skills",
    title: "Web3 Development: Skills That Are in High Demand",
    excerpt: "Explore the essential blockchain and decentralized technology skills that are commanding premium salaries in today's rapidly evolving Web3 job market.",
    content: `<p>Web3 content...</p>`,
    author: "Ian Mwangi",
    date: "June 2, 2025",
    readTime: "6 min read",
    category: "Web3 & Blockchain",
    image: "/blog3.jpg",
    authorImage: "/authors/ian.jpg",
    views: "1.5k",
    likes: "312",
    size: "medium",
  },
};