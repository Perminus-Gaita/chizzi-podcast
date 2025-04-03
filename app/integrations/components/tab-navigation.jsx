"use client";
import React from 'react';
import { MessageCircle, Users } from 'lucide-react'; // Changed from BrandTelegram to MessageCircle
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from 'next/navigation';

const tabConfig = {
  Telegram: {
    icon: (isSelected) => <MessageCircle className={cn(  // Changed from BrandTelegram to MessageCircle
      "w-4 h-4",
      isSelected ? "text-[#0088cc]" : "text-muted-foreground"
    )} />,
    label: 'Telegram',
    brandColor: 'text-[#0088cc]',
    bgColor: 'bg-[#0088cc]/10 dark:bg-[#0088cc]/20',
    options: [
      { 
        id: 'YourGroups', 
        label: 'Your Groups', 
        icon: <Users className="w-4 h-4" />, 
        color: '#0088cc' 
      }
    ]
  }
};

const TabNavigation = ({ formOptions }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedParentTab = searchParams.get('tab') || 'Telegram';
  const selectedChildTab = searchParams.get('section') || 'YourGroups';

  const updateUrl = (parentTab, childTab) => {
    const newParams = new URLSearchParams(searchParams);
    if (parentTab) newParams.set('tab', parentTab);
    if (childTab) newParams.set('section', childTab);
    router.push(`?${newParams.toString()}`, { shallow: true });
  };

  const handleParentTabChange = (parentTab) => {
    const defaultChildTab = tabConfig[parentTab].options[0].id;
    updateUrl(parentTab, defaultChildTab);
  };

  const handleChildTabChange = (childTab) => {
    updateUrl(selectedParentTab, childTab);
  };

  // Use optional chaining and add type checking
  const CurrentForm = React.useMemo(() => {
    const option = formOptions?.find(
      opt => opt.parentTab === selectedParentTab && opt.childTab === selectedChildTab
    );
    return option?.component ? React.createElement(option.component) : null;
  }, [formOptions, selectedParentTab, selectedChildTab]);

  return (
    <div className="w-full">
      {/* Primary Navigation */}
      <div className="border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex overflow-x-auto scrollbar-hide">
            {Object.entries(tabConfig).map(([parentTab, { icon, label, brandColor, bgColor }]) => (
              <button
                key={parentTab}
                onClick={() => handleParentTabChange(parentTab)}
                className={cn(
                  "flex items-center px-6 py-3 flex-shrink-0",
                  "transition-all duration-200",
                  selectedParentTab === parentTab ? bgColor : "hover:bg-muted/50"
                )}
              >
                <div className="mr-2">{icon(selectedParentTab === parentTab)}</div>
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  selectedParentTab === parentTab ? brandColor : "text-muted-foreground"
                )}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="overflow-x-auto scrollbar-hide bg-background border-b border-border">
        <div className="flex">
          {tabConfig[selectedParentTab]?.options.map(({ id, label, icon, color }) => (
            <button
              key={id}
              onClick={() => handleChildTabChange(id)}
              className={cn(
                "px-6 py-2.5 flex items-center space-x-2 flex-shrink-0",
                "transition-all duration-200",
                selectedChildTab === id ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              {React.cloneElement(icon, {
                style: { color: selectedChildTab === id ? color : 'currentColor' },
                className: "w-4 h-4 transition-colors duration-200"
              })}
              <span 
                className="text-sm font-medium whitespace-nowrap transition-colors duration-200"
                style={{ color: selectedChildTab === id ? color : 'var(--tw-text-muted-foreground)' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      {CurrentForm ? CurrentForm : (
        <div className="p-4 text-center text-muted-foreground">
          No component found for {selectedParentTab}/{selectedChildTab}
        </div>
      )}

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