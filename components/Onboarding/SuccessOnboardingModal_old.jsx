// "use client";
// import Link from "next/link";

// import { useSelector } from "react-redux";

// import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

// const SuccessOnboardingModal = () => {
//   const userProfile = useSelector((state) => state.auth.profile);

//   return (
//     <div
//       className="w-11/12 md:w-1/2 p-4 rounded-xl bg-secondary
//         flex flex-col gap-8"
//       style={{
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//       }}
//     >
//       <div className="flex justify-center">
//         <h3 className="text-quinary text-2xl font-semibold align-center">
//           Welcome aboard Wufwuf!
//         </h3>
//       </div>

//       <div className="">
//         {userProfile?.accountType === "personal" && (
//           <p className="text-[#9f9f9f] text-lg">
//             Congratulations &#127881; on completing the onboarding steps! 🎉 You
//             are now ready participate and engage with your favourite content
//             creators.
//           </p>
//         )}
//         {userProfile?.accountType === "professional" && (
//           <p className="text-[#9f9f9f] text-lg">
//             Congratulations &#127881; on completing the onboarding steps! 🎉 You
//             are now ready to unleash the power of social media with Wufwuf.
//           </p>
//         )}
//       </div>

//       <div className="flex justify-center">

//         <Link href="/dashboard" style={{ textDecoration: "none" }}>
//           <button
//             className="flex items-center justify-center rounded-xl p-1 md:p-2 px-4 md:px-6
//             hover:scale-125 transition-all ease duration-100 hover:gap-2"
//             style={{
//               boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
//             }}
//           >
//             <span className="text-white text-md md:text-xl">
//               {" "}
//               Explore Dashboard
//             </span>
//             <KeyboardDoubleArrowRightIcon sx={{ color: "#fff" }} />
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default SuccessOnboardingModal;

"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SuccessOnboardingModal = ({
  openOnboardingModal,
  handleCloseOnboardingModal,
}) => {
  const userProfile = useSelector((state) => state.auth.profile);

  return (
    <Dialog
      open={openOnboardingModal}
      onOpenChange={handleCloseOnboardingModal}
    >
      <DialogContent className="sm:max-w-[425px] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            Welcome aboard Wufwuf!
          </DialogTitle>
          <DialogDescription className="text-center">
            {userProfile?.accountType === "personal" ? (
              <>
                Congratulations 🎉 on completing the onboarding steps! You are
                now ready to participate and engage with your favorite content
                creators.
              </>
            ) : (
              <>
                Congratulations 🎉 on completing the onboarding steps! You are
                now ready to unleash the power of social media with Wufwuf.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link href="/dashboard">
              Explore Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessOnboardingModal;
