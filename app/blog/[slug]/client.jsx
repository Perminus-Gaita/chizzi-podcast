"use client";
import React from "react";
import { slug as slugify } from "github-slugger";
import Image from "next/image";
import dynamic from "next/dynamic";
import Script from "next/script";

// Dynamically import client-only components
const BlogDetails = dynamic(
  () => import("@/page_components/Blog/BlogDetails"),
  { ssr: false }
);
const RenderMdx = dynamic(
  () => import("@/page_components/Blog/RenderMdx"),
  { ssr: false }
);
const Tag = dynamic(
  () => import("@/page_components/Blog/Tag"),
  { ssr: false }
);

const BlogContent = ({ blog, siteMetadata, slug: pageSlug }) => {
  let imageList = [siteMetadata.socialBanner];
  if (blog.image) {
    imageList =
      typeof blog.image.filePath === "string"
        ? [siteMetadata.siteUrl + blog.image.filePath.replace("../public", "")]
        : blog.image;
  }

  const jsonLd = {
    "@context": "https:",
    "@type": "NewsArticle",
    headline: blog.title,
    description: blog.description,
    image: imageList,
    datePublished: new Date(blog.publishedAt).toISOString(),
    dateModified: new Date(blog.updatedAt || blog.publishedAt).toISOString(),
    author: [
      {
        "@type": "Person",
        name: blog?.author ? blog.author : siteMetadata.author,
        url: siteMetadata.twitter,
      },
    ],
  };

  return (
    <>
      <Script id="json-ld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
      <article>
        <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
          <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Tag
              name={blog.tags[0]}
              link={`/categories/${slugify(blog.tags[0])}`}
              className="px-6 text-sm py-2"
            />
            <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
              {blog.title}
            </h1>
          </div>
          <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
          <Image
            src={blog.image.filePath.replace("../public", "")}
            placeholder="blur"
            blurDataURL={blog.image.blurhashDataUrl}
            alt={blog.title}
            width={blog.image.width}
            height={blog.image.height}
            className="aspect-square w-full h-full object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>
        <BlogDetails blog={blog} slug={pageSlug} />
        <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 mb-20 px-5 md:px-10">
          <div className="col-span-12 lg:col-span-4">
            <details
              className="scroll_style border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
              open
            >
              <summary className="text-lg font-semibold capitalize cursor-pointer">
                Table Of Contents
              </summary>
              <ul className="mt-4 font-in text-base">
                {blog.toc.map((heading) => (
                  <li key={`#${heading.slug}`} className="py-1">
                    <a
                      href={`#${heading.slug}`}
                      data-level={heading.level}
                      className="data-[level=two]:pl-0 data-[level=two]:pt-2 data-[level=two]:border-t border-solid border-dark/40 data-[level=three]:pl-4 sm:data-[level=three]:pl-6 flex items-center justify-start"
                    >
                      {heading.level === "three" && (
                        <span className="flex w-1 h-1 rounded-full bg-dark mr-2">
                          &nbsp;
                        </span>
                      )}
                      <span className="hover:underline">{heading.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>
          <RenderMdx blog={blog} />
        </div>
      </article>
    </>
  );
};

export default BlogContent;
