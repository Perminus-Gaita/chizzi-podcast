import LogoutIcon from "@mui/icons-material/Logout";

const LogoutButton = ({ sign_out }) => {
  return (
    <button
      onClick={sign_out}
      className="flex items-center gap-2 hover:gap-3 bg-tertiary hover:bg-primaryRed transition-all ease-in duration-200
      rounded-lg p-1 px-2"
    >
      <span className="text-white text-lg">Log Out</span>
      <LogoutIcon sx={{ color: "#00b8ff" }} />
    </button>
  );
};

export default LogoutButton;
