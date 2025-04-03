"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
  const router = useRouter();

  return (
    <button
      color="inherit"
      aria-label="open drawer"
      edge="start"
      onClick={() => router.push("/")}
    >
      {" "}
      <Image src="/wufwuf_logo.png" width={80} height={50} />
    </button>
  );
};

export default Logo;
