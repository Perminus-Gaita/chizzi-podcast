"use client";
import Link from "next/link";
import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import {
  MessageSquare,
  Send,
  Pin,
  Share2,
  Heart,
  Reply,
  Award,
  MoreHorizontal,
  AlertCircle,
  User,
  ArrowUp,
  Fire,
  ThumbsUp,
} from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTournamentComments } from "@/lib/tournament";
import EmojiPicker from "@/components/EmojiPicker";

const CommentSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"
  >
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="space-y-1">
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  </motion.div>
);

const ErrorState = ({ onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 text-center"
  >
    <div className="mb-4">
      <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Unable to load comments</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      This could be due to a network issue or the server being unavailable.
    </p>
    <Button onClick={onRetry} variant="outline">
      Try Again
    </Button>
  </motion.div>
);

const OfflineState = () => (
  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 mb-4">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700 dark:text-yellow-200">
          You're currently offline. Comments will sync when you're back online.
        </p>
      </div>
    </div>
  </div>
);

const CommentCard = ({
  comment,
  isReply,
  depth = 0,
  isCreator,
  onDelete,
  onReply,
  handleReaction,
  tournamentId,
  commentsMutate,
}) => {
  const userProfile = useSelector((state) => state.auth.profile);

  const [showReplies, setShowReplies] = useState(depth < 2);
  const isLikedByUser = comment.likes?.includes(userProfile?.uuid);
  const canDelete = userProfile?.uuid === comment.userId._id || isCreator;

  const handleReply = (parentComment) => {
    onReply({
      _id: parentComment._id,
      userId: parentComment.userId,
      username: parentComment.userId.username,
    });
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/tournament/comments/delete`, {
        data: { commentId },
      });

      commentsMutate(); // Refresh comments
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex flex-col gap-2 ${
        isReply
          ? "ml-2 pl-2 sm:ml-6 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700"
          : ""
      }`}
    >
      <div
        className="relative flex flex-col sm:flex-row gap-3 p-3 rounded-lg 
                  bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm 
                  hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-offset-2 ring-blue-500/20 dark:ring-blue-400/20">
            <AvatarImage
              src={comment?.userId?.profilePicture || `/api/placeholder/40/40`}
            />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`/${comment?.userId?.username}`}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 line-clamp-1">
                  {comment?.userId?.name || "Anonymous"}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  @{comment?.userId?.username}
                </span>
              </Link>

              {comment.isPinned && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Pin className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>Pinned by creator</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {isCreator && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] sm:text-xs bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  Creator
                </Badge>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              {comment.text}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span
                className="text-xs text-gray-500 dark:text-gray-400"
                title={moment(comment.createdAt).format(
                  "MMMM Do YYYY, h:mm:ss a"
                )}
              >
                {moment(comment.createdAt).fromNow()}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  // variant="ghost"
                  // size="sm"
                  // className="h-7 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-950"
                  // onClick={() => onReaction(comment._id, "like")}

                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs group transition-colors duration-200
                    ${
                      isLikedByUser
                        ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}
                  onClick={() => handleReaction(comment._id)}
                  disabled={!userProfile}
                  title={isLikedByUser ? "Remove like" : "Like this comment"}
                >
                  {/* <Heart
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      isLikedByUser ? "fill-red-500 text-red-500" : ""
                    }`}
                  /> */}

                  <Heart
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-200
          ${
            isLikedByUser
              ? "fill-red-500 text-red-500 scale-110"
              : "text-gray-500 group-hover:scale-110"
          }`}
                  />
                  <span className="ml-1">{comment.likes?.length || 0}</span>
                </Button>

                {depth < 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-950"
                    onClick={() => onReply(comment)}
                  >
                    <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="ml-1">Reply</span>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[150px]">
                    {/* <DropdownMenuItem
                      onClick={() =>
                        navigator.clipboard.writeText(comment.text)
                      }
                    >
                      Copy Text
                    </DropdownMenuItem> */}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                    {/* <DropdownMenuItem
                      onClick={() => onReaction(comment._id, "report")}
                    >
                      Report
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="pl-2 sm:pl-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "Hide" : "Show"} {comment.replies.length} replies
          </Button>

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 mt-2"
              >
                {comment.replies.map((reply) => (
                  <CommentCard
                    key={reply._id}
                    comment={reply}
                    isReply={true}
                    depth={depth + 1}
                    isCreator={isCreator}
                    onDelete={onDelete}
                    handleReaction={handleReaction}
                    onReply={handleReply}
                    commentsMutate={commentsMutate}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

const TournamentComments = ({ tournamentId, isCreator }) => {
  const commentRef = useRef();
  const scrollAreaRef = useRef(null);
  const lastCommentRef = useRef(null);
  const prevCommentsLength = useRef(0);

  const userProfile = useSelector((state) => state.auth.profile);

  const {
    data: commentsData,
    isLoading: commentLoading,
    isError: commentsError,
    mutate: commentsMutate,
  } = useTournamentComments({
    tournamentId,
  });

  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [sortBy, setSortBy] = useState("trending");

  const handleReaction = async (commentId) => {
    commentsMutate((currentData) => {
      const updateComments = (comments) => {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            const userLikedIndex = comment.likes.indexOf(userProfile._id);
            const updatedLikes = [...comment.likes];

            if (userLikedIndex === -1) {
              updatedLikes.push(userProfile._id);
            } else {
              updatedLikes.splice(userLikedIndex, 1);
            }

            return {
              ...comment,
              likes: updatedLikes,
            };
          }

          // Recursively update replies if they exist
          if (comment.replies?.length > 0) {
            return {
              ...comment,
              replies: updateComments(comment.replies),
            };
          }

          return comment;
        });
      };

      return {
        ...currentData,
        comments: updateComments(currentData.comments),
      };
    }, false); // false means don't revalidate immediately

    try {
      const response = await axios.post(
        `/api/tournament/comments/react?commentId=${commentId}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to update reaction");
      }

      // Revalidate to ensure server-client consistency
      await commentsMutate();
    } catch (error) {
      console.error("Error updating reaction:", error);
      // Revert optimistic update on error
      await commentsMutate();
    }
  };

  // Optimistic update handler
  const addOptimisticComment = useCallback(
    (newComment) => {
      const optimisticComment = {
        _id: Date.now().toString(), // Temporary ID
        text: newComment,
        userId: {
          userId: userProfile._id,
          username: userProfile.username,
          profilePicture: userProfile.profilePicture,
        },
        // parentId: parentId, // Add this
        createdAt: new Date().toISOString(),
        isPinned: false,
        isCreator: isCreator,
        // Add any other necessary fields
      };

      commentsMutate((currentData) => {
        const currentComments = currentData?.comments || [];
        return {
          ...currentData,
          comments: [optimisticComment, ...currentComments],
        };
      }, false); // false means don't revalidate immediately

      return optimisticComment;
    },
    [userProfile, isCreator, commentsMutate]
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createComment(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = commentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText =
      text.substring(0, start) + emoji.native + text.substring(end);

    textarea.value = newText;
    // Update cursor position
    textarea.selectionStart = textarea.selectionEnd =
      start + emoji.native.length;
    textarea.focus();
  };

  const handleReply = (commentToReply) => {
    setReplyTo({
      _id: commentToReply._id,
      userId: commentToReply.userId,
    });
    commentRef.current?.focus();
  };

  const createComment = async (e) => {
    e.preventDefault();

    const commentText = commentRef.current.value.trim();
    if (!commentText) return;

    setLoading(true);
    const optimisticComment = addOptimisticComment(
      commentText,
      replyTo?.commentId
    );

    try {
      const response = await axios.post(
        "/api/tournament/comments/create",
        {
          tournamentId,
          text: commentText,
          parentId: replyTo?._id,
          isPinned: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        commentRef.current.value = "";
        setReplyTo(null); // Clear reply state
        await commentsMutate(); // Refresh to get server data
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      // Revert optimistic update on error
      commentsMutate((currentData) =>
        currentData.filter((comment) => comment._id !== optimisticComment._id)
      );
    } finally {
      setLoading(false);
    }
  };

  const createReply = async (commentId, replyText) => {
    if (!replyText.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post("/api/tournament/comments/create", {
        tournamentId,
        text: replyText,
        parentId: commentId,
      });

      if (response.status === 201) {
        setReplyTo(null);
        commentRef.current.value = "";
        await commentsMutate();
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      commentsData?.length &&
      commentsData.length !== prevCommentsLength.current
    ) {
      const scrollArea = scrollAreaRef.current;
      const viewport = scrollArea?.querySelector(
        "[data-radix-scroll-area-viewport]"
      );

      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }

      prevCommentsLength.current = commentsData.length;
    }
  }, [commentsData?.length]);

  return (
    <Card
      className="overflow-hidden border-0 shadow-xl bg-gradient-to-b from-white/80 to-white/40 
                    dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <h3 className="font-semibold text-sm sm:text-base">
            Tournament Discussion
          </h3>
          <Badge variant="secondary" className="h-5 px-1.5">
            {commentsData?.length || 0}
          </Badge>
        </div>

        <select
          className="h-8 px-2 text-xs sm:text-sm rounded-md bg-transparent border 
                   dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="trending">Trending</option>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Comments List */}

      <ScrollArea
        ref={scrollAreaRef}
        className="h-[calc(100vh-20rem)] sm:h-[500px]"
      >
        <div className="p-2 sm:p-4 flex flex-col-reverse gap-3 sm:gap-4">
          {commentsError ? (
            <ErrorState onRetry={() => commentsMutate()} />
          ) : commentLoading ? (
            <AnimatePresence>
              {[...Array(3)].map((_, i) => (
                <CommentSkeleton key={i} />
              ))}
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              {commentsData?.map((comment, index) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  ref={index === 0 ? lastCommentRef : null}
                  tournamentId={tournamentId}
                  commentsMutate={commentsMutate}
                  onReply={handleReply}
                  handleReaction={handleReaction}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Comment Input */}
      {userProfile ? (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          {replyTo && (
            <div
              className="mb-2 p-2 rounded-md flex items-center justify-between
            bg-gray-50 dark:bg-gray-800"
            >
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Replying to @{replyTo.userId.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src={userProfile?.profilePicture} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={commentRef}
                  onKeyDown={handleKeyPress}
                  className="w-full p-3 pr-12 text-sm rounded-lg resize-none min-h-[80px]
                border border-gray-200 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800
                placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={
                    replyTo
                      ? `Reply to @${replyTo.userId.username}...`
                      : "thoughts about the tournament..."
                  }
                  disabled={loading}
                />

                {/* Quick Actions Toolbar - Inside textarea, bottom right */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    disabled={loading}
                    className="h-8 w-8 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  />

                  <Button
                    onClick={createComment}
                    disabled={loading}
                    className={`h-8 px-3 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-full
                   flex items-center gap-1.5 transition-all
                   ${loading ? "opacity-50" : "opacity-100"}`}
                  >
                    {loading ? "Sending..." : "Send"}
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              log in
            </Link> {" "}
            to join the discussion
          </p>
        </div>
      )}
    </Card>
  );
};

export default TournamentComments;
