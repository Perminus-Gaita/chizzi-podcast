import ClientPage from './client';
import Layout from "@/page_components/Shared/Layout/CommunityLayout";

export const metadata = {
  title: "Chizzi Podcast",
  description: "Chizzi Podcast's official website featuring games, leaderboards and shows.",
};

export default function Page() {
  return (
    <Layout>
      <ClientPage />
    </Layout>
  );
}