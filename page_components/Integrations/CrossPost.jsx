import Image from "next/image";

const CrossPost = ({ platformDesc }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <section>
        <p>{platformDesc}</p>
      </section>
      <section className="flex items-center gap-4">
        <Image
          src={"/facebook.png"}
          alt="facebook_logo"
          width={100}
          height={100}
        />
        <Image
          src={"/instagram.png"}
          alt="instagram_logo"
          width={100}
          height={100}
        />
        <Image
          src={"/youtube.png"}
          alt="youtube_logo"
          width={100}
          height={100}
        />
        <Image src={"/tiktok.png"} alt="tiktok_logo" width={100} height={100} />
      </section>
    </div>
  );
};

export default CrossPost;
