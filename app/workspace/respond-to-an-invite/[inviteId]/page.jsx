import WorkspaceInviteResponse from "./client";

export const metadata = {
  title: "Respond to Workspace Invitation - Wufwuf",
  description: "Accept or decline a workspace invitation on Wufwuf platform",
  keywords: [
    "workspace invitation",
    "collaboration",
    "team workspace",
    "wufwuf",
    "workspace management",
  ],
};

const Page = () => {
  return <WorkspaceInviteResponse />;
};

export default Page;
