import React from "react";

const Benefits = ({ title, description, index }) => {
  return (
    <div
      className={
        index % 2 === 0
          ? "flex flex-col md:flex-row-reverse items-center w-full my-8 gap-8"
          : "flex flex-col md:flex-row items-center w-full my-8 gap-8"
      }
      // className="flex flex-col md:flex-row items-center w-full my-8 gap-8"
      style={{
        display: "flex",
        // flexDirection: index % 2 === 0 ? "row-reverse" : "row",
      }}
    >
      <div className="w-11/12 md:w-1/2">
        <>Image Here</>
      </div>
      <div
        className="w-11/12 md:w-1/2 flex flex-col gap-8 items-center"
        style={{
          textAlign: index % 2 === 0 ? "right" : "left",
        }}
      >
        <h1 className="text-white font-bold text-4xl">{title}</h1>
        <p className="text-[#9f9f9f] text-lg">{description}</p>
      </div>
    </div>
  );
};

export default Benefits;
