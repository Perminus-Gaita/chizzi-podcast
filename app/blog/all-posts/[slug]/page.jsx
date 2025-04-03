import Link from "next/link";
import AllPosts from "@/page_components/Blog/AllPosts";
import { allBlogs } from "../../../../.contentlayer/generated";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { getPublishedBlogs } from "@/utils/blog";

const publishedBlogs = getPublishedBlogs();

const POSTS_PER_PAGE = 10;

export async function generateStaticParams() {
  const totalPosts = publishedBlogs.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    slug: (i + 1).toString(),
  }));
}

const Pagination = ({ currentPage, totalPages }) => {
  const pageNumbers = [];

  // Add page numbers with ellipsis
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  return (
    <div className="w-full flex justify-center py-10">
      <div
        className="flex items-center gap-4 px-10 py-4 rounded-xl"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
        }}
      >
        {currentPage > 1 && (
          <Link href={`/blog/all-posts/${currentPage - 1}`}>
            <button
              disabled={currentPage === 1}
              className="p-1 md:p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 
                 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
        )}

        {pageNumbers.map((number, index) => (
          <Link key={index} href={`/blog/all-posts/${number}`}>
            <button
              key={index}
              className={`px-2 py-1 md:px-4 md:py-2 rounded-lg border dark:border-gray-600
                    ${
                      currentPage === number
                        ? "bg-primary text-light dark:text-dark"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    ${typeof number !== "number" ? "cursor-default" : ""}
                    transition-colors`}
            >
              {number}
            </button>
          </Link>
        ))}

        {currentPage < totalPages && (
          <Link href={`/blog/all-posts/${currentPage + 1}`}>
            <button
              className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 
                 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default async function AllPostsPage(props) {
  const params = await props.params;
  const page = parseInt(params.slug) || 1;
  const totalPosts = publishedBlogs.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const posts = publishedBlogs
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div>
      <main
        className="h-full flex flex-col gap-10 justify-center 
      mx-auto px-2 py-20 max-w-7xl"
      >
        <AllPosts blogs={posts} />
      </main>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
