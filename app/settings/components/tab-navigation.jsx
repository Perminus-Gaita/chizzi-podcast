"use client";
import React from 'react';
import { Settings, Users, Shield, Info, Layout, Bell, Sliders, UserPlus, Plug2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from 'next/navigation';

const tabConfig = {
  workspaceSettings: { 
    icon: (isSelected) => <Settings selected={isSelected} />,
    label: 'Workspace settings',
    brandColor: 'text-[#1877F2]',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    options: [
      { id: 'Team', label: 'Team management', icon: <Users className="w-4 h-4" />, color: '#4267B2' },
      { id: 'Invite', label: 'Invite users to workspace', icon: <UserPlus className="w-4 h-4" />, color: '#4267B2' },
      { id: 'Controls', label: 'Controls', icon: <Shield className="w-4 h-4" />, color: '#4267B2' },
      { id: 'About', label: 'About workspaces', icon: <Info className="w-4 h-4" />, color: '#4267B2' }
    ]
  },
  accountSettings: {
    icon: (isSelected) => <Settings selected={isSelected} />,
    label: 'Account settings',
    brandColor: 'text-[#FFD700]',
    bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    options: [
      // { id: 'Overview', label: 'Overview', icon: <Layout className="w-4 h-4" />, color: '#FFD700' },
      { id: 'SignInMethods', label: 'Sign-In Methods', icon: <Plug2 className="w-4 h-4" />, color: '#FFD700' },
      // { id: 'Integrations', label: 'Integrations', icon: <Plug2 className="w-4 h-4" />, color: '#FFD700' },
      { id: 'Notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, color: '#FFD700' },
      // { id: 'Invites', label: 'Invites', icon: <UserPlus className="w-4 h-4" />, color: '#FFD700' },
      // { id: 'Controls', label: 'Controls', icon: <Sliders className="w-4 h-4" />, color: '#FFD700' },
    ]
  }
};

const TabNavigation = ({ formOptions }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedParentTab = searchParams.get('tab') || 'workspaceSettings';
  const selectedChildTab = searchParams.get('section') || 'Team';

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

  const navigateToInvite = () => {
    updateUrl('workspaceSettings', 'Invite');
  };

  const CurrentForm = formOptions.find(
    option => option.parentTab === selectedParentTab && option.childTab === selectedChildTab
  )?.component;

  const currentProps = {
    onNavigateToInvite: navigateToInvite
  };

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

      {/* Secondary Navigation. */}
      <div className="overflow-x-auto scrollbar-hide bg-background border-b border-border">
        <div className="flex">
          {tabConfig[selectedParentTab].options.map(({ id, label, icon, color }) => (
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
      {CurrentForm && <CurrentForm {...currentProps} />}

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