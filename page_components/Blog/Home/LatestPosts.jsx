import Link from "next/link";

import { sortBlogs } from "../../../utils/blog";
import BlogLayout3 from "../BlogLayout3";

const LatestPosts = ({ blogs }) => {
  const sortedBlogs = sortBlogs(blogs);
  return (
    <section
      className="w-full flex flex-col items-center justify-center"
      style={{
        minHeight: "100vh",
      }}
    >
      <div className="w-full flex  justify-between">
        <h2 className="w-fit inline-block font-bold capitalize text-2xl md:text-4xl text-dark dark:text-light">
          Recent Posts
        </h2>
        <Link
          href="/blog/all-posts/1"
          className="inline-block font-medium text-accent dark:text-accentDark underline underline-offset-2  text-dark dark:text-white text-base md:text-lg"
        >
          view all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-16 mt-16">
        {sortedBlogs.slice(4, 10).map((blog, index) => {
          return (
            <article key={index} className="col-span-1 row-span-1 relative">
              <BlogLayout3 blog={blog} />
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default LatestPosts;
