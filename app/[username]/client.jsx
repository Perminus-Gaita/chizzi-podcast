"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { init_page } from "../store/pageSlice";
import { UserX } from "lucide-react";

import ProfileHeader from "@/page_components/UserProfile/ProfileHeader";
import ProfileSocials from "@/page_components/UserProfile/ProfileSocials";
import ProfileTabs from "@/page_components/UserProfile/ProfileTabs";
import EditProfileModal from "@/page_components/UserProfile/EditProfileModal";

const UserNotFound = ({ username }) => (
  <div className="w-full max-w-3xl mx-auto p-8 text-center">
    <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
      <UserX className="w-12 h-12 text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
    <p className="text-gray-500">
      The user <span className="font-medium">@{username}</span> doesn&apos;t
      exist or has been removed.
    </p>
  </div>
);

const UserProfile = ({
  username,
  tournaments,
  products,
  userData,
  members,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      init_page({
        page_title: `Profile`,
        show_back: false,
        show_menu: true,
        route_to: null,
      })
    );
  }, [dispatch]);

  const handleProfileUpdate = async (updatedData) => {
    if (updatedData.hasUsernameChanged) {
      router.push(`/${updatedData.username}`);
    } else {
      router.refresh();
    }
    setIsEditModalOpen(false);
  };

  if (!userData) {
    return <UserNotFound username={username} />;
  }

  const user = {
    username: userData.username || username,
    displayName: userData.name || username,
    avatar: userData.profilePicture || "/placeholder.svg?height=100&width=100",
    headerImage: userData.bannerImage || null,
    isSessionUser: userData.isSessionUser || false,
    isSessionUserAMemberInThisWorkspace:
      userData.isSessionUserAMemberInThisWorkspace || false,
    sessionUserRoleInWorkspace: userData.sessionUserRoleInWorkspace || null,
    socials: userData.socialLinks || [],
  };

  const canEdit =
    user.isSessionUserAMemberInThisWorkspace &&
    (user.sessionUserRoleInWorkspace === "admin" ||
      user.sessionUserRoleInWorkspace === "editor");

  return (
    <>
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      <div className="w-full max-w-3xl mx-auto overflow-hidden">
        <ProfileHeader
          user={user}
          onEdit={() => setIsEditModalOpen(true)}
          canEdit={canEdit}
        />

        <div className="mt-20 px-4">
          {/* Profile Info with improved truncation */}
          <div className="min-w-0 w-full mb-4">
            <div className="flex flex-col space-y-1 max-w-full">
              <div className="relative w-full">
                <h1
                  className="text-xl font-bold truncate block"
                  title={user.displayName}
                >
                  {user.displayName}
                </h1>
              </div>
              <div className="relative w-full">
                <p
                  className="text-gray-500 truncate block"
                  title={`@${user.username}`}
                >
                  @{user.username}
                </p>
              </div>
            </div>
          </div>

          <ProfileSocials socials={user.socials} />
        </div>

        <ProfileTabs
          username={user?.username}
          tournaments={tournaments}
          products={products}
          members={members}
          isOwner={userData?.isOwner}
        />
      </div>
    </>
  );
};

export default UserProfile;
