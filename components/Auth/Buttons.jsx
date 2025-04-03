import Link from "next/link";

const AuthButton = ({ linkTo, text, isPrimary }) => {
  return (
    <Link href={linkTo} className="no-underline">
      <button
        className={`
          px-4 p-2 rounded-xl font-semibold text-sm sm:text-base
          transition-all duration-300 ease-in-out
          ${
            isPrimary
              ? "bg-[#00b8ff] text-[#131633] hover:bg-[#19205f] hover:text-white"
              : "bg-[#19205f] text-white hover:bg-[#00b8ff] hover:text-[#131633]"
          }
          border-2 border-transparent hover:border-[#00b8ff]
          shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-[#00b8ff] focus:ring-opacity-50
        `}
      >
        {text}
      </button>
    </Link>
  );
};

const LoginButton = ({ linkTo }) => {
  return <AuthButton linkTo={linkTo} text="Log In" isPrimary={false} />;
};

const SignUpButton = ({ linkTo }) => {
  return <AuthButton linkTo={linkTo} text="Sign Up" isPrimary={true} />;
};

export { LoginButton, SignUpButton };
