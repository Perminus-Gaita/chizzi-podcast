import Integrations from "./client";

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

const Page = () => {
  return <Integrations />;
};

export default Page;