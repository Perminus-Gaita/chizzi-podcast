"use client";
import Image from "next/image";

const Loader = () => {
  return (
    <div className="spinner-container">
      <Image src="/loader.svg" alt="loader_icon" height="600" width="600" />
    </div>
  );
};

export default Loader;
