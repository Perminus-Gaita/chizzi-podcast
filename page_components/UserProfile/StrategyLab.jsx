import React, { useState } from "react";

import axios from "axios";

import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Edit,
  Trophy,
  Users,
  Clock,
  Loader2,
  Brain,
  Crown,
  Settings as SettingsIcon,
  Swords,
  Shield,
  User,
} from "lucide-react";

import CreateStrategyModal from "./CreateStrategyModal";
import CreateAvatarModal from "./CreateAvatarModal";

import { useAvatarProfiles } from "@/lib/user";
import { createNotification } from "@/app/store/notificationSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const AvatarCard = ({ avatar, onPlay, onTrain }) => {
  const archetypeIcons = {
    aggressive: <Swords className="w-4 h-4" />,
    defensive: <Shield className="w-4 h-4" />,
    tactical: <Brain className="w-4 h-4" />,
    balanced: <Crown className="w-4 h-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-background hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/9.x/bottts/svg?seed=${avatar._id}`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-lg bg-muted"
                />
                {archetypeIcons[avatar.archetype] && (
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border">
                    {archetypeIcons[avatar.archetype]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{avatar.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="capitalize">
                    {avatar.rankingTier}
                  </Badge>
                  <span>•</span>
                  <span>Rating: {avatar.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Games</p>
              <p className="font-medium">{avatar.totalGames}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wins</p>
              <p className="font-medium">{avatar.rankedWins}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="font-medium">
                {avatar.totalGames > 0
                  ? ((avatar.rankedWins / avatar.totalGames) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={() => onPlay()}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Play Match
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onTrain(avatar)}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Train Avatar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LabSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="bg-background">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-9 bg-muted rounded" />
            <div className="h-9 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StrategyLab = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [createStrategyOpen, setCreateStrategyOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { avatarPlayer, error, mutate, isLoading } = useAvatarProfiles();

  const handleStrategyCreated = (data) => {
    // Handle success, maybe refresh strategies list
    console.log("Strategy created:", data);
  };

  const generateRandomTableName = () => {
    const adjectives = [
      "bwaku",
      "mdeadly",
      "gangari",
      "mkali",
      "chopi",
      "drip",
      "rieng",
      "warena",
      "chachisha",
      "mless",
      "mbele",
      "janjes",
      "macho",
      "mngaari",
      "chonjo",
      "mtindo",
      "fafiri",
      "mzee",
      "wazi",
      "stingo",
      "mwrong",
      "msuper",
      "bweks",
      "manga",
      "mzito",
      "haki",
      "fiti",
      "songa",
      "ngori",
      "pupa",
      "mwaks",
      "mwaku",
      "nyastu",
      "mnahao",
      "sugu",
      "ridho",
      "teke",
      "randa",
      "dabo",
      "meja",
    ];

    const nouns = [
      "mpango",
      "mbogi",
      "kadi",
      "vita",
      "jama",
      "ngoma",
      "mrah",
      "rieng",
      "mbete",
      "mutaratara",
      "gwoko",
      "bunduz",
      "mzinga",
      "jiji",
      "mchoro",
      "nduka",
      "kombora",
      "msoto",
      "manyake",
      "pesa",
      "tano",
      "mwendeleo",
      "vuta",
      "mstahimili",
      "mshindani",
      "mwanzo",
      "mwisho",
      "genge",
      "rungu",
      "chapa",
      "baze",
      "mzee",
      "wivu",
      "nduadhi",
      "mshamba",
      "vungu",
      "shangwe",
      "mwendo",
      "mzunguko",
      "mwanga",
    ];

    // Ensure length ≤ 15 by using shorter words and ID
    const randomNum = Math.floor(Math.random() * 100);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj}-${noun}-${randomNum}`;
  };

  const handlePlayStrategy = async (avatarPlayerId) => {
    // setTouched({ roomName: true, amount: true, timer: true });

    // const newErrors = {};
    // Object.keys(validationRules).forEach((field) => {
    //   newErrors[field] = validateField(field, formData[field]);
    // });

    // setErrors(newErrors);
    // if (Object.values(newErrors).some((error) => error)) {
    //   dispatch(
    //     createNotification({
    //       open: true,
    //       type: "error",
    //       message: "Please check all fields and try again",
    //     })
    //   );
    //   return;
    // }

    setLoading(true);

    try {
      const endpoint = "/api/cards/create-strategy-room";

      const roomLink = "/kadi/play/strategy";

      const roomName = generateRandomTableName();

      const response = await axios.post(endpoint, {
        roomName: roomName,
        avatarPlayerId: avatarPlayerId,
      });

      if (response.status === 201) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: response.data.message,
          })
        );

        console.log(response.data);

        router.push(`${roomLink}/${roomName}`);
        setCreateStrategyOpen(false);
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to create room. Please try again.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStrategy = async (strategyId) => {
    try {
      // Navigate to strategy update page or open modal
      console.log("Updating strategy", strategyId);
      // Example: router.push(`/strategy/${strategyId}/edit`)
    } catch (err) {
      console.error("Failed to update strategy", err);
    }
  };

  // if (error) {
  //   return (
  //     <div className="p-4 text-center text-red-500">
  //       Error loading strategies
  //     </div>
  //   );
  // }

  return (
    <>
      <CreateAvatarModal
        isOpen={createStrategyOpen}
        onClose={() => setCreateStrategyOpen(false)}
        onSuccess={handleStrategyCreated}
      />

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Train and battle yourself</p>
          </div>
          <Button onClick={() => setCreateStrategyOpen(true)}>
            <Brain className="w-4 h-4 mr-2" />
            Create Player
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LabSkeleton />
          ) : avatarPlayer ? (
            <AvatarCard
              avatar={avatarPlayer}
              onPlay={() => handlePlayStrategy(avatarPlayer?._id)}
              // onTrain={handleTrainAvatar}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No Avatar Yet</h3>
              <p>Create your first AI avatar to start playing!</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StrategyLab;
