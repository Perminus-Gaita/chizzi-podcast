import Admin from "./client";

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

const Page = () => {
  return <Admin />;
};

export default Page;