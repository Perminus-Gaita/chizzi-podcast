"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/hooks/use-toast";
import {
  Link,
  MoreVertical,
  Info,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const platformColors = {
  facebook: "bg-blue-600",
  instagram: "bg-pink-600",
  youtube: "bg-red-600",
  tiktok: "bg-black",
  linkedin: "bg-blue-700",
};

const PlatformCard = ({
  platform,
  platformConfig,
  setShowTutorial,
  onConnect,
  connectingPlatform,
}) => {
  const config = platformConfig[platform];

  return (
    <div className="w-full p-4 bg-accent/10 rounded-lg space-y-4 my-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex-shrink-0">
          <img
            src={`/${platform}.png`}
            alt={`${platform} icon`}
            className="rounded"
          />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold capitalize">{platform}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
          {config.tutorialText && (
            <button
              onClick={() => setShowTutorial({ show: true, platform })}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              <Info className="h-4 w-4" />
              <span className="underline">{config.tutorialText}</span>
            </button>
          )}
        </div>
      </div>
      {/* <Button
        className={`w-full ${config.color}`}
        onClick={() => onConnect(platform)}
      >
        {config.connectText}
      </Button> */}

      <Button
        onClick={() => onConnect(platform)}
        disabled={connectingPlatform === platform}
        className={`w-full ${config.color}`}
      >
        {connectingPlatform === platform && (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        )}
        {connectingPlatform === platform ? "Connecting..." : config.connectText}
      </Button>
    </div>
  );
};

const TutorialView = ({ platformConfig, setShowTutorial, showTutorial }) => (
  <div className="space-y-6">
    <div className="aspect-video w-full bg-black/50 rounded-lg overflow-hidden">
      <iframe
        className="w-full h-full"
        src={platformConfig[showTutorial.platform].tutorialUrl}
        title="Platform Tutorial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
    <Button
      variant="ghost"
      onClick={() => setShowTutorial({ show: false, platform: null })}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to platforms
    </Button>
  </div>
);

const SocialIntegrations = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const userProfile = useSelector((state) => state.auth.profile);
  const userSocials = useSelector((state) => state.auth.socials);

  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  const [showTutorial, setShowTutorial] = useState({
    show: false,
    platform: null,
  });

  const platformConfig = {
    facebook: {
      color: "bg-[#1877F2]",
      description: "Connect a Facebook page",
      tutorialUrl: "https://www.youtube.com/embed/37pH82x06PU",
      tutorialText: "How to Convert Facebook Account to Page",
      connectText: "Continue with Facebook",
    },
    instagram: {
      color: "bg-gradient-to-r from-[#405DE6] to-[#E1306C]",
      description: "Connect an Instagram creator/business account",
      tutorialUrl: "https://www.youtube.com/embed/DG9s9nvK_2U",
      tutorialText: "How to Switch Your Instagram to a Business Account",
      connectText: "Continue with Facebook",
    },
    youtube: {
      color: "bg-[#FF0000]",
      description: "Connect a YouTube channel",
      connectText: "Connect YouTube",
    },
    tiktok: {
      color: "bg-black hover:bg-gray-900",
      description: "Connect a TikTok account",
      connectText: "Continue with TikTok",
    },
    // linkedin: {
    //   color: "bg-[#0A66C2]",
    //   description: "Connect a LinkedIn Page/Profile",
    //   connectText: "Connect LinkedIn",
    // },
  };

  // const get_tokens = async (code, uuid) => {
  //   // console.log("getting tokens...");
  //   set_youtube_loading(true);

  //   try {
  //     const response = await fetch("http://localhost:5000/youtube/tokens", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ code, uuid }),
  //     });
  //     const data = await response.json();
  //     // console.log("Connection successful:", data);

  //     // route to create
  //     router.push("/dashboard");
  //   } catch (error) {
  //     // console.error("Connection failed:", error);
  //     return;
  //   }

  //   set_youtube_loading(false);
  // };

  // const connect_facebook = (effecting) => {
  //   set_facebook_loading(true);
  //   router.push(`/api/facebook/connect`);
  //   set_facebook_loading(false);
  // };

  // const connect_instagram = (e) => {
  //   set_instagram_loading(true);
  //   router.push(`/api/instagram/connect`);
  //   set_instagram_loading(false);
  // };

  // const connect_youtube = async () => {
  //   console.log("connecting to youtube");
  //   set_youtube_loading(true);

  //   // router.push("http://localhost:5000/youtube/connect");
  //   router.push("/api/youtube/connect");

  //   set_youtube_loading(false);
  // };

  // const connect_tiktok = () => {
  //   set_tiktok_loading(true);
  //   router.push(`/api/tiktok/connect`);
  //   set_tiktok_loading(false);
  // };

  // const connectLinkedIn = () => {
  //   setLinkedinLoading(true);
  //   router.push("/api/linkedin/connect");
  //   setLinkedinLoading(false);
  // };

  const onConnect = (platform) => {
    setConnectingPlatform(platform);
    // Redirect after showing loading state
    setTimeout(() => {
      window.location.href = `/api/${platform}/connect`;
    }, 500);
  };

  // const handleLogin = () => {
  //   setIsLoading(true);
  //   // Redirect after showing loading state
  //   setTimeout(() => {
  //     window.location.href = "/api/auth/google/sign-in/initiate";
  //   }, 500);
  // };

  //   const disconnectSocial = async (accountId, platform) => {
  //     setLoading(true);

  //     dispatch(
  //       createNotification({
  //         open: true,
  //         type: "info",
  //         message: `Disconnecting ${platform}. Please wait...`,
  //       })
  //     );

  //     try {
  //       // Make a DELETE request to your API endpoint
  //       const response = await axios.delete("/api/user/socials/disconnect", {
  //         data: { accountId },
  //       });
  //       // Handle success
  //       console.log("THE RESPONSE HERE ####");
  //       console.log(response.data.message);

  //       if (response.status === 200) {
  //         dispatch(
  //           createNotification({
  //             open: true,
  //             type: "success",
  //             message: response.data.message,
  //           })
  //         );
  //         setLoading(false);
  //         handleClose(platform);

  //         accountsMutate();
  //       } else {
  //         console.log("Something went wrong");
  //       }
  //     } catch (error) {
  //       // Handle error
  //       console.error(
  //         "Error disconnecting social media account:",
  //         error.response.data.message
  //       );

  //       dispatch(
  //         createNotification({
  //           open: true,
  //           type: "error",
  //           message: `Something went wrong!`,
  //         })
  //       );
  //       handleClose(platform);
  //       setLoading(false);
  //     } finally {
  //       setLoading(false);
  //       handleClose(platform);
  //     }
  //   };

  // const connectPlatform = async (platform) => {
  //   setIsConnecting(true);
  //   try {
  //     await router.push(`/api/${platform}/connect`);
  //     toast({
  //       title: "Connecting to " + platform,
  //       description: "Please wait while we connect your account.",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Connection failed",
  //       description: "There was an error connecting to " + platform,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsConnecting(false);
  //   }
  // };

  const disconnectPlatform = async (accountId, platform) => {
    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/user/socials/disconnect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (response.ok) {
        toast({
          title: "Account disconnected",
          description: `Your ${platform} account has been disconnected.`,
        });
        // Refresh user socials data here
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description:
          "There was an error disconnecting your " + platform + " account",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Link className="h-6 w-6" />
            Connected Social Accounts
          </CardTitle>
          <CardDescription>
            Manage your connected social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSocials?.accounts.map((account) => (
              <Card key={account._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={
                          account.profilePictureUrl ||
                          account.thumbnail ||
                          account.avatarUrl
                        }
                      />
                      <AvatarFallback
                        className={platformColors[account.platform]}
                      >
                        {account.platform.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            disconnectPlatform(account._id, account.platform)
                          }
                          disabled={isDisconnecting}
                        >
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="mt-4 font-semibold">
                    {account.name || account.username || account.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {account.platform}
                  </p>
                </CardContent>
              </Card>
            ))}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                    <Plus className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Add New Account</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-light dark:bg-dark">
                <DialogHeader>
                  <DialogTitle>Connect Social Account</DialogTitle>
                  <DialogDescription>
                    Choose a platform to connect your social media account
                  </DialogDescription>
                </DialogHeader>

                {/* <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4"> */}

                <ScrollArea className="max-h-[60vh] pr-4 mt-4">
                  {!showTutorial.show ? (
                    Object.keys(platformConfig).map((platform) => (
                      <PlatformCard
                        key={platform}
                        platform={platform}
                        platformConfig={platformConfig}
                        setShowTutorial={setShowTutorial}
                        onConnect={onConnect}
                        connectingPlatform={connectingPlatform}
                      />
                    ))
                  ) : (
                    <TutorialView
                      showTutorial={showTutorial}
                      platformConfig={platformConfig}
                      setShowTutorial={setShowTutorial}
                    />
                  )}

                  {/* <h1>{connectingPlatform} HERE</h1> */}
                </ScrollArea>

                {/* </div> */}
              </DialogContent>
            </Dialog>

            {/* <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                    <Plus className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Add New Account</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-light dark:bg-dark">
                <DialogHeader>
                  <DialogTitle>Connect a new account</DialogTitle>
                  <DialogDescription>
                    Choose a platform to connect your social media account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  {[
                    "facebook",
                    "instagram",
                    "youtube",
                    "tiktok",
                    "linkedin",
                  ].map((platform) => (
                    <Button
                      key={platform}
                      onClick={() => connectPlatform(platform)}
                      disabled={isConnecting}
                      className={`${platformColors[platform]} text-white`}
                    >
                      Connect {platform}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialIntegrations;
