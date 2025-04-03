import Image from "next/image";

const Hero = ({ title, description, bannerImageSrc }) => {
  const colorKeywords = (text) => {
    const keywords = {
      YouTube: "rgba(255, 0, 0, 1)", // YouTube red
      Facebook: "rgba(24, 119, 242, 1)", // Facebook blue
      Instagram: "rgba(228, 64, 95, 1)",
      TikTok: "rgba(105, 201, 208, 1)",
    };

    return text
      .split(/(YouTube|Facebook|Instagram|TikTok)/)
      .map((part, index) => {
        if (keywords[part]) {
          return (
            <span key={index} style={{ color: keywords[part] }}>
              {part}
            </span>
          );
        }
        return part;
      });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row items-center w-full">
      <div className="w-11/12 md:w-1/2 rounded-xl">
        <Image
          src={bannerImageSrc}
          alt="banner_image"
          width={1000}
          height={1000}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />{" "}
      </div>
      <div className="w-11/12 md:w-1/2 flex flex-col gap-4 items-center">
        <h1 className="text-white font-bold text-4xl">
          {colorKeywords(title)}
        </h1>
        <p className="text-[#9f9f9f] text-lg">{description}</p>
        <button
          className="text-md text-white rounded-xl font-semibold px-3 md:px-6 py-2 md:py-2.5"
          style={{
            background: "rgb(0,184,255)",
            background:
              "linear-gradient(16deg, rgba(0,184,255,.3) 0%, rgba(250,202,0,0.4290091036414566) 76%)",
            "&:hover": {
              transition: "all .3s ease-in-out",
              border: ".1px solid #9f9f9f",
              background:
                "linear-gradient(16deg, rgba(0,184,255,3) 0%, rgba(250,202,0,0.4290091036414566) 76%)",
            },
          }}
        >
          {" "}
          Start 7-Day FREE Trial
        </button>{" "}
      </div>
    </div>
  );
};

export default Hero;
