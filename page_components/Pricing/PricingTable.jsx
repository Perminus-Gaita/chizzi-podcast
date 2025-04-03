import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { Tooltip, useMediaQuery, useTheme } from "@mui/material";

import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";

const PricingTable = () => {
  //   const infoRef = useRef(null);
  const infoRefs = useRef([]);

  const [open, setOpen] = useState({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleTooltipClose = (id) => {
    setOpen((prevOpen) => ({ ...prevOpen, [id]: false }));
  };

  const handleTooltipOpen = (id) => {
    setOpen((prevOpen) => ({ ...prevOpen, [id]: true }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      infoRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          setOpen((prev) => ({ ...prev, [index]: false }));
        }
      });
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      // className="mx-auto rounded-xl p-4"
      // style={{
      //   display: "grid",
      //   gridTemplateColumns: "auto auto auto auto auto",
      //   gridGap: "20px",
      //   width: "90%",
      //   overflowX: "auto",
      //   boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
      // }}

      className="mx-auto rounded-xl p-4 overflow-x-auto"
      style={{
        display: "grid",
        gridTemplateColumns: isSmallScreen
          ? "repeat(5, minmax(200px, 1fr))"
          : "repeat(5, minmax(150px, 1fr))",
        gridGap: "10px",
        width: "90%",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
      }}
    >
      <div className="01"></div>
      <div className="02">
        <div className="flex justify-center items-center">
          <h4 className="text-xl font-semibold text-white">FREE</h4>
        </div>
      </div>
      <div className="03">
        {" "}
        <div className="flex justify-center items-center">
          <h4 className="text-xl font-semibold text-white">Creator</h4>
        </div>
      </div>
      <div className="04">
        {" "}
        <div className="flex justify-center items-center">
          <h4 className="text-xl font-semibold text-white">Professional</h4>
        </div>
      </div>
      <div className="05">
        {" "}
        <div className="flex justify-center items-center">
          <h4 className="text-xl font-semibold text-white">Agency</h4>
        </div>
      </div>
      <div className="06"></div>
      <div className="08">
        {" "}
        <div className="flex justify-center items-center">
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
            Sign Up
          </button>
        </div>
      </div>
      <div className="08">
        {" "}
        <div className="flex justify-center items-center">
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
          </button>
        </div>
      </div>
      <div className="08">
        {" "}
        <div className="flex justify-center items-center">
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
          </button>
        </div>
      </div>
      <div className="08 flex justify-center items-center">
        <button
          className="text-md text-white rounded-xl font-semibold px-3 md:px-6 py-2 md:py-2.5"
          style={{
            background: "rgb(250,202,0)",
            background:
              "linear-gradient(16deg, rgba(250,202,0,.3) 0%, rgba(0,184,255,0.4290091036414566) 76%)" /* Gradient with blue overlay */,
            "&:hover": {
              transition: "all .3s ease-in-out",
              border: ".1px solid #9f9f9f",
              background:
                "linear-gradient(16deg, rgba(250,202,0,3) 0%, rgba(0,184,255,0.4290091036414566) 76%)" /* Brighter orange on hover */,
            },
          }}
        >
          Start 7-Day FREE Trial
        </button>
      </div>

      {/* SOCIAL ACCOUNTS ROW */}
      <div
        className="09"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">Social Accounts</h4>
        </div>
      </div>

      <div className="10">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">Accounts</h4>

          <Tooltip
            ref={(el) => (infoRefs.current[1] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(1)}
            open={!!open[1]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Publish and schedule posts to any 4 or any 10 accounts depending on the plan."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(1)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>

      <div className="12 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">2</h4>
      </div>

      <div className="12 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">5</h4>
      </div>

      <div className="13 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">10</h4>
      </div>

      <div className="13 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">25</h4>
      </div>

      <div className="14">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">
            Supported Platforms
          </h4>

          <Tooltip
            ref={(el) => (infoRefs.current[2] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(2)}
            open={!!open[2]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title={
              <>
                <p>Wufwuf currently supports:</p>
                <ul>
                  <li>Facebook (profiles, pages, groups)</li>
                  <li>Instagram (personal, business)</li>
                  <li>Youtube (channels)</li>
                  <li>Tiktok (personal, professional)</li>
                </ul>
                <p>We are working to integrate other social media platforms.</p>
              </>
            }
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(2)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>

      <div className="16 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <Image
            src={"/facebook.png"}
            alt="facebook_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/instagram.png"}
            alt="instagram_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/youtube.png"}
            alt="youtube_logo"
            width={20}
            height={20}
          />
          <Image src={"/tiktok.png"} alt="tiktok_logo" width={20} height={20} />
        </div>
      </div>

      <div className="16 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <Image
            src={"/facebook.png"}
            alt="facebook_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/instagram.png"}
            alt="instagra_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/youtube.png"}
            alt="youtube_logo"
            width={20}
            height={20}
          />
          <Image src={"/tiktok.png"} alt="tiktok_logo" width={20} height={20} />
        </div>
      </div>

      <div className="17 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <Image
            src={"/facebook.png"}
            alt="facebook_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/instagram.png"}
            alt="instagra_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/youtube.png"}
            alt="youtube_logo"
            width={20}
            height={20}
          />
          <Image src={"/tiktok.png"} alt="tiktok_logo" width={20} height={20} />
        </div>
      </div>

      <div className="17 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <Image
            src={"/facebook.png"}
            alt="facebook_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/instagram.png"}
            alt="instagra_logo"
            width={20}
            height={20}
          />
          <Image
            src={"/youtube.png"}
            alt="youtube_logo"
            width={20}
            height={20}
          />
          <Image src={"/tiktok.png"} alt="tiktok_logo" width={20} height={20} />
        </div>
      </div>

      <div
        className="18 rounded-md"
        style={{
          backgroundColor: "#9f9f9f",
          gridColumnStart: 1,
          gridColumnEnd: 6,
          height: "1px",
        }}
      ></div>

      <div
        className="18"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">Scheduling</h4>
        </div>
      </div>
      <div className="19">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">
            Scheduling Period
          </h4>
          <Tooltip
            ref={(el) => (infoRefs.current[3] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(3)}
            open={!!open[3]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Schedule posts to be published 2 weeks or 2 months into the future depending on your selected plan."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(3)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>

      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          7 Days In Future
        </h4>
      </div>

      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          30 Days In Future
        </h4>
      </div>

      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          60 Days In Future
        </h4>
      </div>

      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Unlimited</h4>
      </div>

      <div className="22">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">
            Scheduling History
          </h4>
          <Tooltip
            ref={(el) => (infoRefs.current[4] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(4)}
            open={!!open[4]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Maintain a record of your scheduled posts from the past 20 days or 200 days in the past depending on the plan."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(4)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="11 flex justify-center items-center">
        <div>
          <RemoveOutlinedIcon sx={{ color: "#00b8ff" }} />
        </div>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">20 Days In Past</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          200 Days In Past
        </h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          500 Days In Past
        </h4>
      </div>

      <div className="26">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">
            Scheduled Posts
          </h4>
          <Tooltip
            ref={(el) => (infoRefs.current[5] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(5)}
            open={!!open[5]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Schedule up to 30 to 500 posts at a single time."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(5)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">10</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">30</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">500</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Unlimited</h4>
      </div>

      <div
        className="18 rounded-md"
        style={{
          backgroundColor: "#9f9f9f",
          gridColumnStart: 1,
          gridColumnEnd: 6,
          height: "1px",
        }}
      ></div>

      <div
        className="18"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">Content Library</h4>
        </div>
      </div>

      <div className="30">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">Drafts</h4>
          <Tooltip
            ref={(el) => (infoRefs.current[6] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(6)}
            open={!!open[6]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Store up to 30 to 500 draft posts."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(6)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="11 flex justify-center items-center">
        <div>
          <RemoveOutlinedIcon sx={{ color: "#00b8ff" }} />
        </div>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">100</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">500</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Unlimited</h4>
      </div>

      <div
        className="18 rounded-md"
        style={{
          backgroundColor: "#9f9f9f",
          gridColumnStart: 1,
          gridColumnEnd: 6,
          height: "1px",
        }}
      ></div>

      <div
        className="18"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">
            Collaboration Tools
          </h4>
        </div>
      </div>
      <div className="19">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">WorkSpaces</h4>
          <Tooltip
            ref={(el) => (infoRefs.current[7] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(7)}
            open={!!open[7]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Separate workspaces and organize social accounts, drafts and posts"
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(7)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="11 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">1</h4>
      </div>
      <div className="11 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">1</h4>
      </div>
      <div className="11 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">3</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">5</h4>
      </div>
      <div className="22">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">
            Members / Workspace
          </h4>
          <Tooltip
            ref={(el) => (infoRefs.current[8] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(8)}
            open={!!open[8]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Invite team members to your workspace and start collaboration."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(8)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">1</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">1</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">3</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">6</h4>
      </div>

      <div
        className="18 rounded-md"
        style={{
          backgroundColor: "#9f9f9f",
          gridColumnStart: 1,
          gridColumnEnd: 6,
          height: "1px",
        }}
      ></div>

      <div
        className="34"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">Tournaments</h4>
        </div>
      </div>
      <div className="39">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">Participation</h4>
          <Tooltip
            ref={(el) => (infoRefs.current[9] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(9)}
            open={!!open[9]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Host dynamic Kadi Tournaments and attract a growing community. 
            Accommodate a set number of participants, driving more engagement and competition in each event."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(9)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="11 flex justify-center items-center">
        <div>
          <RemoveOutlinedIcon sx={{ color: "#00b8ff" }} />
        </div>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Upto 100</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Upto 500</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Upto 1000</h4>
      </div>

      <div className="39">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">Sponsors</h4>
          <Tooltip
            ref={(el) => (infoRefs.current[11] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(11)}
            open={!!open[11]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Monetize your tournaments by selling merchandise. A percentage of your sales will sponsor the event, allowing you to generate revenue while supporting your community."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(11)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="11 flex justify-center items-center">
        <RemoveOutlinedIcon sx={{ color: "#00b8ff" }} />
      </div>
      <div className="11 flex justify-center items-center">
        <RemoveOutlinedIcon sx={{ color: "#00b8ff" }} />
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>

      <div
        className="18 rounded-md"
        style={{
          backgroundColor: "#9f9f9f",
          gridColumnStart: 1,
          gridColumnEnd: 6,
          height: "1px",
        }}
      ></div>

      <div
        className="34"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">Giveaways</h4>
        </div>
      </div>

      <div className="42">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">Giveaways</h4>
          <Tooltip
            ref={(el) => (infoRefs.current[12] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(12)}
            open={!!open[12]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Create, host and manage engaging Giveaways to drive audience engagement, fostering a vibrant community around your brand."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(12)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="11 flex justify-center items-center">
        <div>
          <RemoveOutlinedIcon sx={{ color: "#00b8ff" }} />
        </div>
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>

      <div
        className="18 rounded-md"
        style={{
          backgroundColor: "#9f9f9f",
          gridColumnStart: 1,
          gridColumnEnd: 6,
          height: "1px",
        }}
      ></div>

      <div
        className="46"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">Other</h4>
        </div>
      </div>
      <div className="47">
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">
            Analytics & Reports
          </h4>
          <Tooltip
            ref={(el) => (infoRefs.current[14] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(14)}
            open={!!open[14]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Track your audience growth and the performance of your posts, including impressions, likes, comments, giveaway, tournament and league engagement."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(14)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Basic(7-day)</h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          Limited(3 Months)
        </h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          Full(Upto 1 Year)
        </h4>
      </div>
      <div className="22 flex justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          Full(Upto 2 Years)
        </h4>
      </div>

      <div>
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">Playing Kadi</h4>
          <Tooltip
            ref={(el) => (infoRefs.current[17] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(17)}
            open={!!open[17]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Experience the thrill of Kadi with friends online."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(17)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>
      <div className="17 flex justify-center items-center">
        <CheckIcon className="text-[#78d64b] mr-2" />
      </div>

      <div
        className="18 rounded-md"
        style={{
          backgroundColor: "#9f9f9f",
          gridColumnStart: 1,
          gridColumnEnd: 6,
          height: "1px",
        }}
      ></div>

      <div
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 6,
        }}
      >
        <div>
          <h4 className="text-xl font-semibold text-white">Support</h4>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-4">
          <h4 className="text-md md:text-lg text-primaryGray">Priority</h4>
          <Tooltip
            ref={(el) => (infoRefs.current[18] = el)}
            placement="top-end"
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(18)}
            open={!!open[18]}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Receive quality support when you need it most. Priority depends on the plan."
          >
            <InfoOutlinedIcon
              onClick={() => handleTooltipOpen(18)}
              sx={{ color: "#00b8ff", fontSize: "20px", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </div>
      <div className="11 flex justify-center items-center">
        <div>
          <RemoveOutlinedIcon sx={{ color: "#00b8ff" }} />
        </div>
      </div>
      <div className="22 flex flex-col justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Low Priority</h4>
        <span className="text-xs md:text-md text-primaryGray">(email)</span>
      </div>
      <div className="22 flex flex-col justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">Medium Priority</h4>
        <span className="text-xs md:text-md text-primaryGray">
          (email + chat)
        </span>
      </div>
      <div className="22 flex flex-col justify-center items-center">
        <h4 className="text-md md:text-lg text-primaryGray">
          Highest Priority
        </h4>
        <span className="text-xs md:text-md text-primaryGray">
          (email + chat)
        </span>
      </div>
    </div>
  );
};

export default PricingTable;
