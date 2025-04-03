import { withContentlayer } from "next-contentlayer";

const nextConfig = {
  compiler: {
    styledComponents: true,
    styledJsx: true, // Note: it's styledJsx, not styledComponents!
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "wufwuf-bucket-development.s3.ap-south-1.amazonaws.com",
      "wufwuf-bucket-production.s3.ap-south-1.amazonaws.com",
      "localhost",
      "www.businessdailyafrica.com",
      "www.sinemafocus.com",
      "i.scdn.co",
      "pbs.twimg.com"
    ],
  },
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/:username",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
  // Configure HTTPS for development
  webpack(config) {
    return config;
  },
};

export default withContentlayer({ ...nextConfig });
