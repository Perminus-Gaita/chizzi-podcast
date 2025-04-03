import React from "react";

const IntegrationCTA = ({ title, description }) => {
  return (
    <div
      className="flex flex-col md:flex-row items-center w-full rounded-3xl p-10"
      style={{
        backgroundColor: "rgba(25, 32, 95, 0.5)",
      }}
    >
      <div className="w-full md:w-1/2">
        <>Image Here</>
      </div>
      <div className="w-full md:w-1/2 flex flex-col gap-4 items-center">
        <h1 className="text-white font-bold text-4xl">{title}</h1>
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
          Try 7-Days FREE
        </button>{" "}
      </div>
    </div>
  );
};

export default IntegrationCTA;
