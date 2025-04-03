import KadiSequences from "./client";

export const metadata = {
  title:
    "Kadi Card Sequences & Winning Combinations | Master Advanced Strategies - Wufwuf",
  description:
    "Master all 3,976 official Kadi card sequences and winning combinations. Learn Question Card strategies, explore interactive examples, and dominate Kadi with pro tips and advanced techniques!",
  keywords: [
    "Kadi card sequences",
    "Kadi winning combinations",
    "Kadi strategy guide",
    "Question Card sequences Kadi",
    "Kadi game rules",
    "Kadi card game",
    "how to win Kadi",
    "Kadi pro tips",
    "competitive card games",
    "Wufwuf Kadi",
    "Kadi tournament strategy",
    "Kadi sequence examples",
    "Kadi Queen sequences",
    "Kadi Eight combinations",
    "advanced Kadi tactics",
  ],
  openGraph: {
    title:
      "Master Kadi Card Sequences: Complete Strategy Guide | Wufwuf Gaming",
    description:
      "Unlock all 3,976 Kadi card sequences! Expert strategies, interactive examples, and pro tips for mastering Question Cards. Join the elite players dominating Kadi tournaments!",
    type: "article",
    url: "https://www.wufwuf.io/kadi-sequences",
    images: [
      {
        url: "https://www.wufwuf.io/public/kadi/sequence-guide.jpg",
        width: 1200,
        height: 630,
        alt: "Kadi Card Sequences Strategy Guide",
      },
    ],
    siteName: "Wufwuf Gaming",
    locale: "en_US",
    publishedTime: new Date().toISOString(),
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Master Kadi Sequences: Pro Strategy Guide with Interactive Examples 🎮",
    description:
      "Learn all 3,976 Kadi sequences! Discover pro strategies, master Question Cards, and dominate with our interactive guide. Join the Kadi elite! #KadiGame #Gaming #Esports",
    creator: "@Wufwuf",
    images: ["https://www.wufwuf.io/public/kadi/sequence-guide.jpg"],
    site: "@Wufwuf",
  },
  alternates: {
    canonical: "https://www.wufwuf.io/kadi-sequences",
    languages: {
      "en-US": "https://www.wufwuf.io/kadi-sequences",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  authors: [
    {
      name: "Wufwuf Gaming",
      url: "https://www.wufwuf.io",
    },
  ],
  category: "Gaming Strategy Guides",
  applicationCategory: "Gaming",
};

// Add schema markup for rich results
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Master Kadi Card Sequences & Winning Combinations",
  description:
    "Comprehensive guide to mastering Kadi card sequences and winning strategies.",
  image: "https://www.wufwuf.io/public/kadi/sequence-guide.jpg",
  author: {
    "@type": "Organization",
    name: "Wufwuf Gaming",
    url: "https://www.wufwuf.io",
  },
  publisher: {
    "@type": "Organization",
    name: "Wufwuf Gaming",
    logo: {
      "@type": "ImageObject",
      url: "https://www.wufwuf.io/logo.png",
    },
  },
  datePublished: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.wufwuf.io/kadi-sequences",
  },
};

const Page = () => {
  return (
    <>
      <KadiSequences />
    </>
  );
};

export default Page;
