import UploadClient from "./client";

export const metadata = {
  title: "S3 File Upload: Your App Name",
  description: "Upload files to S3 with pause and resume functionality.",
};

const Page = () => {
  return <UploadClient />;
};

export default Page;

