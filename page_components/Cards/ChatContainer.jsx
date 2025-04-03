import moment from "moment";
import { useRef, useEffect } from "react";
import { Avatar, Divider, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

const ChatContainer = ({
  systemMessages,
  chatOpen,
  setChatOpen,
  isSmallScreen,
  chatMessage,
  setChatMessage,
  sendMessage,
  toggleMobileChat,
  chatContainerRef,
  loadingChat,
}) => {
  const combinedMessages = [...systemMessages].sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const lastMessageRef = useRef(null);
  const userProfile = useSelector((state) => state.auth.profile);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [combinedMessages]);

  return (
    <div
      className="rounded-xl flex flex-col justify-between"
      style={{
        boxShadow: `rgba(0, 184, 255, 0.05) -4px 9px 25px -6px`,
        background: "rgba(25, 32, 95, 0.37)",
        backdropFilter: "blur(20px)",
        border: `1px solid rgba(0, 184, 255, 1)`,
        height: isSmallScreen ? "100vh" : "600px",
        width: isSmallScreen ? "100%" : "300px",
        position: isSmallScreen ? "absolute" : "relative",
        transition: "all 0.3s ease-in-out",
        marginLeft: !isSmallScreen && "10px",
      }}
    >
      {/* chat container header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-300 font-semibold">Game Chat</span>
        </div>
        <div className="flex space-x-2">
          <button className=" text-gray-400 hover:text-gray-200">
            <InfoOutlinedIcon fontSize="small" />
          </button>

          {isSmallScreen && (
            <button
              className=" text-gray-400 hover:text-gray-200"
              onClick={toggleMobileChat(false)}
            >
              <CloseIcon fontSize="small" />{" "}
            </button>
          )}

          {!isSmallScreen && (
            <button
              className=" text-gray-400 hover:text-gray-200"
              onClick={() => setChatOpen(false)}
            >
              <CloseIcon fontSize="small" />{" "}
            </button>
          )}
        </div>
      </div>

      {/* ensure messages.length > 0 */}
      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="scroll_style flex-1 overflow-y-auto p-4 space-y-4"
        // style={{ height: "calc(100vh - 128px)" }}
        style={{
          height: isSmallScreen ? "calc(100vh - 200px)" : "calc(100vh - 128px)",
          paddingBottom: !isSmallScreen && "50px",
        }}
      >
        {combinedMessages.map((message, index) => (
          <div
            key={index}
            ref={index === combinedMessages.length - 1 ? lastMessageRef : null}
            className={` flex ${
              message?.sender.username === userProfile?.username
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`flex ${
                message?.sender.username === userProfile?.username
                  ? "flex-row-reverse"
                  : "flex-row"
              } items-start space-x-2`}
            >
              <Avatar
                src={message?.sender?.profilePicture || "/default_profile.png"}
                alt={message?.sender.username}
                className="w-8 h-8"
              />
              <div
                className={`flex flex-col ${
                  message?.sender.username === userProfile?.username
                    ? "items-end"
                    : "items-start"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {message?.sender.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {moment(message.createdAt).format("HH:mm")}
                  </span>
                </div>
                <div
                  className={`mt-1 px-3 py-2 rounded-lg ${
                    message?.sender.username === userProfile?.username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <div
        ref={chatContainerRef}
        className="scroll_style px-2 py-4"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "calc(90vh - 150px)",
          // marginBottom: "10px",
        }}
      >
        {combinedMessages.map((message, index) => (
          <div
            key={index}
            className="gap-1"
            style={{
              display: "flex",
              flexDirection:
                message?.sender.username === userProfile?.username
                  ? "row-reverse"
                  : "row",
              alignItems: "flex-start",
              margin: "10px 0",
              width: "100%",
            }}
          >
            <div
              className="flex flex-col items-center justify-center"
              style={{ width: "20%" }}
            >
              <Avatar
                alt="/default_profile.png"
                src="/default_profile.png"
                sx={{ width: 40, height: 40 }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems:
                  message?.sender.username === userProfile?.username
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <div
                className="flex gap-1"
                style={{
                  flexDirection:
                    message?.sender.username === userProfile?.username
                      ? "row-reverse"
                      : "row",
                }}
              >
                <span className="text-primaryGray font-medium mb-1 text-xs">
                  {message?.sender.username}
                </span>

                <span className="text-[#9f9f9f] text-xs font-light">
                  —{moment(message.createdAt).format("hh:mm a") || "00:00"}
                </span>
              </div>

              <div
                style={{
                  wordWrap: "break-word",
                  width: "70%",
                }}
              >
                <div
                  style={{
                    wordWrap: "break-word",
                    padding: "5px 10px 10px 10px",
                    // backgroundColor:
                    //   message?.sender.username === userProfile?.username
                    //     ? "#00DBC8"
                    //     : "#f5f5f5",
                    borderRadius: "10px",
                    backgroundColor:
                      message?.sender.username === "erick"
                        ? "rgba(51, 51, 51, 0.04)"
                        : "rgba(51, 51, 51, 0.08)",
                    boxShadow:
                      message?.sender.username === "erick"
                        ? "rgba(28, 28, 28, 0.25)  0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset"
                        : "rgba(51, 51, 51, 0.25)  0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                  }}
                >
                  <span
                    className="text-white mt-1 self-end"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {message.message}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Input Area */}
      <div
        className="bg-gray-800 border-t
        border-gray-700 p-4"
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          bottom: isSmallScreen ? "50px" : "10px",
          textAlign: "center",
        }}
      >
        <div className="flex items-center space-x-2">
          <textarea
            name="chatMessage"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-gray-600 rounded-lg p-2
             focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            rows="2"
          />
          <button
            onClick={sendMessage}
            disabled={loadingChat}
            className={`p-2 rounded-full ${
              loadingChat
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {loadingChat ? (
              <CircularProgress size={24} className="text-gray-400" />
            ) : (
              <SendOutlinedIcon />
            )}
          </button>
        </div>
      </div>

      {/* <div
        className="flex items-center p-2 w-full rounded-xl"
        style={{
          backgroundColor: "#19205f",
          // marginBottom: isSmallScreen && "4rem",
        }}
      >
        {userProfile ? (
          <>
            <textarea
              name="chatMessage"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              placeholder="Type your message..."
              style={{
                flex: "1 1 90%",
                marginRight: "10px",
                padding: "8px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#222840",
                color: "#fff",
                resize: "none",
              }}
            />
            <button
              className="p-2 rounded-xl cursor-pointer"
              onClick={() => sendMessage()}
              style={{
                backgroundColor: "#00b8ff",
                color: "#000",
                border: "none",
                flex: "1 1 10%",
              }}
            >
              <SendOutlinedIcon />
            </button>
          </>
        ) : (
          <div
            className="flex justify-center items-center"
            style={{
              margin: "0 auto",
            }}
          >
            <button>
              <LockOutlinedIcon sx={{ color: "#9f9f9f" }} />
            </button>
            <span className="text-md font-semibold text-center text-[#9f9f9f]">
              Login to Chat
            </span>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ChatContainer;
