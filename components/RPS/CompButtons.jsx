"use client";
import Image from "next/image";

import MiniLoader from "../Loader/MiniLoader";

const CompButtons = ({
  show_comp_rock,
  show_comp_paper,
  show_comp_scissors,
  wait_opponent,
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center">
        {!show_comp_paper && !show_comp_scissors && (
          <div className="flex flex-col items-center">
            <span style={{ display: show_comp_rock ? "block" : "none" }}>
              <Image
                src={"/rps_assets/rock.png"}
                width={60}
                height={60}
                alt={"rock_image"}
              />
            </span>
            <h4
              className="text-white text-md md:text-lg font-semibold"
              style={{
                display: show_comp_rock ? "block" : "none",
              }}
            >
              Rock
            </h4>
          </div>
        )}

        {!show_comp_rock && !show_comp_scissors && (
          <div className="flex flex-col items-center">
            <span style={{ display: show_comp_paper ? "block" : "none" }}>
              <Image
                src={"/rps_assets/paper.png"}
                width={60}
                height={60}
                alt={"paper_image"}
              />
            </span>
            <h4
              className="text-white text-md md:text-lg font-semibold"
              style={{
                display: show_comp_paper ? "block" : "none",
              }}
            >
              Paper
            </h4>
          </div>
        )}

        {!show_comp_rock && !show_comp_paper && (
          <div className="flex flex-col items-center">
            <span style={{ display: show_comp_scissors ? "block" : "none" }}>
              <Image
                src={"/rps_assets/scissors.png"}
                width={60}
                height={60}
                alt={"scissors_image"}
              />
            </span>
            <h4
              className="text-white text-md md:text-lg font-semibold"
              style={{
                display: show_comp_scissors ? "block" : "none",
              }}
            >
              Scissors
            </h4>
          </div>
        )}
      </div>

      {wait_opponent && (
        <div className="absolute flex flex-col items-center">
          <MiniLoader />

          <h4 className="text-primaryGray font-light text-md">
            Waiting for opponent...
          </h4>

          <h4 className="text-primaryGreen font-medium text-md">
            Opponent made a pick.
          </h4>
        </div>
      )}
    </div>
  );
};

export default CompButtons;
