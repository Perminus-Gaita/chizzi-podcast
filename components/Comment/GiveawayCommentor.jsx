import Link from "next/link";
import axios from "axios";

import { useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Avatar } from "@mui/material";

import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import { createNotification } from "../../app/store/notificationSlice";

const GiveawayCommentor = ({
  commentsMutate,
  entryId,
  profilePicture,
  // replyTo,
  // setReplyTo
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const userProfile = useSelector((state) => state.auth.profile);

  const comment_ref = useRef();

  //   const { mutate } = useCommentHandler({ giveawayId });

  //   const { data } = useUserHandler();
  //   const is_logged_in = data?.user !== null;

  // user redux states

  const createComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // setisLoading here

      const response = await axios.post(
        `/api/giveaways/insert_comment`,
        {
          entryId: entryId,
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

      commentsMutate();

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

  //   const create_reply = useCallback(
  //     async (e) => {
  //       e.preventDefault();

  //       // console.log("replying now...", reply_to);

  //       try {
  //         // start loading
  //         const response = await fetcher(
  //           `/api/comments/replies/${reply_to.comment_id}`,
  //           {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               to: reply_to.user_id,
  //               reply: comment_ref.current.value,
  //             }),
  //           }
  //         );

  //         dispatch(
  //           create_notification({
  //             open_comment: true,
  //             type_comment: "info",
  //             message_comment: "Success!",
  //           })
  //         );

  //         setTimeout(() => {
  //           dispatch(
  //             create_notification({
  //               open_comment: false,
  //               type_comment: "",
  //               message_comment: "",
  //             })
  //           );
  //         }, 2000);

  //         mutate();
  //       } catch (error) {
  //         console.log("Error replying to comment");
  //         console.log(error.message);
  //       } finally {
  //         // stop loading
  //         comment_ref.current.value = "";
  //         set_reply_to(null);
  //       }
  //     },
  //     [mutate, reply_to]
  //   );

  return (
    <>
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
                src={profilePicture}
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
              <button disabled={loading} onClick={(e) => createComment(e)}>
                <SendOutlinedIcon sx={{ color: "#fff", fontSize: "1.8rem" }} />
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
    </>
  );
};

export default GiveawayCommentor;
