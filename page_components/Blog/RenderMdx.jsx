"use client";
import React from "react";
import { useMDXComponent } from "next-contentlayer/hooks";
import Image from "next/image";

const Alert = ({ type = "info", children }) => {
  return (
    <div
      className={`my-4 p-4 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-900 ${
        type === "info" ? "border-blue-500" : "border-yellow-500"
      }`}
    >
      {/* <div className="flex items-center gap-2">
        <span className="font-bold text-sm uppercase">
          {type === "info" ? "Info" : "Variant"}
        </span>
      </div> */}
      <div className="mt-2">{children}</div>
    </div>
  );
};

const Table = ({ headers, rows }) => {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const mdxComponents = {
  Image,
  Alert,
  Table,
};

const RenderMdx = ({ blog }) => {
  const MDXContent = useMDXComponent(blog.body.code);

  return (
    <div
      className="col-span-12 lg:col-span-8 font-in
      prose prose-lg md:prose-xl
      prose-headings:text-dark dark:prose-headings:text-light
      prose-p:text-dark/90 dark:prose-p:text-light/90
      prose-p:leading-relaxed
      prose-li:text-dark/90 dark:prose-li:text-light/90
      prose-strong:text-dark/90 dark:prose-strong:text-light
      prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800
      prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
      prose-blockquote:text-dark/90 dark:prose-blockquote:text-light/90
      prose-blockquote:rounded-r
      prose-a:text-blue-600 dark:prose-a:text-blue-400
      prose-img:rounded-lg
      max-w-none
    "
    >
      <MDXContent components={mdxComponents} />
    </div>
  );
};

export default RenderMdx;
