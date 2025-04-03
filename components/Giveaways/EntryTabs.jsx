"use client";
import Link from "next/link";
import axios from "axios";
import { useState, useRef } from "react";
import { Avatar } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";

import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import GiveawayCommentList from "../Comment/GiveawayCommentList";
import GiveawayCommentor from "../Comment/GiveawayCommentor";
import { createNotification } from "@/app/store/notificationSlice";

const EntryTabs = ({ entry }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);

  const userProfile = useSelector((state) => state.auth.profile);

  const [loading, setLoading] = useState(false);
  const comment_ref = useRef();

  const createComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // setisLoading here

      const response = await axios.post(
        `/api/giveaways/insert_comment`,
        {
          entryId: entry?._id,
          text: comment_ref.current.value,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("######## COMMENT HERE ###########");
      // console.log(comment_ref.current.value);

      dispatch(
        createNotification({
          open: true,
          type: "success",
          message: "Comment posted successfully.",
        })
      );

      //   dispatch(add_comment(""));
      //   set_new_comment("");
      comment_ref.current.value = "";

      setLoading(false);
    } catch (error) {
      console.log("Error posting comment");
      console.log(error.message);
      setLoading(false);
    } finally {
      // stop loading here
      console.log("stoping loading here");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center py-4 my-4 ">
        <button
          onClick={() => setActiveTab(0)}
          className="w-1/2 cursor-pointer rounded-xl p-2"
          style={{
            backgroundColor: activeTab === 0 && "#19205f",
          }}
        >
          <h4 className="text-white ext-sm md:text-md font-semibold">
            Voters{" "}
            {entry?.votes &&
              entry?.votes?.length > 0 &&
              `(${entry?.votes?.length})`}
          </h4>
        </button>
        <button
          style={{ backgroundColor: activeTab === 1 && "#19205f" }}
          onClick={() => setActiveTab(1)}
          className="flex flex-col md:flex-row items-center justify-around w-1/2 cursor-pointer rounded-xl p-2"
        >
          <h4 className="text-white text-sm md:text-md font-semibold">
            Comments{" "}
            {entry?.comments.length > 0 && `(${entry?.comments.length})`}
          </h4>
        </button>
      </div>

      <div className="flex flex-col gap-8 justify-center">
        <div className="flex justify-center">
          <h4 className="capitalize underline text-white">
            {entry?.username} {activeTab === 0 ? "Voters" : "Comments"}
          </h4>
        </div>

        {activeTab === 0 && (
          <>
            {entry?.votes?.map((voter, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center justify-between p-2 px-2 gap-4"
                style={{
                  boxShadow: `rgba(0, 184, 255, 0.05) -4px 9px 25px -6px`,
                  background: "rgba(25, 32, 95, 0.37)",
                  borderRadius: "16px",
                  backdropFilter: "blur(20px)",
                  border: `1px solid rgba(0, 184, 255, 1)`,
                }}
              >
                <div className="w-full flex items-center justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="text-[#9f9f9f] text-lg md:text-xl font-semibold">
                        {" "}
                        #{index + 1}
                      </span>
                    </div>

                    <Avatar
                      alt="/default_profile.png"
                      src={voter?.user?.profilePicture}
                      sx={{
                        cursor: "pointer",
                        width: "50px",
                        height: "50px",
                        mr: 1,
                      }}
                    />
                    <div className="flex flex-col ">
                      <div className="flex items-center gap-1">
                        <h4 className="font-medium text-md md:text-lg text-white">
                          @{voter?.user?.username}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab == 1 && (
          <div className="flex flex-col gap-2">
            {userProfile ? (
              <div className="flex items-center rounded-lg bg-customPrimary p-1">
                {/* {reply_to && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  mb: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: "#9f9f9f" }}>
                  Replying to @{reply_to.username}
                </Typography>
                <IconButton onClick={() => set_reply_to(null)}>
                  <CloseOutlinedIcon
                    sx={{ fontSize: "1rem", color: "#9f9f9f" }}
                  />
                </IconButton>
              </Box>
            )} */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <div>
                    <Avatar
                      alt="/default_profile.png"
                      src={userProfile?.profilePicture}
                      sx={{
                        cursor: "pointer",
                        width: "40px",
                        height: "40px",
                        mr: 1,
                      }}
                    />
                  </div>

                  <div className="w-full flex justify-center">
                    {!loading ? (
                      <textarea
                        ref={comment_ref}
                        className="bg-transparent border border-1 border-[#9f9f9f] rounded-lg p-1 text-white w-full"
                        placeholder="What do you think?"
                        name="text"
                        // value={postMetadata.facebookDescription}
                        // onChange={handle_metadata}
                        rows="2"
                      />
                    ) : (
                      <span className="text-sm text-[#9f9f9f]">posting...</span>
                    )}
                  </div>

                  <div>
                    {/* <Button onClick={reply_to ? create_reply : create_comment}> */}
                    <button
                      disabled={loading}
                      onClick={(e) => createComment(e)}
                    >
                      <SendOutlinedIcon
                        sx={{ color: "#fff", fontSize: "1.8rem" }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center w-1/2">
                <p className="text-white text-md">
                  <Link href="/auth">
                    <span className="text-[#9f9f9f] underline"> Log In </span>
                  </Link>{" "}
                  to comment
                </p>
              </div>
            )}

            {/* <GiveawayCommentor
              entryId={entry?._id}
              // profilePicture={"/default_profile.png"}
              profilePicture={userProfile?.profile_picture}
            /> */}
            {entry?.comments?.length > 0 ? (
              <GiveawayCommentList
                comments={entry?.comments}
                // likeComment={likeComment}
              />
            ) : (
              <div className="flex justify-center">
                <h4 className="text-[#9f9f9f] text-lg font-light">
                  No Comments
                </h4>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default EntryTabs;
