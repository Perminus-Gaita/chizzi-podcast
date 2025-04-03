// Discovery.js
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { init_page } from "@/app/store/pageSlice";
import SuccessOnboardingModal from "@/components/Onboarding/SuccessOnboardingModal";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";

const DISCOVERY_PLATFORMS = [
  { name: "Facebook", image: "/facebook.png" },
  { name: "Instagram", image: "/instagram.png" },
  { name: "Youtube", image: "/youtube.png" },
  { name: "Tiktok", image: "/tiktok.png" },
  { name: "X", image: "/x.png" },
  { name: "LinkedIn", image: "/linkedin.png" },
  { name: "Referral", image: "/referral.png" },
  { name: "Other", image: "/other.png" },
];

const Discovery = () => {
  const dispatch = useDispatch();
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const userProfile = useSelector((state) => state.auth.profile);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Discovery",
        show_back: false,
        show_menu: true,
        route_to: "/",
      })
    );
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!platform && !userProfile?.discovery) {
      toast({
        title: "Please select a platform",
        description: "Let us know where you heard about Wufwuf",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.patch("/api/onboarding/discover", {
        platform,
      });

      if (response.status === 200) {
        setShowConfetti(true);
        setShowOnboardingModal(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save your selection. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <>
      {showConfetti && <Confetti />}
      <SuccessOnboardingModal
        openOnboardingModal={showOnboardingModal}
        setShowOnboardingModal={setShowOnboardingModal}
        redirecting={redirecting}
        setRedirecting={setRedirecting}
        userProfile={userProfile}
        dispatch={dispatch}
      />
      <div
        className={`min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6 flex justify-center items-center ${
          redirecting ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
      >
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                Welcome to Wufwuf!
              </CardTitle>
            </div>
            <CardDescription>
              Help us tailor your experience. Where did you first hear about us?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <RadioGroup
                onValueChange={setPlatform}
                defaultValue={platform}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {DISCOVERY_PLATFORMS.map((discovery) => (
                  <Label
                    key={discovery.name}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out ${
                      platform === discovery.name.toLowerCase()
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={discovery.name.toLowerCase()}
                      className="sr-only"
                    />
                    <Image
                      src={discovery.image}
                      width={40}
                      height={40}
                      alt={discovery.name}
                      className="mb-2"
                    />
                    <span className="text-sm font-medium">
                      {discovery.name}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Image
                  src="/buttonloader.svg"
                  width={24}
                  height={24}
                  alt="Loading"
                  className="mr-2"
                />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Start Your Journey
            </Button>
            <Progress value={33} className="w-full mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              Step 1 of 3: Discovery
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Discovery;
