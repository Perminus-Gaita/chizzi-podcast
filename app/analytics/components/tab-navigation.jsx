"use client";
import React from 'react';
import { BarChart2, DollarSign, Trophy } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";

const tabConfig = {
  overview: {
    icon: (isSelected) => <BarChart2 className={cn(
      "w-4 h-4",
      isSelected ? "text-blue-500" : "text-muted-foreground"
    )} />,
    label: 'Overview',
    brandColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20'
  },
  revenue: {
    icon: (isSelected) => <DollarSign className={cn(
      "w-4 h-4",
      isSelected ? "text-green-500" : "text-muted-foreground"
    )} />,
    label: 'Revenue',
    brandColor: 'text-green-500',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20'
  },
  tournaments: {
    icon: (isSelected) => <Trophy className={cn(
      "w-4 h-4",
      isSelected ? "text-amber-500" : "text-muted-foreground"
    )} />,
    label: 'Tournaments',
    brandColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20'
  }
};

const TabNavigation = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedTab = searchParams.get('tab') || 'overview';

  const updateUrl = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    router.push(`?${newParams.toString()}`, { shallow: true });
  };

  return (
    <div className="w-full">
      <div className="border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex overflow-x-auto scrollbar-hide">
            {Object.entries(tabConfig).map(([tab, { icon, label, brandColor, bgColor }]) => (
              <button
                key={tab}
                onClick={() => updateUrl(tab)}
                className={cn(
                  "flex items-center px-6 py-3 flex-shrink-0",
                  "transition-all duration-200",
                  selectedTab === tab ? bgColor : "hover:bg-muted/50"
                )}
              >
                <div className="mr-2">{icon(selectedTab === tab)}</div>
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  selectedTab === tab ? brandColor : "text-muted-foreground"
                )}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-0">
        {children}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TabNavigation;