"use client";
import axios from "axios";
import moment from "moment";

import { useCallback, useState, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";

// material components
import { Box, Avatar } from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { useEffect } from "react";
// date formatter

// import { useCommentHandler } from "../../lib/comment";

import styles from "../../styles/competitions.module.css";
// import { fetcher } from "../../lib/fetch";
// import Spinner from "../Spinner/Spinner";
// import { mutate } from "swr";

const GiveawayCommentList = ({
  loadingComment,
  setLoadingComment,
  likeComment,
  commentsMutate,
  comments,
  //   size,
  //   setSize,
  //   is_reaching_end,
  //   is_loading_more,
  //   mutate,
  //   set_reply_to,
}) => {
  //   const [show_replies, set_show_replies] = useState(false);

  //   const [like_comment_reply, set_like_comment_reply] = useState("");

  //   const reply_ref = useRef();

  //   let now = moment();
  // const { data, size, setSize, is_loading_more, is_reaching_end, mutate } =
  //   useCommentHandler({ competition_id: competition_id });

  // const comments = data
  //   ? data.reduce((acc, val) => [...acc, ...val.comments], [])
  //   : [];
  const userProfile = useSelector((state) => state.auth.profile);

  //   const current_userprofile = useSelector(
  //     (state) => state.profile.current_userprofile
  //   );

  // const likeComment = async (e, commentId) => {
  //   setLoadingComment(true);
  //   e.preventDefault();

  //   try {
  //     console.log(`liking comment ${commentId} as ${userProfile?.uuid}`);

  //     const response = await axios.patch(
  //       `/api/giveaways/like_comment`,
  //       {
  //         commentId: commentId,
  //         userId: userProfile?.uuid,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     commentsMutate();

  //     console.log("RESPONSE HERE");
  //     console.log(response);
  //   } catch (error) {
  //     console.log("Error liking comment");
  //     console.log(error.message);
  //     setLoadingComment(false);
  //   } finally {
  //     // stop loading here
  //     setLoadingComment(false);
  //   }
  // };

  //   const like_reply = useCallback(
  //     async (e, reply_id) => {
  //       set_is_loading(true);
  //       e.preventDefault();

  //       try {
  //         console.log(`liking reply ${reply_id} as ${current_userprofile.uuid}`);

  //         const response = await fetcher(
  //           `/api/comments/replies/${competition_id}`,
  //           {
  //             method: "PATCH",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               reply_id: reply_id,
  //               user_id: current_userprofile.uuid,
  //             }),
  //           }
  //         );

  //         mutate();
  //       } catch (error) {
  //         console.log("Error liking reply");
  //         console.log(error.message);
  //       } finally {
  //         set_is_loading(false);
  //       }
  //     },
  //     [mutate, like_comment_reply]
  //   );

  //   useEffect(() => {
  //     console.log("COMMENTS");
  //     console.log(comments);
  //   });

  return (
    <>
      {comments && comments?.length > 0 ? (
        <div
          className="scroll_style bg-customPrimary rounded-xl"
          style={{
            maxHeight: "40vh",
            overflowY: "scroll",
            overflowX: "hidden",
            // display: "inline-block",
          }}
        >
          {comments.map((single_comment, index) => (
            <div key={index} className="flex items-start">
              <Avatar
                alt={"/default_profile.png"}
                src={
                  single_comment?.user?.profilePicture || "/default_profile.png"
                }
                sx={{ margin: "1rem 5px 0 5px" }}
              />
              <div
                key={index}
                style={{
                  backgroundColor: "#19205f",
                  padding: "10px",
                  margin: "1rem 0",
                  borderRadius: "10px",
                  color: "#fff",
                  width: "80%",
                  display: "flex",
                  flexWrap: "nowrap",
                  overflowWrap: "break-word",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <p className="text-[]#9f9f9f font-semibold text-sm">
                        @{single_comment?.user?.username}
                      </p>
                      <span className="text-xs text-[#9f9f9f]">
                        {moment(single_comment?.createdAt).fromNow()}
                      </span>
                    </div>

                    <div className="">
                      <p className="text-white font-medium text-md">
                        {single_comment.text}
                      </p>
                    </div>

                    {/* <div className="flex items-center">
                      <div className="flex items-center gap-1">
                        <FavoriteBorderIcon
                          sx={{
                            fontSize: "1.1rem",
                            color: "#ff5733",
                          }}
                        />
                        {single_comment?.likes && (
                          <span className="text-xs">
                            {single_comment?.likes.length}
                          </span>
                        )}
                      </div>
                    </div> */}

                    <Box
                      sx={{
                        display: "flex",
                        width: "70%",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      {/* <Typography variant="caption">
                        {now.diff(single_comment.createdAt, "days")} d
                      </Typography> */}

                      {/* <Typography variant="caption">
                        {single_comment?.likes?.length || 0} likes
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "600", cursor: "pointer" }}
                        onClick={() => {
                          set_reply_to({
                            comment_id: single_comment?._id,
                            username: single_comment?.user?.username,
                            user_id: single_comment?.user?._id,
                          });
                          console.log(`replying to @${single_comment?._id}`);
                        }}
                      >
                        Reply
                      </Typography> */}
                    </Box>

                    {/* <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {single_comment?.replies?.length > 0 && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "2px",
                              backgroundColor: "#9f9f9f",
                            }}
                          ></div>
                          <IconButton
                            onClick={() => {
                              set_show_replies(!show_replies);
                              console.log("showing...");
                            }}
                            sx={{
                              borderRadius: "20px 0 0 20px",
                              color: "#9f9f9f",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ pl: 2 }}
                              // onClick={() => set_show_replies(!show_replies)}
                            >
                              {!show_replies ? "View" : "Hide"} replies
                              {!show_replies &&
                                `(${single_comment?.replies?.length})`}
                            </Typography>
                          </IconButton>
                        </Box>
                      )}

                      {show_replies && (
                        <>
                          {single_comment?.replies?.map((reply, index) => (
                            <Grid
                              key={index}
                              sx={{
                                width: "100%",
                                margin: "10px 0 10px 20px",
                                // bgcolor: "red",
                              }}
                            >
                              <Grid
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Avatar
                                  alt={"/default_profile.png"}
                                  src={
                                    reply?.user[0]?.profilePicture ||
                                    "/default_profile.png"
                                  }
                                />

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#fff",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {reply?.user[0]?.username}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#9f9f9f",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    @{reply?.to[0]?.username}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      inlineSize: "100px",
                                      overflowWrap: "break-word",
                                    }}
                                  >
                                    {reply.reply}
                                  </Typography>
                                </Box>

                                <Box>
                                  <IconButton
                                    onClick={(e) => {
                                      set_like_comment_reply(reply._id);
                                      like_reply(e, reply._id);
                                    }}
                                  >
                                    {reply?.likes?.includes(
                                      current_userprofile.uuid
                                    ) ? (
                                      <FavoriteIcon
                                        sx={{
                                          fontSize: "1.1rem",
                                          color: "#ff5733",
                                        }}
                                      />
                                    ) : (
                                      <FavoriteBorderIcon
                                        sx={{
                                          fontSize: "1.1rem",
                                          color: "#9f9f9f",
                                        }}
                                      />
                                    )}
                                  </IconButton>
                                </Box>
                              </Grid>

                              <Grid
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "space-around",
                                  mt: 1,
                                }}
                              >
                                <Typography variant="caption">
                                  {now.diff(reply.createdAt, "days")} d
                                </Typography>

                                <Typography variant="caption">
                                  {reply?.likes?.length || 0} likes
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    set_reply_to({
                                      comment_id: single_comment?._id,
                                      username: reply?.user[0]?.username,
                                      user_id: reply?.user[0]?._id,
                                    });
                                    console.log(
                                      `replying to @${reply?.user[0]?.username}`
                                    );
                                  }}
                                >
                                  Reply
                                </Typography>
                              </Grid>
                            </Grid>
                          ))}
                        </>
                      )}
                    </Box> */}
                  </div>

                  {/* <div
                    style={{
                      position: "absolute",
                      top: "-10%",
                      right: "-1%",
                    }}
                  >
                    <button
                      disabled={loadingComment}
                      onClick={(e) => {
                        likeComment(e, single_comment._id);
                      }}
                    >
                      {single_comment?.likes?.includes(userProfile?.uuid) ? (
                        <FavoriteIcon
                          sx={{
                            fontSize: "1.1rem",
                            color: "#ff5733",
                          }}
                        />
                      ) : (
                        <FavoriteBorderIcon
                          sx={{
                            fontSize: "1.1rem",
                            color: "#9f9f9f",
                          }}
                        />
                      )}
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          ))}
          {/* <Grid container>
            {is_reaching_end ? (
              <Typography
                variant="caption"
                sx={{ color: "#9f9f9f", margin: "0 auto" }}
              >
                You&#x27;ve reached the end.
              </Typography>
            ) : (
              <>
                {is_loading_more ? (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Spinner />
                  </Box>
                ) : (
                  <Button
                    sx={{
                      backgroundColor: "#222840",
                      borderRadius: "10px",
                      color: "#fff",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      letterSpacing: "2px",
                      padding: "5px 1rem",
                      margin: "1rem auto",
                    }}
                    onClick={() => setSize(size + 1)}
                  >
                    Load more
                  </Button>
                )}
              </>
            )}
          </Grid> */}
          {/* <div className={styles.scrollbar2}>
            <div className={styles.div_child2}></div>
          </div> */}
        </div>
      ) : (
        <div className="flex justify-center">
          <p className="text-white text-xs md:text-sm">No comments yet.</p>
        </div>
      )}
    </>
  );
};

export default GiveawayCommentList;
