import ClientPage from './client';
import Layout from "@/page_components/Shared/Layout/CommunityLayout";

export const metadata = {
  title: "Andrew Kibe - All day erry day",
  description: "Andrew Kibe's official website featuring games, leaderboards and shows.",
};

export default function Page() {
  return (
    <Layout>
      <ClientPage />
    </Layout>
  );
}