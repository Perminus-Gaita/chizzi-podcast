import Auth from "@/components/Auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { StoreProvider } from "./store/StoreProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MQTTNotification from "@/components/MQTTNotifications";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import GoogleAnalytics from "./google-analytics";
import MicrosoftClarity from "./microsoft-clarity";
import StyledJsxRegistry from "./registry";

export const metadata = {
  metadataBase: new URL("https://your-sports-site-demo.vercel.app"),
  title: {
    default:
      "Your site demo",
    template: "%s | Your site demo",
  },
  description:
    "Join competitive Kadi esports card game tournaments, play against friends, compete in sponsored events, and win real prizes. Experience the ultimate card gaming platform with single-player, multiplayer, and tournament modes.",
  keywords: [
    "your own fantasy sports site"
  ],
  authors: [{ name: "Wufwuf" }],
  creator: "Wufwuf",
  publisher: "Wufwuf Esports & Fantasy",

  openGraph: {
    type: "website",
    siteName: "Your site demo",
    title:
      "Your site demo",
    description:
      "Your site demo",
    url: "https://your-sports-site-demo.vercel.app",
    images: [
      {
        url: "/metadata-image.png",
        width: 1200,
        height: 630,
        alt: "Wufwuf Kadi Esports Tournament Platform",
      },
    ],
  },

  // twitter: {
  //   card: "summary_large_image",
  //   site: "@wufwuf_esports_gaming",
  //   creator: "@wufwuf_esports_gaming",
  //   title: "Wufwuf - Competitive Kadi Tournaments",
  //   description:
  //     "Join the ultimate Kadi tournament platform. Compete, win, and dominate!",
  //   images: ["/images/wufwuf-tournament-preview.jpg"],
  // },

  verification: {
    google: "your-google-verification-code",
    yandex: "yandex-verification-code",
    other: {
      "facebook-domain-verification": "your-fb-domain-verification",
    },
  },

  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     "max-video-preview": -1,
  //     "max-image-preview": "large",
  //     "max-snippet": -1,
  //   },
  // },

  alternates: {
    canonical: "https://your-sports-site-demo.vercel.app",
    languages: {
      "en-US": "https://your-sports-site-demo.vercel.app/en-US",
    },
  },

  // manifest: "/manifest.json",

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Wufwuf Gaming",
    "apple-mobile-web-app-title": "Wufwuf Gaming",
    "theme-color": "#1a1b2e",
    "msapplication-TileColor": "#1a1b2e",
    "msapplication-config": "/browserconfig.xml",
  },
};

// Viewport configuration (moved out of metadata)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <html lang="en" className={GeistSans.className}>
        <body className="bg-[#f7f7f7] dark:bg-dark">
          <StyledJsxRegistry>
            <ErrorBoundary>
              <Analytics />
              <SpeedInsights />
              <GoogleAnalytics />
              <MicrosoftClarity />
              <Auth />
              <Navbar />
              <Notification />
              <MQTTNotification />
              <main style={{ width: "100%", minHeight: "100vh" }}>
                {children}
              </main>
              {/* <PWAInstallPrompt /> */}
              {/* <Footer /> */}
            </ErrorBoundary>
          </StyledJsxRegistry>
        </body>
      </html>
    </StoreProvider>
  );
}
