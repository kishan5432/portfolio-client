import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const defaultSEO = {
  title: 'Portfolio | Modern Full-Stack Developer',
  description: 'Full-stack developer specializing in React, TypeScript, and Node.js. Building modern, scalable web applications with cutting-edge technologies.',
  image: '/og-image.jpg',
  url: 'https://yourportfolio.com',
  type: 'website' as const,
  siteName: 'Portfolio',
  twitterCard: 'summary_large_image' as const,
  author: 'Your Name',
  keywords: [
    'full-stack developer',
    'react developer',
    'typescript',
    'node.js',
    'web development',
    'portfolio',
    'frontend',
    'backend',
    'javascript',
    'software engineer'
  ],
};

export function SEO({
  title,
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = defaultSEO.type,
  siteName = defaultSEO.siteName,
  twitterCard = defaultSEO.twitterCard,
  noIndex = false,
  noFollow = false,
  canonical,
  keywords = defaultSEO.keywords,
  author = defaultSEO.author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const seoTitle = title ? `${title} | ${siteName}` : defaultSEO.title;
  const seoUrl = url.startsWith('http') ? url : `${defaultSEO.url}${url}`;
  const seoImage = image.startsWith('http') ? image : `${defaultSEO.url}${image}`;

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical || seoUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:creator" content="@yourusername" />
      <meta name="twitter:site" content="@yourusername" />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'profile' ? 'Person' : 'WebSite',
          "name": siteName,
          "description": description,
          "url": seoUrl,
          "image": seoImage,
          ...(type === 'profile' && {
            "jobTitle": "Full-Stack Developer",
            "worksFor": {
              "@type": "Organization",
              "name": "Independent"
            },
            "alumniOf": {
              "@type": "EducationalOrganization",
              "name": "University of Technology"
            },
            "knowsAbout": keywords,
          }),
          ...(type === 'website' && {
            "author": {
              "@type": "Person",
              "name": author
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${seoUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        })}
      </script>
    </Helmet>
  );
}

// Predefined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: 'Home',
    description: 'Full-stack developer specializing in React, TypeScript, and Node.js. Building modern, scalable web applications with cutting-edge technologies.',
    url: '/',
    type: 'website' as const,
  },
  projects: {
    title: 'Projects',
    description: 'Explore my latest projects showcasing modern web development with React, TypeScript, Node.js, and cutting-edge technologies.',
    url: '/projects',
    type: 'website' as const,
  },
  certificates: {
    title: 'Certificates',
    description: 'Professional certifications and achievements in web development, cloud computing, and modern technologies.',
    url: '/certificates',
    type: 'website' as const,
  },
  timeline: {
    title: 'Timeline',
    description: 'My professional journey through education and work experience in software development and web technologies.',
    url: '/timeline',
    type: 'website' as const,
  },
  about: {
    title: 'About',
    description: 'Learn more about me, my background, skills, and passion for creating exceptional web experiences with modern technologies.',
    url: '/about',
    type: 'profile' as const,
  },
  contact: {
    title: 'Contact',
    description: 'Get in touch with me for collaboration opportunities, project inquiries, or just to say hello. I\'d love to hear from you!',
    url: '/contact',
    type: 'website' as const,
  },
  admin: {
    title: 'Admin Dashboard',
    description: 'Admin dashboard for managing portfolio content, projects, certificates, and messages.',
    url: '/admin',
    noIndex: true,
    noFollow: true,
  },
} as const;

// Hook for using SEO configurations
export function useSEO(pageKey: keyof typeof seoConfigs, overrides: Partial<SEOProps> = {}) {
  const config = seoConfigs[pageKey];
  return { ...config, ...overrides };
}

