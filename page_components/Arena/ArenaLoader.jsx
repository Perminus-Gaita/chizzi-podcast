"use client";
import { Skeleton } from "@/components/ui/skeleton";

const ArenaLoader = () => {
  return (
    <div className="flex flex-col gap-8 p-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};

export default ArenaLoader;
