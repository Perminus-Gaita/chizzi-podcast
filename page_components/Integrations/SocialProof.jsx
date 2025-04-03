import Image from "next/image";

const SocialProof = ({ proofText }) => {
  return (
    <div className="flex flex-col gap-8 w-full items-center justofy-center">
      <div>
        <Image src={"/quote.png"} width={100} height={100} />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <p className="text-[#9f9f9f] text-lg">{proofText}</p>
      </div>
    </div>
  );
};

export default SocialProof;
