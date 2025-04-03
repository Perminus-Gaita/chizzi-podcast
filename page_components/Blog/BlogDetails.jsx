import { format, parseISO } from "date-fns";
import Link from "next/link";
import { slug } from "github-slugger";

const BlogDetails = ({ blog, slug: blogSlug }) => {
  return (
    <div
      className="px-4 md:px-10 bg-accent/10 dark:bg-accentDark/10 text-dark dark:text-light 
      py-3 flex flex-wrap items-center justify-center gap-4 text-sm md:text-base font-medium 
      mx-4 md:mx-10 rounded-lg backdrop-blur-sm"
    >
      <time className="flex items-center gap-1">
        <span className="hidden md:inline">📅</span>
        {format(parseISO(blog.publishedAt), "LLLL d, yyyy")}
      </time>
      <div className="flex items-center gap-1">
        <span className="hidden md:inline">⏱️</span>
        {blog.readingTime.text}
      </div>
      <Link
        href={`/categories/${slug(blog.tags[0])}`}
        className="hover:text-accent dark:hover:text-accentDark transition-colors"
      >
        #{blog.tags[0]}
      </Link>
    </div>
  );
};

export default BlogDetails;
