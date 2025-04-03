"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Image from "next/image";

const ProfileHeader = ({ user, onEdit, canEdit }) => {
  return (
    <div className="relative">
      <div className="w-full rounded-xl overflow-hidden">
        {user.headerImage && (
          <div className="relative w-full aspect-[4/1]">
            <Image
              src={user.headerImage}
              alt="Profile header"
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}
        {!user.headerImage && (
          <div className="w-full aspect-[4/1] bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
      </div>

      <div className="absolute -bottom-12 left-2 sm:-bottom-16 sm:left-4">
        {" "}
        {/* Adjusted positioning */}
        <Avatar className="w-20 h-20 sm:w-32 sm:h-32 border-4 border-white">
          {" "}
          {/* Adjusted size */}
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.username[0]}</AvatarFallback>
        </Avatar>
      </div>

      {canEdit && (
        <div className="absolute -bottom-8 right-1 sm:-bottom-12 sm:right-2 mt-2 sm:mt-4">
          {" "}
          {/* Adjusted positioning and margin */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-background hover:bg-accent text-xs sm:text-sm" // Adjusted font size
            onClick={onEdit}
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
