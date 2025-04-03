"use client";
import { setProfile } from "@/app/store/authSlice";
import { useUserHandler } from "@/lib/user";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Auth = () => {
  const dispatch = useDispatch();

  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useUserHandler();

  const setUserProfile = () => {
    dispatch(
      setProfile({
        uuid: userData?._id,
        workspaceId: userData?.currentWorkspaceId,
        username: userData?.username,
        name: userData?.name,
        type: userData?.type,
        profilePicture: userData?.profilePicture,
        onboardingStatus: userData?.onboardingStatus,
        discovery: userData?.discovery,
        // emailAddress: userData?.mainEmail,
        currentWorkspace: userData?.currentWorkspace,
        workspaces: userData?.workspaces,
        telegramUserId: userData?.telegram?.userId,
      })
    );
  };

  useEffect(() => {
    if (userData) {
      setUserProfile();
    }
    // console.log("USER DATA HERE");
    // console.log(userData);
  }, [userData]);

  return;
};

export default Auth;
