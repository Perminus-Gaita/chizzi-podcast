"use client";

const HomeHeader = () => {
  return (
    <header className="flex flex-col gap-6 py-6 md:py-10 w-full">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center md:text-left">
            Wufwuf Blog
          </h1>
        </div>

        <div className="flex-1">
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 text-center md:text-left leading-relaxed">
            Discover cutting-edge automation tips, engagement hacks, and
            marketing insights powered by Wufwuf. Perfect for busy
            entrepreneurs, growing businesses, and savvy agencies.
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />
    </header>
  );
};

export default HomeHeader;
