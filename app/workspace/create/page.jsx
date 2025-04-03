import WorkspaceCreationForm from "./client";

export const metadata = {
  title: "Create Workspace: Wufwuf - Set Up Your New Workspace",
  description: "Create a new workspace on Wufwuf.io. Set up your profile and get started with your project management.",
  keywords: [
    "workspace creation",
    "project management",
    "team collaboration",
    "wufwuf",
  ],
  openGraph: {
    title: "Create Your Workspace on Wufwuf.io",
    description: "Set up your new workspace on Wufwuf.io and start managing your projects efficiently.",
    image: "https://www.wufwuf.io/public/wufwuf_logo_1.png",
  },
};

const WorkspaceCreationPage = () => {
  return <WorkspaceCreationForm />;
};

export default WorkspaceCreationPage;