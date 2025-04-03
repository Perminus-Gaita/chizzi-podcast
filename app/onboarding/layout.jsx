"use client";
import Script from "next/script";

import ProtectedAppLayout from "@/components/Auth/ProtectedAppLayout";

export default function AppLayout({ children }) {
  return (
    <>
      {/* <Script id="theme-switcher" strategy="beforeInteractive">
        {`if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }`}
      </Script> */}

      <ProtectedAppLayout>
        <div
          className="bg-[#f7f7f7] dark:bg-dark"
          style={{
            width: "95%",
            flexGrow: 1,
            minHeight: "100vh",
          }}
        >
          {children}
        </div>
      </ProtectedAppLayout>
    </>
  );
}
