"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, User, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProfileImage = ({ src, alt, icon: Icon = User, label }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      {!src || imageError ? (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-7 h-7 text-gray-400" />
        </div>
      ) : (
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}
    </div>
  );
};

const WorkspaceInviteResponse = () => {
  const { inviteId } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await fetch(
          `/api/workspace/invite?inviteId=${inviteId}`
        );
        if (!response.ok) throw new Error("Failed to fetch invite");
        const data = await response.json();
        setInvite(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (inviteId) {
      fetchInvite();
    }
  }, [inviteId]);

  const handleResponse = async (inviteResponse) => {
    setLoadingAction(inviteResponse);
    try {
      const response = await fetch("/api/workspace/invite", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteId,
          inviteResponse,
        }),
      });

      if (!response.ok) throw new Error("Failed to respond to invite");

      if (inviteResponse === "accepted") {
        dispatch({
          type: "SET_CURRENT_WORKSPACE",
          payload: invite.workspaceId,
        });

        localStorage.setItem(
          "currentWorkspace",
          JSON.stringify(invite.workspaceId)
        );
      }

      setResponseStatus({
        success: true,
        message:
          inviteResponse === "accepted"
            ? "Invite accepted successfully!"
            : "Invite declined",
      });

      if (inviteResponse === "accepted") {
        setTimeout(() => {
          router.push("/arena");
        }, 1500);
      }
    } catch (err) {
      setResponseStatus({
        success: false,
        message: err.message,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Workspace Invitation</CardTitle>
          <CardDescription className="text-base">
            You&apos;ve been invited to join a workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!responseStatus ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex flex-col items-center min-w-[120px]">
                  <ProfileImage
                    src={invite?.inviterId?.profilePicture}
                    alt={invite?.inviterId?.name}
                    icon={User}
                    label="USER"
                  />
                  <div className="text-center mt-2">
                    <p className="font-medium">{invite?.inviterId?.name}</p>
                    <p className="text-sm text-gray-500">
                      @{invite?.inviterId?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center px-4">
                  <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    has invited you to join
                  </span>
                </div>

                <div className="flex flex-col items-center min-w-[120px]">
                  <ProfileImage
                    src={invite?.workspaceId?.profilePicture}
                    alt={invite?.workspaceId?.name}
                    icon={Building2}
                    label="WORKSPACE"
                  />
                  <div className="text-center mt-2">
                    <p className="font-medium">{invite?.workspaceId?.name}</p>
                    <p className="text-sm text-gray-500">
                      @{invite?.workspaceId?.username}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleResponse("declined")}
                  disabled={loadingAction !== null}
                  className="w-32"
                >
                  {loadingAction === "declined" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Decline
                </Button>
                <Button
                  onClick={() => handleResponse("accepted")}
                  disabled={loadingAction !== null}
                  className="w-32"
                >
                  {loadingAction === "accepted" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Accept
                </Button>
              </div>
            </div>
          ) : (
            <Alert
              variant={responseStatus.success ? "default" : "destructive"}
              className="mx-auto max-w-md"
            >
              <AlertDescription>{responseStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceInviteResponse;
