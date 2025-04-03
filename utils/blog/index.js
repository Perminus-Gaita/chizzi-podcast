import { compareDesc, parseISO } from "date-fns";
import { allBlogs } from "../../.contentlayer/generated";

export function getPublishedBlogs() {
  return allBlogs.filter((blog) => blog.isPublished);
}

export const sortBlogs = (blogs) => {
  return blogs
    .slice()
    .sort((a, b) =>
      compareDesc(parseISO(a.publishedAt), parseISO(b.publishedAt))
    );
};

export const siteMetadata = {
  title: "wufwuf",
  author: "theewufwufdiehard",
  headerTitle: "wufwuf",
  description: "wufwufsocial",
  language: "en-us",
  theme: "system", // system, dark or light
  siteUrl: "https://www.wufwuf.io", // your website URL
  siteLogo: "/logo.png",
  socialBanner: "/social-banner.png", // add social banner in the public folder
  // email: "lumungep12@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=100073434946866",
  // instagram: "https://facebook.com",
  linkedin: "https://www.linkedin.com/company/wufwuf1/",
  github: "https://github.com/lumunge",
  twitter: "https://twitter.com/_wufwuf",
  locale: "en-US",
};
