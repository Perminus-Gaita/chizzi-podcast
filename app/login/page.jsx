import Authenticate from "../../components/Auth/Authenticate";

export const metadata = {
  title: "Login - Wufwuf Kadi Tournament Platform",
  description:
    "Securely access your Wufwuf gaming account. Join tournaments, track your stats, and compete in Kadi card games. Sign in with your preferred method and start playing today!",
  keywords: [
    "kadi login",
    "tournament platform login",
    "gaming account",
    "card game login",
    "secure gaming login",
    "tournament access",
    "player account",
    "gaming profile",
    "wufwuf kadi",
    "game authentication",
    "esports login",
    "tournament registration",
    "player dashboard",
    "gaming wallet",
    "tournament rewards",
  ],
  openGraph: {
    title: "Sign In to Wufwuf Kadi - Your Tournament Gateway",
    description:
      "Access your gaming profile, join tournaments, and manage your rewards. Secure login to Wufwuf's premier Kadi tournament platform.",
    type: "website",
    images: [
      {
        url: "/images/login-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Wufwuf Kadi Login Page",
      },
    ],
    siteName: "Wufwuf Kadi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Wufwuf Kadi Tournaments",
    description:
      "Log in to access tournaments, rewards, and competitive card gaming.",
    images: ["/images/login-banner.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://wufwuf.io/login",
  },
  other: {
    "revisit-after": "7 days",
    "msapplication-TileColor": "#1a1b2e",
    "apple-mobile-web-app-capable": "yes",
    "theme-color": "#1a1b2e",
  },
};

const LoginPage = () => {
  return (
    <>
      <Authenticate />
    </>
  );
};

export default LoginPage;
