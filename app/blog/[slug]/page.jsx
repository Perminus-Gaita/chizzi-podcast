import BlogContent from "./client";
import { allBlogs } from "../../../.contentlayer/generated";
import { getPublishedBlogs, siteMetadata } from "../../../utils/blog";

const publishedBlogs = getPublishedBlogs();

export async function generateStaticParams() {
  // return allBlogs.map((blog) => ({ slug: blog._raw.flattenedPath }));
  return publishedBlogs.map((blog) => ({ slug: blog._raw.flattenedPath }));
}

export async function generateMetadata({ params }) {
  const blog = publishedBlogs.find(
    (blog) => blog._raw.flattenedPath === params.slug
  );
  if (!blog) return;
  const publishedAt = new Date(blog.publishedAt).toISOString();
  const modifiedAt = new Date(blog.updatedAt || blog.publishedAt).toISOString();
  let imageList = [siteMetadata.socialBanner];
  if (blog.image) {
    imageList =
      typeof blog.image.filePath === "string"
        ? [siteMetadata.siteUrl + blog.image.filePath.replace("../public", "")]
        : blog.image;
  }
  const ogImages = imageList.map((img) => ({
    url: img.includes("http") ? img : siteMetadata.siteUrl + img,
  }));
  const authors = blog?.author ? [blog.author] : siteMetadata.author;
  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: siteMetadata.siteUrl + blog.url,
      siteName: siteMetadata.title,
      locale: "en_US",
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: ogImages,
    },
  };
}

const BlogPage = ({ params }) => {
  const blog = publishedBlogs.find(
    (blog) => blog._raw.flattenedPath === params.slug
  );
  if (!blog) return null;
  return (
    <BlogContent blog={blog} siteMetadata={siteMetadata} slug={params.slug} />
  );
};

export default BlogPage;
