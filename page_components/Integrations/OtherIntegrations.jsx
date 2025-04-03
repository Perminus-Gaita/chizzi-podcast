"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";

const OtherIntegrations = () => {
  const pathname = usePathname();

  const integrations = [
    {
      name: "facebook",
      contentTypes: "Images, Videos, Reels, Stories",
      copy: "Dazzle your audience! Share captivating images, engaging stories, dynamic reels, and compelling videos on Facebook. Unleash your creativity and stand out in the feed.",
      gradient: "rgba(24, 119, 242, 1)",
      url: "/facebook-integration",
    },
    {
      name: "instagram",
      contentTypes: "Images, Videos, Reels, Stories",
      copy: "Create a stunning feed! From eye-catching images and captivating stories to interactive carousels, dynamic videos, and trendy reels—showcase your brand's personality on Instagram.",
      gradient: "rgba(228, 64, 95, 1)",
      url: "/instagram-integration",
    },
    {
      name: "youtube",
      contentTypes: "Shorts, Videos",
      copy: "Lights, camera, action! Share your story with the world through videos and shorts on YouTube. Capture attention and build your audience on this global video platform.",
      gradient: "rgba(255, 0, 0, 1)",
      url: "/youtube-integration",
    },
    {
      name: "tiktok",
      contentTypes: "Images, Videos",
      copy: "Ignite the trend! Share vibrant videos and striking images on TikTok. Join the short-form content revolution and become the talk of the town.",
      gradient: "rgba(105, 201, 208, 1)",
      url: "/tiktok-integration",
    },
  ];

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name + "-integration" !== pathname.replace("/", "")
  );

  const slideLeft = () => {
    let slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft - 235;
  };

  const slideRight = () => {
    let slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft + 235;
  };
  return (
    <>
      <div>
        <div>
          <h1 className="text-white font-bold text-4xl">More Integrations</h1>
        </div>

        <div
          className="flex flex-col justify-center"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            height: "100%",
          }}
        >
          <div className="flex justify-end">
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-full"
                style={{
                  background: "rgba(25, 32, 95, 0.37)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(25, 32, 95, 1)",
                }}
                onClick={slideLeft}
              >
                <KeyboardArrowLeftOutlinedIcon sx={{ color: "#9f9f9f" }} />
              </button>
              <button
                className="p-2 rounded-full"
                style={{
                  background: "rgba(25, 32, 95, 0.37)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(25, 32, 95, 1)",
                }}
                onClick={slideRight}
              >
                <KeyboardArrowRightOutlinedIcon sx={{ color: "#9f9f9f" }} />
              </button>
            </div>
          </div>
          <div
            className="xScrollStyle"
            id="slider"
            style={{
              display: "flex",
              gap: "2.2rem",
              overflowX: "scroll",
              overflowY: "hidden",
              whiteSpace: "wrap",
              scrollBehavior: "smooth",
              position: "relative",
              padding: "1rem 0.6rem",
            }}
          >
            {filteredIntegrations.map((integration, index) => (
              <div
                key={index}
                className="p-6 rounded-lg flex flex-col justify-between h-full md:h-96"
                style={{
                  boxShadow: `${integration.gradient} -4px 9px 25px -6px`,
                  background: "rgba(25, 32, 95, 0.37)",
                  borderRadius: "16px",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${integration.gradient}`,
                  minWidth: "300px",
                  minHeight: "450px",
                }}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={`/${integration.name}.png`}
                    width={60}
                    height={60}
                  />

                  <div className="flex flex-col">
                    <p className="text-xl md:text-3xl text-white capitalize font-bold">
                      {integration.name}
                    </p>
                    <p className="text-sm text-[#9f9f9f]">
                      {integration.contentTypes}
                    </p>
                  </div>
                </div>

                <div style={{ width: "90%" }}>
                  <p className="text-white text-lg">{integration.copy}</p>
                </div>

                <div>
                  <Link href={integration.url}>
                    <button
                      className="text-white px-4 py-2 font-bold flex gap-1 hover:gap-2 transition-all ease-in-out duration-200"
                      style={{
                        background: "rgba(25, 32, 95, 0.37)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(25, 32, 95, 1)",
                      }}
                    >
                      Explore
                      <ArrowForwardIcon sx={{ ml: 1 }} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default OtherIntegrations;
