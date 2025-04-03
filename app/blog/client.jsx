"use client";

import { allBlogs } from "../../.contentlayer/generated";
import HomeHeader from "@/page_components/Blog/HomeHeader";
import EditorPick from "../../page_components/Blog/Home/EditorPick";
import LatestPosts from "../../page_components/Blog/Home/LatestPosts";
import { getPublishedBlogs } from "@/utils/blog";

const publishedBlogs = getPublishedBlogs();

const Blog = () => {
  return (
    <main
      className="h-full flex flex-col gap-10 justify-center 
      mx-auto px-2 py-20 max-w-7xl"
      style={{ minHeight: "100vh" }}
    >
      <section className="flex flex-col gap-10">
        <HomeHeader />
        <EditorPick blogs={publishedBlogs} />
      </section>
      <LatestPosts blogs={publishedBlogs} />
    </main>
  );
};

export default Blog;
