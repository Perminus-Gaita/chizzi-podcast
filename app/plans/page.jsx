import Plans from "./client";

export const metadata = {
  metadataBase: new URL("https://wufwuf.io"),
  title: {
    default: "Tournament Passes & Premium Plans | Wufwuf Kadi",
    template: "%s | Wufwuf Gaming",
  },
  description:
    "Choose your perfect tournament pass! Access premium tournaments, exclusive merchandise, AI training modes, and sponsored events. From casual players to professional competitors, find the right plan for your gaming journey.",

  keywords: [
    "kadi tournament pass",
    "gaming subscription",
    "tournament entry fees",
    "premium gaming plans",
    "competitive gaming subscription",
    "tournament rewards",
    "gaming membership",
    "card game tournaments",
    "sponsored tournament access",
    "professional gaming plans",
    "tournament prizes",
    "gaming perks",
    "AI practice mode",
    "tournament entry pass",
    "gaming benefits",
    "exclusive tournaments",
    "card game merchandise",
    "tournament platform subscription",
    "gaming rewards program",
    "competitive gaming pass",
  ],

  openGraph: {
    type: "website",
    siteName: "Wufwuf Kadi",
    title: "Tournament Passes & Premium Gaming Plans",
    description:
      "Unlock exclusive tournaments, win bigger prizes, and access premium features with Wufwuf tournament passes. Choose your competitive advantage!",
    images: [
      {
        url: "/images/tournament-passes.jpg",
        width: 1200,
        height: 630,
        alt: "Wufwuf Tournament Passes and Plans",
      },
    ],
    locale: "en_US",
    url: "https://wufwuf.io/pricing",
  },

  twitter: {
    card: "summary_large_image",
    site: "@wufwuf",
    title: "Level Up Your Tournament Game 🏆",
    description:
      "Join elite tournaments, access exclusive merchandise, and compete for bigger prizes. Choose your Wufwuf tournament pass today!",
    images: ["/images/tournament-passes.jpg"],
  },

  alternates: {
    canonical: "https://wufwuf.io/pricing",
    languages: {
      "en-US": "https://wufwuf.io/en-US/pricing",
    },
  },

  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
    nocache: true,
  },

  // Additional structured data for pricing
  other: {
    "pricing-currency": "USD",
    "pricing-type": "subscription",
    "free-trial": "available",
    "subscription-terms": "monthly/yearly",
    "refund-policy": "available",
    "payment-methods": "credit-card,paypal,crypto",
  },
};

// Optional: Add JSON-LD structured data for rich results
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Wufwuf Tournament Passes",
  description: "Premium gaming subscriptions for competitive Kadi players",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      priceType: "subscription",
      price: "varies",
      billingIncrement: "P1M",
    },
    availability: "https://schema.org/InStock",
  },
  category: "Gaming Subscription",
};

const Page = () => {
  return <Plans />;
};

export default Page;
