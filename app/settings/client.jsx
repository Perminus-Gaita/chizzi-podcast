"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TabNavigation from './components/tab-navigation';
// Import tab items
import TeamManagement from './components/tab-items/workspace-settings/team-management/index';
import InviteUsersToWorkspace from './components/tab-items/workspace-settings/invite-users-to-workspace';
import WorkspaceControls from './components/tab-items/workspace-settings/controls';
import AboutWorkspaces from './components/tab-items/workspace-settings/about-workspaces';
import Overview from './components/tab-items/account-settings/overview';
import SignInMethods from './components/tab-items/account-settings/sign-in-methods/index';
import Integrations from './components/tab-items/account-settings/integrations';
import Notifications from './components/tab-items/account-settings/notifications';
import Invites from './components/tab-items/account-settings/invites';
import AccountControls from './components/tab-items/account-settings/controls';

const Settings = () => {
  const formOptions = [
    // Workspace settings
    {
      parentTab: 'workspaceSettings',
      childTab: 'Team',
      component: TeamManagement
    },
    {
      parentTab: 'workspaceSettings',
      childTab: 'Invite',
      component: InviteUsersToWorkspace
    },
    {
      parentTab: 'workspaceSettings',
      childTab: 'Controls',
      component: WorkspaceControls
    },
    {
      parentTab: 'workspaceSettings',
      childTab: 'About',
      component: AboutWorkspaces
    },
    // Account settings
    {
      parentTab: 'accountSettings',
      childTab: 'SignInMethods',
      component: SignInMethods
    },
    // {
    //   parentTab: 'accountSettings',
    //   childTab: 'Integrations',
    //   component: Integrations
    // },
    {
      parentTab: 'accountSettings',
      childTab: 'Notifications',
      component: Notifications
    },
    // {
    //   parentTab: 'accountSettings',
    //   childTab: 'Invites',
    //   component: Invites
    // },
    // {
    //   parentTab: 'accountSettings',
    //   childTab: 'Controls',
    //   component: AccountControls
    // }
  ];

  const formContent = (
    <Card className="bg-card/50 h-full" style={{minHeight: "500px"}}>
      <CardContent className="p-0 h-full">
        <TabNavigation formOptions={formOptions} />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[750px] w-full">
        {formContent}
      </div>
    </div>
  );
};

export default Settings;