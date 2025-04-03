import Settings from "./client";

export const metadata = {
  title: "Settings - Wufwuf: Manage Your Account & Workspace",
  description:
    "Configure your Wufwuf account settings, manage team members, and control workspace permissions. Invite team members, set roles, and customize your workspace experience.",
  keywords: [
    "account settings",
    "workspace management",
    "team collaboration",
    "user permissions",
    "team management",
    "wufwuf",
    "workspace controls",
    "user roles"
  ],
  openGraph: {
    title: "Wufwuf Settings - Manage Your Account & Workspace",
    description:
      "Configure account settings, manage team members, and control workspace permissions in your Wufwuf dashboard.",
    image: "https://www.wufwuf.io/public/wufwuf_logo_1.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wufwuf Settings - Manage Your Account & Workspace",
    description: "Configure account settings, manage team members, and control workspace permissions in your Wufwuf dashboard."
  },
  additionalMetadata: {
    application: "Wufwuf Settings Dashboard",
    type: "settings",
    features: [
      "Account Management",
      "Workspace Settings",
      "Team Management",
      "User Permissions",
      "Workspace Controls"
    ]
  },
};

const Page = () => {
  return <Settings />;
};

export default Page;