import Blog from "./client";

export const metadata = {
  title: "Wufwuf Blog: Kadi Tournament Strategies & Gaming Insights",
  description:
    "Explore professional Kadi strategies, tournament guides, winning techniques, and gaming community insights. Stay updated with latest tournament news, prize pools, and exclusive gaming merchandise.",
  keywords: [
    "kadi strategies",
    "card game tournaments",
    "tournament guides",
    "gaming tips",
    "professional kadi",
    "card game tactics",
    "tournament preparation",
    "gaming community",
    "esports prizes",
    "kadi championships",
    "tournament rules",
    "competitive gaming",
    "card game meta",
    "professional players",
    "tournament schedules",
    "gaming merchandise",
    "sponsored tournaments",
    "prize pools",
    "tournament brackets",
    "gaming events",
    "sell merch",
    "kadi tournaments",
    "king kadi",
  ],
  openGraph: {
    type: "website",
    siteName: "Wufwuf Kadi Blog",
    title: "Wufwuf Blog: Master Kadi Tournament Gaming",
    description:
      "Expert strategies, tournament updates, and professional gaming insights for Kadi players. Join our thriving card gaming community.",
    images: [
      {
        url: "/images/blog-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Wufwuf Kadi Tournament Blog",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Wufwuf",
    title: "Wufwuf Kadi: Tournament Insights & Strategies",
    description:
      "Discover professional Kadi strategies, tournament updates, and gaming community news.",
    images: ["/images/blog-twitter-card.jpg"],
    creator: "@Wufwuf",
  },
  alternates: {
    canonical: "https://wufwuf.io/blog",
    languages: {
      "en-US": "https://wufwuf.io/blog",
    },
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  authors: [{ name: "Wufwuf Gaming Team" }],
  category: "Gaming & Tournaments",
  publisher: "Wufwuf Games",
};

// Add structured data for better SEO
export const generateStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Wufwuf Kadi Tournament Blog",
    description: "Professional Kadi tournament strategies and gaming insights",
    publisher: {
      "@type": "Organization",
      name: "Wufwuf Games",
      logo: {
        "@type": "ImageObject",
        url: "https://wufwuf.io/images/logo.png",
      },
    },
    blogPost: [
      {
        "@type": "BlogPosting",
        headline: "Latest Tournament Strategies",
        keywords: "kadi, tournament, strategy, gaming",
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        author: {
          "@type": "Organization",
          name: "Wufwuf Gaming Team",
        },
        publisher: {
          "@type": "Organization",
          name: "Wufwuf Games",
          logo: {
            "@type": "ImageObject",
            url: "https://wufwuf.io/images/logo.png",
          },
        },
      },
    ],
  };
};

const Page = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />
      <Blog />
    </>
  );
};

export default Page;
