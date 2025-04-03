import { Avatar, Modal } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const EntryModal = ({ openModal, handleCloseModal, entry }) => {
  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div
        className="w-11/12 md:w-1/2"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#222840",
          boxShadow: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "10px",
          height: "70%",
          padding: "1rem",
        }}
      >
        <section className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center">
            <Avatar
              alt="/default_profile.png"
              src={entry?.profilePicture}
              sx={{
                cursor: "pointer",
                width: "50px",
                height: "50px",
                mr: 1,
              }}
            />
            <div className="flex flex-col ">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold text-lg text-white">
                  @{entry?.username}
                </h4>
              </div>
            </div>
          </div>

          <button
            className="rounded-xl p-1"
            onClick={handleCloseModal}
            style={{
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            }}
          >
            <CloseOutlinedIcon sx={{ color: "#9f9f9f" }} />
          </button>
        </section>

        {/* ig iframe */}
        {entry?.platform === "instagram" && (
          <div
            className="mx-auto overflow-hidden bg-black rounded-xl"
            style={{
              position: "relative",
              width: "100%",
              height: 0,
              width: "200px",
              height: "350px",
            }}
          >
            <iframe
              width="200"
              height="350"
              src={`${entry?.linkToPost}embed/`}
              title="instagram video player"
              frameborder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              // muted
              playsinline
              scrolling="no"
            ></iframe>
          </div>
        )}

        {/* tiktok iframe */}
        {entry?.platform === "tiktok" && (
          <div
            className="mx-auto overflow-hidden bg-black rounded-xl"
            style={{
              position: "relative",
              width: "100%",
              width: "330px",
              height: "350px",
            }}
          >
            <iframe
              className="rounded-xl"
              width="330"
              height="350"
              src={`https://www.tiktok.com/embed/v2/${
                entry.linkToPost.split("/")[
                  entry.linkToPost.split("/").length - 1
                ]
              }`}
              title="tiktok video player"
              frameborder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              // muted
              playsinline
            ></iframe>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EntryModal;
