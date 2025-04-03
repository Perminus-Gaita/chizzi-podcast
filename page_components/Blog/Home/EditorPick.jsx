import { sortBlogs } from "../../../utils/blog";
import BlogLayout1 from "../BlogLayout1";
import BlogLayout2 from "../BlogLayout2";

const EditorPick = ({ blogs }) => {
  const sortedBlogs = sortBlogs(blogs);

  return (
    <section className="w-full flex flex-col gap-4 items-center justify-center">
      <h2 className="w-full inline-block font-bold text-2xl md:text-4xl text-dark dark:text-white">
        Editor's Pick
      </h2>

      <div className="w-full grid grid-cols-2 grid-rows-3 gap-4">
        <article className="col-span-2 md:col-span-1 row-span-1 md:row-span-3 relative">
          <BlogLayout1 blog={sortedBlogs[0]} />
        </article>
        <article className="col-span-2 md:col-span-1 row-span-1 relative">
          <BlogLayout2 blog={sortedBlogs[1]} />
        </article>
        <article className="col-span-2 md:col-span-1 row-span-1 relative">
          <BlogLayout2 blog={sortedBlogs[2]} />
        </article>
        <article className="col-span-2 md:col-span-1 row-span-1 relative">
          <BlogLayout2 blog={sortedBlogs[3]} />
        </article>
      </div>
    </section>
  );
};

export default EditorPick;
