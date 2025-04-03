"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { init_page } from "../../store/pageSlice";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Trophy,
  Users,
  Activity,
  Gift,
  Filter,
  InfoIcon,
  Plus,
  Search,
  AlertTriangle,
  Loader2,
  Gamepad2,
  Medal,
  Clock,
  PlayCircle,
  CheckCircle,
  Coins,
  Users2,
  Share2,
  ChevronRight,
  Home,
  Settings as SettingsIcon,
  MessageCircle,
  Send,
  ExternalLink,
  Calculator,
  Package,
  Shield,
  Info,
  Image as ImageIcon,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  Crown,
  Settings2,
  PiggyBank,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import CustomMatchBracket from "@/page_components/Tournament/CustomMatchBracket";

import ProfileHeader from "@/page_components/UserProfile/ProfileHeader";
import ProfileSocials from "@/page_components/UserProfile/ProfileSocials";
import ProfileTabs from "@/page_components/UserProfile/ProfileTabs";

import Settings from "@/page_components/Tournament/Settings";
import Overview from "@/page_components/Tournament/Overview";
import Participation from "@/page_components/Tournament/Participation";
import Games from "@/page_components/Tournament/Games";
import Sponsorship from "@/page_components/Tournament/Sponsorship";
import TournamentComments from "@/page_components/Tournament/Comments.jsx";

import { useIsMobile } from "@/hooks/useIsMobile";

const ScrollingText = ({ text }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  const keyframes = `
  @keyframes scrollText {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const shouldAnimate =
        textRef.current.scrollWidth > containerRef.current.clientWidth;
      setShouldScroll(shouldAnimate);
    }
  }, [text]);

  return (
    <>
      <style>{keyframes}</style>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          maxWidth: "200px",
          overflow: "hidden",
        }}
      >
        <div
          ref={textRef}
          style={{
            animation: shouldScroll ? "scrollText 15s linear infinite" : "none",
            paddingRight: shouldScroll ? "50px" : "0",
          }}
        >
          {text}
          {shouldScroll && <span style={{ paddingLeft: "40px" }}>{text}</span>}
        </div>
      </div>
    </>
  );
};

const StatCard = ({
  title,
  value,
  trend,
  icon: Icon,
  trendValue,
  currency,
  exchangeRate,
}) => {
  const formatValue = (val) => {
    if (typeof val !== "number") return "0";

    // If it's a participant count, just return the number
    if (title.toLowerCase().includes("participants")) {
      return val.toLocaleString();
    }

    // For revenue values, handle currency conversion
    if (title.toLowerCase().includes("revenue")) {
      // Convert cents to shillings for KES and round down
      const adjustedValue = Math.floor(val / 100);
      // Apply exchange rate
      const convertedValue = adjustedValue;
      return `KES ${convertedValue.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }

    // For other numeric values (like tournament counts)
    return val.toLocaleString();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm font-medium break-words">
            {title}
          </h3>
          <Icon className="text-primary flex-shrink-0 ml-2" size={20} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground break-words">
            {formatValue(value)}
          </p>
          {trend && (
            <span
              className={`flex items-center text-sm ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {trendValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PrizePoolCard = ({
  title,
  value,
  icon: Icon,
  currency,
  exchangeRate,
}) => {
  const formatValue = (val) => {
    if (typeof val !== "number") return "0";

    // Convert cents to shillings for KES and round down
    const adjustedValue = Math.floor(val / 100);

    // Apply exchange rate
    const convertedValue = adjustedValue;

    return `KES ${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <Card className="col-span-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-muted-foreground text-sm font-medium break-words">
            {title}
          </h3>
          <Icon className="text-primary flex-shrink-0 ml-2" size={20} />
        </div>
        <p className="text-2xl font-semibold text-foreground break-words">
          {formatValue(value)}
        </p>
      </CardContent>
    </Card>
  );
};

const UserProfile = ({ user }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  // DATA STARTS
  const socials = [
    {
      platform: "facebook",
      link: "facebook.com",
    },

    {
      platform: "instagram",
      link: "instagram.com",
    },
    {
      platform: "youtube",
      link: "youtube.com",
    },
    {
      platform: "tiktok",
      link: "tiktok.com",
    },
  ];

  const players = Array(16)
    .fill()
    .map((_, i) => ({
      participantId: `participant-${i + 1}`,
      userId: `user-${i + 1}`,
      resultText: null,
      isWinner: false,
      checkedIn: i % 3 === 0,
      name: `kadiplayer ${i + 1}`,
      username: `kadiplayer${i + 1}`,
      profilePicture: `https://api.dicebear.com/6.x/open-peeps/svg?seed=kadiplayer${
        i + 1
      }`,
      telegramGroupId: "-1002429990321",
    }));

  const joinedPlayers = players.slice(0, Math.ceil(players.length * 0.65));

  const sixteenPlayerMatches = [
    ...Array(8)
      .fill()
      .map((_, i) => ({
        _id: `match-16-${i + 17}`,
        id: i + 17,
        name: `Raundi ${i + 1} ya 16`,
        nextMatchId: 25 + Math.floor(i / 2),
        tournamentRoundText: "2",
        startTime: null,
        state: "SCHEDULED",
        participants:
          joinedPlayers.length > i * 2 + 1
            ? [joinedPlayers[i * 2], joinedPlayers[i * 2 + 1]]
            : joinedPlayers.length > i * 2
            ? [joinedPlayers[i * 2]]
            : [], // Check if players exist
      })),
    ...Array(4)
      .fill()
      .map((_, i) => ({
        _id: `match-quarter-${i + 25}`,
        id: i + 25,
        name: `Quarter Final ${i + 1}`,
        nextMatchId: 29 + Math.floor(i / 2),
        tournamentRoundText: "Quarter Final",
        startTime: null,
        state: "SCHEDULED",
        participants: [],
      })),
    {
      _id: "match-semi-29",
      id: 29,
      name: "Semi Final 1",
      nextMatchId: 31,
      tournamentRoundText: "Semi Final",
      startTime: null,
      state: "SCHEDULED",
      participants: [],
    },
    {
      _id: "match-semi-30",
      id: 30,
      name: "Semi Final 2",
      nextMatchId: 31,
      tournamentRoundText: "Semi Final",
      startTime: null,
      state: "SCHEDULED",
      participants: [],
    },

    {
      _id: "match-final-31",
      id: 31,
      name: "Final",
      nextMatchId: null,
      tournamentRoundText: "Final",
      startTime: null,
      state: "SCHEDULED",
      participants: [],
    },
  ];

  const tournaments = [
    {
      _id: "67b48e0e16bb90541b5ee9db",
      name: "Paid Tournament",
      telegramGroupId: "-1002429990321",
      slug: "prizes",
      description: null,
      game: "kadi",
      format: "single elimination",
      startTime: null,
      numberOfParticipants: 4,
      status: "setup",
      createdAt: "2025-02-18T13:41:34.830Z",
      updatedAt: "2025-02-18T13:46:41.759Z",
      currentParticipants: 2,
      type: "paid",
      buyIn: {
        entryFee: 500,
        prizePool: 0,
      },
      sponsorshipDetails: {
        targetAmount: 0,
        currentAmount: 0,
        tiers: [],
        sponsors: [],
      },
      prizePool: {
        totalValue: 0,
      },
      matches: [
        {
          _id: "67b48e0f16bb90541b5ee9de",
          name: "Semi Final 1",
          nextMatchId: "3",
          tournamentRoundText: "Semi Final",
          startTime: null,
          state: "SCHEDULED",
          gameRoom: null,
          participants: [
            {
              userId: "66825741c87107bafeb5a6b7",
              name: "player1",
              resultText: null,
              isWinner: false,
            },
            {
              userId: "66b796ccc18c8e15519af3e6",
              name: "player2",
              resultText: null,
              isWinner: false,
            },
          ],
        },
        {
          _id: "67b48e0f16bb90541b5ee9e0",
          name: "Final",
          nextMatchId: null,
          tournamentRoundText: "Final",
          startTime: null,
          state: "SCHEDULED",
          gameRoom: null,
          participants: [],
        },
        {
          _id: "67b48e0f16bb90541b5ee9df",
          name: "Semi Final 2",
          nextMatchId: "3",
          tournamentRoundText: "Semi Final",
          startTime: null,
          state: "SCHEDULED",
          gameRoom: null,
          participants: [],
        },
      ],
      customBannerImage: null,
      creatorDetails: {
        _id: "66b796ccc18c8e15519af3e6",
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    },
    {
      _id: "67b49df616bb90541b5eed72",
      name: "Sponsored Tournament",
      telegramGroupId: "-1002429990321",
      slug: "pendex",
      description: null,
      game: "kadi",
      format: "single elimination",
      startTime: null,
      numberOfParticipants: 4,
      status: "draft",
      createdAt: "2025-02-18T14:49:26.799Z",
      updatedAt: "2025-02-21T06:47:28.392Z",
      currentParticipants: 0,
      type: "sponsored",
      sponsorshipDetails: {
        targetAmount: 100000,
        currentAmount: 0,
        scale: "micro",
        tiers: [
          {
            id: "legend",
            name: "Legend Sponsor",
            icon: "crown",
            color: "text-purple-500",
            bgColor: "bg-purple-500",
            amount: 100000,
            percentage: 100,
            maxSponsors: 1,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Tournament Naming Rights",
              "Full Table & Card Branding",
              "Legend Status in Community",
            ],
            productPerks: [
              "Exclusive Product Rights",
              "Custom Product Development",
              "Premium Brand Integration",
            ],
            productStrategy: {
              maxProducts: 5,
              priceRange: {
                min: 60000,
                max: 100000,
              },
              recommendedTypes: [],
            },
            _id: "67b49df616bb90541b5eed73",
          },
          {
            id: "champion",
            name: "Champion Sponsor",
            icon: "trophy",
            color: "text-yellow-500",
            bgColor: "bg-yellow-500",
            amount: 60000,
            percentage: 60,
            maxSponsors: 2,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Custom Card Skin(back) Design",
              "Champion Badge in Telegram",
              "Premium Sponsor Recognition",
            ],
            productPerks: [
              "Champion Product Line",
              "Limited Edition Items",
              "Premium Merchandise Rights",
            ],
            productStrategy: {
              maxProducts: 4,
              priceRange: {
                min: 35000,
                max: 60000,
              },
              recommendedTypes: [],
            },
            _id: "67b49df616bb90541b5eed74",
          },
          {
            id: "partner",
            name: "Tournament Partner",
            icon: "shield",
            color: "text-indigo-500",
            bgColor: "bg-indigo-500",
            amount: 35000,
            percentage: 35,
            maxSponsors: 3,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Small Logo on Game Room",
              "Partner Badge in Telegram",
              "Featured in Tournament Updates",
            ],
            productPerks: [
              "Partner Merchandise Rights",
              "Custom Product Options",
              "Exclusive Partner Products",
            ],
            productStrategy: {
              maxProducts: 3,
              priceRange: {
                min: 20000,
                max: 35000,
              },
              recommendedTypes: [],
            },
            _id: "67b49df616bb90541b5eed75",
          },
          {
            id: "community",
            name: "Community Supporter",
            icon: "users",
            color: "text-blue-500",
            bgColor: "bg-blue-500",
            amount: 20000,
            percentage: 20,
            maxSponsors: 5,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Access to Tournament Telegram Group",
              "Community Supporter Badge",
              "Tournament Update Notifications",
            ],
            productPerks: [
              "Access to Tournament Merchandise",
              "Early Product Access",
              "Supporter-Exclusive Items",
            ],
            productStrategy: {
              maxProducts: 2,
              priceRange: {
                min: 10000,
                max: 20000,
              },
              recommendedTypes: [],
            },
            _id: "67b49df616bb90541b5eed76",
          },
        ],
        totalSponsors: 11,
        sponsors: [
          {
            sponsorshipId: "67b7f0b3ad400ba231825f72",
            user: "67385e310ad454168de1ed6d",
            amount: 100000,
            currency: "KES",
            sponsoredAt: "2025-02-21T03:19:15.613Z",
            _id: "67b7f0b3ad400ba231825f74",
          },
          {
            sponsorshipId: "67b8218041f4bc01ef10e953",
            user: "66b796ccc18c8e15519af3e6",
            amount: 20000,
            currency: "KES",
            sponsoredAt: "2025-02-21T06:47:28.391Z",
            _id: "67b8218041f4bc01ef10e955",
          },
        ],
      },
      prizePool: {
        totalValue: 40000,
      },
      matches: [
        {
          _id: "67b49df716bb90541b5eed7b",
          name: "Final",
          nextMatchId: null,
          tournamentRoundText: "Final",
          startTime: null,
          state: "SCHEDULED",
          gameRoom: null,
          participants: [],
        },
        {
          _id: "67b49df716bb90541b5eed79",
          name: "Semi Final 1",
          nextMatchId: "3",
          tournamentRoundText: "Semi Final",
          startTime: null,
          state: "SCHEDULED",
          gameRoom: null,
          participants: [],
        },
        {
          _id: "67b49df716bb90541b5eed7a",
          name: "Semi Final 2",
          nextMatchId: "3",
          tournamentRoundText: "Semi Final",
          startTime: null,
          state: "SCHEDULED",
          gameRoom: null,
          participants: [],
        },
      ],
      customBannerImage:
        "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/tournaments/67b2305b1b6d1bc3e66aab56/banner/kaditournament.png",
      creatorDetails: {
        _id: "66b796ccc18c8e15519af3e6",
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    },
  ];

  const viewedTournaments = [
    {
      _id: "67b48e0e16bb90541b5ee9db",
      creator: {
        _id: "66b796ccc18c8e15519af3e6",
        name: "organiser",
        username: user.username,
        profilePicture: user.profilePicture,
      },
      name: "Paid Tournament",
      telegramGroupId: "-1002429990321",
      description: null,

      game: "kadi",
      autoStart: false,
      format: "single elimination",
      type: "paid",
      sponsorshipDetails: {
        targetAmount: 0,
        currentAmount: 0,
        tiers: [],
        sponsors: [],
      },
      prizeDistribution: {
        first: 100,
        second: 0,
        third: 0,
      },
      buyIn: {
        entryFee: 500,
        prizePool: 0,
      },
      numberOfParticipants: 16,
      status: "setup",
      slug: "prizes",
      brandingLogo: null,
      customBannerImage: null,
      customTableBackgroundImage:
        "https://wufwuf-bucket.s3.ap-south-1.amazonaws.com/images/cardsBackground.webp",
      customCardSkinImage:
        "https://wufwuf-bucket.s3.ap-south-1.amazonaws.com/images/backred.png",
      createdAt: "2025-02-18T13:41:34.830Z",
      sponsors: [],
      matches: sixteenPlayerMatches,
      currentParticipants: 11,
      telegramGroup: {
        _id: "679a342885f47d45b79499d8",
        botPermissions: {
          canInviteViaLink: true,
          canManageStories: true,
        },
        memberCount: 3,
        name: "telegram test 3",
        type: "supergroup",
        botRole: "admin",
        inviteLink: "https://t.me/+EZ6BHaHvRchjODdk",
      },
      sponsorCount: 0,
      totalSponsorship: 0,
    },
    {
      _id: "67bc3f65ef47d7ecd6ad3aa8",
      creator: {
        _id: "66b796ccc18c8e15519af3e6",
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      name: "Sponsored Tournament",
      telegramGroupId: "-1002429990321",
      description: null,
      paymentInformation: {
        type: "phoneNumber",
        details: "0723030589",
        verified: false,
      },
      game: "kadi",
      autoStart: false,
      format: "single elimination",
      type: "sponsored",
      sponsorshipDetails: {
        targetAmount: 100000,
        currentAmount: 0,
        scale: "micro",
        tiers: [
          {
            id: "legend",
            name: "Legend Sponsor",
            icon: "crown",
            color: "text-purple-500",
            bgColor: "bg-purple-500",
            amount: 100000,
            percentage: 100,
            maxSponsors: 1,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Tournament Naming Rights",
              "Full Table & Card Branding",
              "Legend Status in Community",
            ],
            productPerks: [
              "Exclusive Product Rights",
              "Custom Product Development",
              "Premium Brand Integration",
            ],
            productStrategy: {
              maxProducts: 5,
              priceRange: {
                min: 60000,
                max: 100000,
              },
              recommendedTypes: [],
            },
            _id: "67bc3f65ef47d7ecd6ad3aa9",
          },
          {
            id: "champion",
            name: "Champion Sponsor",
            icon: "trophy",
            color: "text-yellow-500",
            bgColor: "bg-yellow-500",
            amount: 60000,
            percentage: 60,
            maxSponsors: 2,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Custom Card Skin(back) Design",
              "Champion Badge in Telegram",
              "Premium Sponsor Recognition",
            ],
            productPerks: [
              "Champion Product Line",
              "Limited Edition Items",
              "Premium Merchandise Rights",
            ],
            productStrategy: {
              maxProducts: 4,
              priceRange: {
                min: 35000,
                max: 60000,
              },
              recommendedTypes: [],
            },
            _id: "67bc3f65ef47d7ecd6ad3aaa",
          },
          {
            id: "partner",
            name: "Tournament Partner",
            icon: "shield",
            color: "text-indigo-500",
            bgColor: "bg-indigo-500",
            amount: 35000,
            percentage: 35,
            maxSponsors: 3,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Small Logo on Game Room",
              "Partner Badge in Telegram",
              "Featured in Tournament Updates",
            ],
            productPerks: [
              "Partner Merchandise Rights",
              "Custom Product Options",
              "Exclusive Partner Products",
            ],
            productStrategy: {
              maxProducts: 3,
              priceRange: {
                min: 20000,
                max: 35000,
              },
              recommendedTypes: [],
            },
            _id: "67bc3f65ef47d7ecd6ad3aab",
          },
          {
            id: "community",
            name: "Community Supporter",
            icon: "users",
            color: "text-blue-500",
            bgColor: "bg-blue-500",
            amount: 20000,
            percentage: 20,
            maxSponsors: 5,
            currentSponsors: 0,
            directSponsorshipPerks: [
              "Access to Tournament Telegram Group",
              "Community Supporter Badge",
              "Tournament Update Notifications",
            ],
            productPerks: [
              "Access to Tournament Merchandise",
              "Early Product Access",
              "Supporter-Exclusive Items",
            ],
            productStrategy: {
              maxProducts: 2,
              priceRange: {
                min: 10000,
                max: 20000,
              },
              recommendedTypes: [],
            },
            _id: "67bc3f65ef47d7ecd6ad3aac",
          },
        ],
        totalSponsors: 11,
        sponsors: [],
      },
      prizeDistribution: {
        first: 50,
        second: 30,
        third: 20,
      },
      numberOfParticipants: 16,
      status: "setup",
      slug: "testprod",
      brandingLogo: null,
      customBannerImage: null,
      customTableBackgroundImage:
        "https://wufwuf-bucket.s3.ap-south-1.amazonaws.com/images/cardsBackground.webp",
      customCardSkinImage:
        "https://wufwuf-bucket.s3.ap-south-1.amazonaws.com/images/backred.png",
      createdAt: "2025-02-24T09:44:05.562Z",
      sponsors: [],
      matches: sixteenPlayerMatches,
      currentParticipants: 11,
      telegramGroup: {
        _id: "679a342885f47d45b79499d8",
        botPermissions: {
          canInviteViaLink: true,
          canManageStories: true,
        },
        memberCount: 3,
        name: "telegram test 3",
        type: "supergroup",
        botRole: "admin",
        inviteLink: "https://t.me/+EZ6BHaHvRchjODdk",
      },
      sponsorCount: 0,
      totalSponsorship: 0,
    },
  ];

  const analytics = {
    revenue: { today: 150000, week: 900000, month: 3500000, total: 12000000 },
    participants: { today: 120, week: 700, month: 2800, total: 10000 },
    tournaments: { active: 15, total: 50 },
    prizePool: { average: 500000 },
  };

  const revenueData = {
    data: {
      allTime: {
        timeSeriesData: [
          {
            date: "2023-01",
            buyInRevenue: 1000000,
            sponsorshipRevenue: 500000,
          },
          {
            date: "2023-02",
            buyInRevenue: 1200000,
            sponsorshipRevenue: 600000,
          },
          {
            date: "2023-03",
            buyInRevenue: 1500000,
            sponsorshipRevenue: 750000,
          },
          {
            date: "2023-04",
            buyInRevenue: 1800000,
            sponsorshipRevenue: 900000,
          },
          {
            date: "2023-05",
            buyInRevenue: 2000000,
            sponsorshipRevenue: 1000000,
          },
          {
            date: "2023-06",
            buyInRevenue: 2200000,
            sponsorshipRevenue: 1100000,
          },
        ],
        totals: {
          totalRevenue: 9750000,
          buyInRevenue: 9700000,
          sponsorshipRevenue: 4850000,
        },
      },
      daily: {
        timeSeriesData: [
          {
            date: "2023-10-26",
            buyInRevenue: 50000,
            sponsorshipRevenue: 25000,
          },
          {
            date: "2023-10-27",
            buyInRevenue: 60000,
            sponsorshipRevenue: 30000,
          },
          {
            date: "2023-10-28",
            buyInRevenue: 70000,
            sponsorshipRevenue: 35000,
          },
          {
            date: "2023-10-29",
            buyInRevenue: 80000,
            sponsorshipRevenue: 40000,
          },
        ],
        totals: {
          totalRevenue: 360000,
          buyInRevenue: 260000,
          sponsorshipRevenue: 130000,
        },
      },
      weekly: {
        timeSeriesData: [
          { date: "Week 1", buyInRevenue: 200000, sponsorshipRevenue: 100000 },
          { date: "Week 2", buyInRevenue: 250000, sponsorshipRevenue: 125000 },
          { date: "Week 3", buyInRevenue: 300000, sponsorshipRevenue: 150000 },
          { date: "Week 4", buyInRevenue: 350000, sponsorshipRevenue: 175000 },
        ],
        totals: {
          totalRevenue: 1300000,
          buyInRevenue: 1100000,
          sponsorshipRevenue: 550000,
        },
      },
      monthly: {
        timeSeriesData: [
          { date: "2023-10", buyInRevenue: 800000, sponsorshipRevenue: 400000 },
          { date: "2023-11", buyInRevenue: 900000, sponsorshipRevenue: 450000 },
          {
            date: "2023-12",
            buyInRevenue: 1000000,
            sponsorshipRevenue: 500000,
          },
        ],
        totals: {
          totalRevenue: 2700000,
          buyInRevenue: 2700000,
          sponsorshipRevenue: 1350000,
        },
      },
    },
  };

  const tournamentsData = {
    data: {
      allTime: {
        timeSeriesData: [
          { date: "2023-01", tournaments: 10, matches: 50, participants: 200 },
          { date: "2023-02", tournaments: 12, matches: 60, participants: 240 },
          { date: "2023-03", tournaments: 15, matches: 75, participants: 300 },
          { date: "2023-04", tournaments: 18, matches: 90, participants: 360 },
          { date: "2023-05", tournaments: 20, matches: 100, participants: 400 },
          { date: "2023-06", tournaments: 22, matches: 110, participants: 440 },
        ],
        totals: { totalTournaments: 97, matches: 485, participants: 1940 },
      },
      daily: {
        timeSeriesData: [
          { date: "2023-10-26", tournaments: 1, matches: 5, participants: 20 },
          { date: "2023-10-27", tournaments: 1, matches: 6, participants: 24 },
          { date: "2023-10-28", tournaments: 2, matches: 7, participants: 28 },
          { date: "2023-10-29", tournaments: 2, matches: 8, participants: 32 },
        ],
        totals: { totalTournaments: 6, matches: 26, participants: 104 },
      },
      weekly: {
        timeSeriesData: [
          { date: "Week 1", tournaments: 4, matches: 20, participants: 80 },
          { date: "Week 2", tournaments: 5, matches: 25, participants: 100 },
          { date: "Week 3", tournaments: 6, matches: 30, participants: 120 },
          { date: "Week 4", tournaments: 7, matches: 35, participants: 140 },
        ],
        totals: { totalTournaments: 22, matches: 110, participants: 440 },
      },
      monthly: {
        timeSeriesData: [
          { date: "2023-10", tournaments: 8, matches: 40, participants: 160 },
          { date: "2023-11", tournaments: 9, matches: 45, participants: 180 },
          { date: "2023-12", tournaments: 10, matches: 50, participants: 200 },
        ],
        totals: { totalTournaments: 27, matches: 135, participants: 540 },
      },
    },
  };
  // DATA ENDS

  const [timeRange, setTimeRange] = useState("daily");
  const [viewTournament, setViewTournament] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const [showBracket, setShowBracket] = useState(false);

  const [currentTournament, setCurrentTournament] = useState(0);
  const [activeTab, setActiveTab] = useState("create");
  const [activeAnalytics, setActiveAnalytics] = useState("overview");

  const preview = "";

  const data1 = revenueData?.data?.[timeRange]?.timeSeriesData || [];
  const totals1 = revenueData?.data?.[timeRange]?.totals || {
    totalRevenue: 0,
    buyInRevenue: 0,
    sponsorshipRevenue: 0,
  };

  const data2 = tournamentsData?.data?.[timeRange]?.timeSeriesData || [];
  const totals2 = tournamentsData?.data?.[timeRange]?.totals || {
    totalTournaments: 0,
    tournaments: 0,
    matches: 0,
    participants: 0,
  };

  const _currentTournament = viewedTournaments[currentTournament];

  const toggleBracket = () => {
    setShowBracket(!showBracket);
  };

  const convertAmount = (amount) => {
    const wholeUnits = amount / 100;
    const converted = wholeUnits * 1;

    return Math.round(converted);
  };

  const handleViewTournament = (index) => {
    setCurrentTournament(index);
    setViewTournament(true);

    dispatch(
      init_page({
        page_title: `Tournament`,
      })
    );
  };

  const handleViewProfile = () => {
    setViewTournament(false);

    dispatch(
      init_page({
        page_title: `Profile`,
      })
    );
  };

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

  const navItems = [
    { icon: Home, label: "Overview", index: 0 },
    { icon: Users, label: "People", index: 1 },
    {
      icon: Trophy,
      label: "Matches",
      index: 2,
      showBadge: true,
      badgeContent: 2,
    },
    { icon: MessageCircle, label: "Discussion", index: 3 },
  ];

  // Conditionally add Sponsors button for sponsored tournaments
  if (_currentTournament?.type === "sponsored") {
    navItems.push({ icon: Gift, label: "Sponsors", index: 4 });
  }

  if (_currentTournament && !isMobile) {
    navItems.push({
      icon: SettingsIcon,
      label: "Settings",
      index: navItems.length,
    });
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusStyle = (status) => {
    const styles = {
      draft: "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
      setup: "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400",
      ready:
        "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      "in-progress":
        "bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400",
      completed:
        "bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400",
    };
    return (
      styles[status] ||
      "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
    );
  };

  const canEdit = false;

  const handleTabChange = (index) => {
    // Generate tab names dynamically based on the actual navItems
    const tabNames = navItems.map((item) => {
      switch (item.label.toLowerCase()) {
        case "overview":
          return "overview";
        case "people":
          return "participation";
        case "matches":
          return "matches";
        case "discussion":
          return "discussion";
        case "sponsors":
          return "sponsorship";
        case "settings":
          return "settings";
        default:
          return item.label.toLowerCase();
      }
    });

    const selectedTab = tabNames[index];

    setCurrentTab(index);

    setShowBracket(false);
  };

  return (
    <>
      {!viewTournament ? (
        <>
          <div className="w-full max-w-3xl mx-auto overflow-hidden">
            <ProfileHeader
              user={user}
              onEdit={() => {
                return;
              }}
              canEdit={canEdit}
            />

            <div className="mt-20 px-4">
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

              <ProfileSocials socials={socials} />
            </div>

            <div className="w-full flex flex-col gap-2">
              <header className="space-y-2 mb-8">
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      Your Tournaments
                    </h1>
                  </div>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled
                        className="shrink-0"
                      >
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">Filter tournaments</span>
                      </Button>
                      <div className="relative w-full sm:w-[250px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search tournaments..."
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Trophy className="mr-1 h-4 w-4" />
                    <span>2 Tournaments</span>
                  </div>
                  <div>Updated {new Date().toLocaleDateString()}</div>
                </div>
              </header>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {tournaments.map((tournament, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <Card className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
                      <Link href="#!" className="flex-1">
                        <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
                          <img
                            src={user.headerImage}
                            alt={`${tournament.name} banner`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />

                          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />

                          {/* Tournament info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex flex-col gap-3">
                              {/* Top row with title and participants */}
                              <div className="flex justify-between items-start">
                                <ScrollingText
                                  text={tournament.name}
                                  className="text-md md:text-xl font-bold text-shadow-sm"
                                />
                                <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1">
                                  <Users2 className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {tournament.currentParticipants}/
                                    {tournament.numberOfParticipants}
                                  </span>
                                </div>
                              </div>

                              {/* Bottom row with creator info and tournament type */}
                              <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6 ring-1 ring-white/30">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>
                                      {user.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {user.name}
                                    </span>
                                    <span className="text-xs text-white/80">
                                      @{user.username}
                                    </span>
                                  </div>
                                </div>
                                {tournament.type === "paid" ? (
                                  <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                                    <Coins className="h-3 w-3 mr-1" />
                                    Buy-in: KSH{" "}
                                    {tournament.buyIn?.entryFee?.toLocaleString()}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                    <Gift className="h-3 w-3 mr-1" />
                                    Sponsored
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <CardHeader className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className={getStatusStyle(tournament.status)}
                            >
                              {tournament.status === "in-progress" && (
                                <PlayCircle className="h-3 w-3 mr-1" />
                              )}
                              {tournament.status === "completed" && (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              {tournament.status === "ready" && (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {tournament.status}
                            </Badge>{" "}
                            <Badge variant="outline" className="capitalize">
                              <Gamepad2 className="h-3 w-3 mr-1" />
                              {tournament.game}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 space-y-4">
                          {tournament.type === "paid" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Prize Pool
                                </span>
                                <span className="font-semibold">40%</span>
                              </div>
                              <Progress value={60} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Current: KSH 1000</span>
                                <span>Maximum: KSH 10000</span>
                              </div>
                            </div>
                          )}

                          {tournament.type === "sponsored" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Sponsorship Goal
                                </span>
                                <span className="font-semibold">20 %</span>
                              </div>
                              <Progress value={30} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Current: KSH 200</span>
                                <span>Target: KSH 1000</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Link>

                      <CardFooter className="px-2 flex gap-2">
                        <Button
                          onClick={() => handleViewTournament(index)}
                          className="flex-1 w-full text-xs sm:text-sm py-1 sm:py-2"
                        >
                          View Tournament
                        </Button>

                        <Button variant="outline" className="px-2 sm:px-3">
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Tabs value={activeAnalytics} onValueChange={setActiveAnalytics}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card className="border-none">
                    <CardContent className="p-6 space-y-8">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-sm font-medium text-foreground">
                                {user.name}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                @{user.username}
                              </span>
                            </div>
                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                              <Crown size={12} />
                              <span>Overview Analytics</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard
                          title="Total Revenue"
                          value={analytics.revenue.total}
                          icon={Trophy}
                          currency={"KES"}
                          exchangeRate={1}
                        />
                        <StatCard
                          title="Total Participants"
                          value={analytics.participants.total}
                          icon={Users}
                          currency={"KES"}
                          exchangeRate={1}
                        />
                        <StatCard
                          title="Active Tournaments"
                          value={analytics.tournaments.active}
                          icon={Trophy}
                          currency={"KES"}
                          exchangeRate={1}
                        />
                        <StatCard
                          title="Total Tournaments"
                          value={analytics.tournaments.total}
                          icon={Trophy}
                          currency={"KES"}
                          exchangeRate={1}
                        />
                        <PrizePoolCard
                          title="Average Prize Pool"
                          value={analytics.prizePool.average}
                          icon={Award}
                          currency={"KES"}
                          exchangeRate={1}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue">
                  <div className="w-full max-w-6xl mx-auto p-6 bg-background rounded-xl shadow-lg dark:shadow-none">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
                      <div className="flex items-center gap-2">
                        <>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-foreground">
                                {user.name}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                @{user.username}
                              </span>
                            </div>
                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                              <Crown size={12} />
                              <span>Revenue Analytics</span>
                            </div>
                          </div>
                        </>
                      </div>

                      <div className="flex items-center gap-2 ml-14 sm:ml-0">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allTime">All Time</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg dark:from-blue-950 dark:to-blue-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          KES
                          {convertAmount(totals1.totalRevenue).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg dark:from-purple-950 dark:to-purple-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total Buy-in Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          KES
                          {convertAmount(totals1.buyInRevenue).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg dark:from-green-950 dark:to-green-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total Sponsorship Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          KES
                          {convertAmount(
                            totals1.sponsorshipRevenue
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={data1}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="dark:stroke-gray-700"
                          />
                          <XAxis
                            dataKey="date"
                            className="dark:fill-gray-400"
                            stroke="currentColor"
                          />
                          <YAxis
                            className="dark:fill-gray-400"
                            stroke="currentColor"
                            tickFormatter={(value) =>
                              `KES ${convertAmount(value)}`
                            }
                          />
                          <ChartTooltip
                            formatter={(value) => [
                              `KES ${convertAmount(value)}`,
                              null,
                            ]}
                            contentStyle={{
                              backgroundColor: "var(--background)",
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              color: "var(--foreground)",
                            }}
                          />
                          <Legend className="dark:fill-gray-400" />
                          <defs>
                            <linearGradient
                              id="buyInGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#8884d8"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#8884d8"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="sponsorshipGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#82ca9d"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#82ca9d"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="buyInRevenue"
                            stroke="#8884d8"
                            fill="url(#buyInGradient)"
                            name="Buy-in Revenue"
                            stackId="1"
                          />
                          <Area
                            type="monotone"
                            dataKey="sponsorshipRevenue"
                            stroke="#82ca9d"
                            fill="url(#sponsorshipGradient)"
                            name="Sponsorship Revenue"
                            stackId="1"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tournaments">
                  <div className="w-full max-w-6xl mx-auto p-6 bg-background rounded-xl shadow-lg dark:shadow-none">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
                      <div className="flex items-center gap-2">
                        <>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-foreground">
                                {user.name}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                @{user.username}
                              </span>
                            </div>
                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                              <Crown size={12} />
                              <span>Tournament Analytics</span>
                            </div>
                          </div>
                        </>
                      </div>

                      <div className="flex items-center gap-2 ml-14 sm:ml-0">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allTime">All Time</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg dark:from-indigo-950 dark:to-indigo-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total Tournaments
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {totals2.totalTournaments?.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg dark:from-orange-950 dark:to-orange-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total Matches
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {totals2.matches?.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg dark:from-cyan-950 dark:to-cyan-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total Participants
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {totals2.participants?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={data2}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="dark:stroke-gray-700"
                          />
                          <XAxis
                            dataKey="date"
                            className="dark:fill-gray-400"
                            stroke="currentColor"
                          />
                          <YAxis
                            className="dark:fill-gray-400"
                            stroke="currentColor"
                          />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: "var(--background)",
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              color: "var(--foreground)",
                            }}
                          />
                          <Legend className="dark:fill-gray-400" />
                          <defs>
                            <linearGradient
                              id="tournamentsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#818cf8"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#818cf8"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="matchesGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#fb923c"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#fb923c"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="participantsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#22d3ee"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#22d3ee"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="tournaments"
                            stroke="#818cf8"
                            fill="url(#tournamentsGradient)"
                            name="Tournaments"
                          />
                          <Area
                            type="monotone"
                            dataKey="matches"
                            stroke="#fb923c"
                            fill="url(#matchesGradient)"
                            name="Matches"
                          />
                          <Area
                            type="monotone"
                            dataKey="participants"
                            stroke="#22d3ee"
                            fill="url(#participantsGradient)"
                            name="Participants"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      ) : (
        <div
          className="w-full max-w-3xl mx-auto flex flex-col gap-4 md:gap-8"
          style={{ minHeight: "100vh" }}
        >
          <Card className="bg-background/95 shadow-lg border-0 overflow-hidden">
            {/* Banner Area with Fixed Aspect Ratio */}
            <div className="relative w-full aspect-[4/1]">
              {user.headerImage ? (
                <Image
                  src={user.headerImage}
                  alt="Tournament banner"
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="100vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
              )}

              {/* Floating Action Buttons */}
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/40 backdrop-blur-sm border-0 text-white h-8 w-8"
                  onClick={() => handleViewProfile()}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/40 backdrop-blur-sm border-0 text-white h-8 w-8"
                  onClick={() => setCurrentTab(5)}
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Status Badge - Prominently displayed on banner */}
              {!isMobile && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
                  <Badge
                    className={`${getStatusStyle(
                      _currentTournament.status
                    )} py-1 px-2 text-xs`}
                  >
                    {_currentTournament.status === "completed" ? (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-purple-500" />
                        <span className="truncate">Champion: @champion</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        <span>
                          {_currentTournament.status === "open"
                            ? "Registration Open"
                            : _currentTournament.status}
                        </span>
                      </div>
                    )}
                  </Badge>

                  <div className="flex flex-col gap-3 items-end">
                    <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1">
                      <Users2 className="h-4 w-4 text-white" />
                      <span className="text-sm font-bold text-gray-300">
                        {_currentTournament.currentParticipants}/
                        {_currentTournament.numberOfParticipants}
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      {_currentTournament.type === "paid" ? (
                        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                          <Coins className="h-3 w-3 mr-1" />
                          Buy-in: KSH{" "}
                          {_currentTournament.buyIn?.entryFee?.toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                          <Gift className="h-3 w-3 mr-1" />
                          Sponsored
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tournament Info Section - Compact design */}
            <div className="p-3 space-y-2">
              {/* Tournament Name and Creator */}
              <div className="relative space-y-1.5">
                <h3 className="text-base font-bold leading-tight line-clamp-1">
                  {_currentTournament.name}
                </h3>

                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5 ring-1 ring-dark/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/${user.username}`}
                    className="text-xs text-dark/70 flex items-end truncate"
                    title={user.name + " @" + user.username}
                  >
                    <div className="flex flex-col">
                      <span>{user.name}</span> <span>@{user.username}</span>
                    </div>
                    <div>
                      •{" "}
                      {new Date(
                        _currentTournament.createdAt
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </Link>
                </div>

                {isMobile && (
                  <div className="absolute top-0 right-0">
                    <Badge
                      className={`${getStatusStyle(
                        _currentTournament.status
                      )} py-1 px-2 text-xs`}
                    >
                      {_currentTournament.status === "completed" ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-purple-500" />
                          <span className="truncate">Champion: @champion</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <PlayCircle className="h-3 w-3" />
                          <span>
                            {_currentTournament.status === "open"
                              ? "Registration Open"
                              : _currentTournament.status}
                          </span>
                        </div>
                      )}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Key Tournament Details - Important info at a glance */}
              <div className="grid grid-cols-2 gap-2">
                {isMobile && (
                  <div className="flex items-center gap-1.5">
                    <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">
                      <span className="font-medium">
                        {_currentTournament.currentParticipants}
                      </span>
                      <span className="text-muted-foreground">
                        /{_currentTournament.numberOfParticipants}
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium capitalize">
                    Single-elimination
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">kadi</span>
                </div>

                {isMobile && (
                  <>
                    {_currentTournament.type === "paid" ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-xs font-medium">
                            KSH{" "}
                            {_currentTournament.buyIn?.entryFee?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-medium">Sponsored</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {_currentTournament.type === "paid" ? (
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <PiggyBank className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-xs font-medium">Prize Pool</span>
                    </div>

                    <span className="font-semibold">{Math.round(68)}%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Current: KSH{" "}
                      {_currentTournament.buyIn?.entryFee *
                        _currentTournament.currentParticipants}
                    </span>
                    <span>
                      Target: KSH{" "}
                      {_currentTournament.buyIn?.entryFee *
                        _currentTournament.numberOfParticipants}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <Gift className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-medium">
                        Sponsorship Goal
                      </span>
                    </div>

                    <span className="font-semibold">{Math.round(20)}%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: KSH 4000</span>
                    <span>Target: KSH 10,000</span>
                  </div>
                </div>
              )}
            </div>

            {/* Prize or Sponsorship Section */}
            <div className="px-3 py-1 md:py-2">
              <div className="grid grid-cols-3 gap-1.5">
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-yellow-500/10 to-transparent p-2">
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <Trophy className="h-12 w-12 text-yellow-500/20 rotate-12 translate-x-4 -translate-y-4" />
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    1st Place
                  </div>
                  <div className="text-xs font-bold text-yellow-500">
                    KSH 3600
                  </div>
                  <div className="text-[8px] text-muted-foreground">60%</div>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-slate-500/10 to-transparent p-2">
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <Trophy className="h-10 w-10 text-slate-500/20 rotate-12 translate-x-4 -translate-y-4" />
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    2nd Place
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    KSH 1500
                  </div>
                  <div className="text-[8px] text-muted-foreground">25%</div>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-orange-500/10 to-transparent p-2">
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <Trophy className="h-8 w-8 text-orange-500/20 rotate-12 translate-x-4 -translate-y-4" />
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    3rd Place
                  </div>
                  <div className="text-xs font-bold text-orange-500">
                    KSH 900
                  </div>
                  <div className="text-[8px] text-muted-foreground">15%</div>
                </div>
              </div>
            </div>

            {/* Main CTA Button */}
            <div className="px-3 pb-3">
              <Button className="w-full text-sm gap-1.5 py-5">
                <Coins className="h-4 w-4" />
                Enter for KSH 40
              </Button>
            </div>

            {/* Navigation Bar */}
            <div className="w-full bg-background/80 backdrop-blur-md border-t dark:border-slate-800 z-50 rounded-b-xl">
              {" "}
              <div className="max-w-3xl mx-auto">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
                  }}
                >
                  {navItems.map(
                    ({ icon: Icon, label, index, showBadge, badgeContent }) => (
                      <Button
                        key={label}
                        variant="ghost"
                        className={`
              h-14 relative group transition-colors duration-200 px-0.5
              hover:bg-muted/50 dark:hover:bg-muted/20
              ${
                currentTab === index
                  ? "text-primary dark:text-primary"
                  : "text-muted-foreground"
              }
            `}
                        onClick={() => handleTabChange(index)}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <Icon
                            className={`w-4 h-4 ${
                              currentTab === index
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span className="text-[10px] font-medium truncate w-full text-center">
                            {label}
                          </span>
                        </div>
                        {showBadge && badgeContent > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 right-[20%] scale-75 px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center"
                          >
                            {badgeContent}
                          </Badge>
                        )}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>

          {showBracket ? (
            <>
              <Button onClick={toggleBracket} variant="outline">
                <Trophy className="w-4 h-4" />
                Hide Bracket
              </Button>

              <Card>
                <CardHeader className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <CardTitle className="text-xl md:text-2xl">Bracket</CardTitle>
                </CardHeader>

                <CardContent className="overflow-x-auto px-0 sm:px-4">
                  <CustomMatchBracket matches={_currentTournament?.matches} />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {currentTab === 0 && (
                <>
                  <Button onClick={toggleBracket} variant="outline">
                    <Trophy className="w-4 h-4" />
                    View Bracket
                  </Button>

                  <Overview
                    tournament={_currentTournament}
                    creatorId={1}
                    tournamentId={_currentTournament._id}
                    matches={_currentTournament?.matches}
                    tournamentStatus={_currentTournament?.status}
                  />
                </>
              )}

              {currentTab === 1 && (
                <>
                  <Participation
                    tournament={_currentTournament}
                    setShowVerification={null}
                    setIsOpenEntry={null}
                  />
                </>
              )}

              {currentTab === 2 && (
                <>
                  <Games
                    matches={_currentTournament.matches}
                    tournamentStatus={_currentTournament?.status}
                    tournamentSlug={_currentTournament.slug}
                  />
                </>
              )}

              {currentTab === 3 && (
                <>
                  <TournamentComments
                    tournamentId={_currentTournament._id}
                    isCreator={true}
                  />
                </>
              )}

              {currentTab === 4 && _currentTournament?.type === "sponsored" && (
                <>
                  <Sponsorship
                    tournamentId={_currentTournament._id}
                    tournamentName={_currentTournament.name}
                    tournamentSlug={_currentTournament.slug}
                    sponsorshipDetails={_currentTournament.sponsorshipDetails}
                    sponsors={_currentTournament.sponsors}
                    tournamentCreator={_currentTournament.creator}
                    handleTabChange={handleTabChange}
                    tournamentStatus={_currentTournament.status}
                    products={[]}
                    paymentInformation={_currentTournament.paymentInformation}
                  />
                </>
              )}

              {((currentTab === 4 && _currentTournament?.type === "paid") ||
                currentTab === 5) && (
                <div className="">
                  <motion.div
                    className="space-y-4 sm:space-y-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {/* <motion.div variants={cardVariants}> */}
                    <Accordion
                      type="single"
                      collapsible
                      // defaultValue="basic-info"
                    >
                      <motion.div variants={cardVariants}>
                        <AccordionItem value="basic-info">
                          <AccordionTrigger className="text-lg md:text-xl">
                            Basic Info
                          </AccordionTrigger>
                          <AccordionContent>
                            <Card className="p-4 space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <div className="relative">
                                  <Input
                                    id="name"
                                    name="name"
                                    className="pr-10"
                                    readOnly
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <InfoIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          The tournament name cannot be changed
                                          once set. This ensures consistency and
                                          avoids confusion for participants.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" />
                              </div>
                            </Card>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>

                      <motion.div variants={cardVariants}>
                        <AccordionItem value="game">
                          <AccordionTrigger className="text-lg md:text-xl">
                            Game Info
                          </AccordionTrigger>
                          <AccordionContent>
                            <Card className="p-4 space-y-4">
                              <div className="space-y-4">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                  <Gamepad2 className="h-4 w-4" />
                                  Gameplay Settings
                                </h3>

                                <div className="flex items-start justify-between py-3">
                                  <div className="space-y-1">
                                    <h3 className="font-medium">
                                      Turn Timer (30s)
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Enable 30-second timer for each turn
                                    </p>
                                  </div>
                                  <Switch checked={true} />
                                </div>
                              </div>

                              {_currentTournament.type === "paid" && (
                                <>
                                  <Separator className="my-4" />

                                  <div className="space-y-4">
                                    <div className="flex items-start justify-between py-3">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium">
                                            Automatic Tournament Start
                                          </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          Automatically start the tournament
                                          when the last player joins
                                        </p>
                                      </div>
                                      <Switch checked={true} />
                                    </div>

                                    <div className="rounded-lg bg-muted p-4 text-sm space-y-3">
                                      <div className="flex items-start gap-2">
                                        <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div className="space-y-2">
                                          <p>When enabled:</p>
                                          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                            <li>
                                              Tournament starts immediately when
                                              player count reaches 32
                                            </li>
                                            <li>
                                              Players are automatically assigned
                                              to their matches
                                            </li>
                                            {/* <li>
                                    All participants receive start notifications
                                  </li>
                                  <li>
                                    Timer countdown begins for first matches
                                  </li> */}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </Card>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>

                      <motion.div variants={cardVariants}>
                        <AccordionItem value="tournament-chat">
                          <AccordionTrigger className="text-lg md:text-xl">
                            Tournament Chat
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* <Card className="p-4 space-y-4"> */}
                            {_currentTournament.telegramGroup ? (
                              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <img
                                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${_currentTournament?.telegramGroup.name}`}
                                      alt={"name"}
                                      className="h-10 w-10 rounded-full bg-background"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-[#0088cc] rounded-full p-1">
                                      <Send className="h-3 w-3 text-white" />
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                      tournament telegram group name
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        100 members
                                      </Badge>
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      Official tournament chat • Bot status:
                                      Active
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  // onClick={() =>
                                  //   window.open(
                                  //     tournament?.telegramGroup.inviteLink,
                                  //     "_blank"
                                  //   )
                                  // }
                                  title="Open in Telegram"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground text-center p-4">
                                Tournament chat information unavailable
                              </div>
                            )}
                            {/* </Card> */}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>

                      {_currentTournament.type === "sponsored" && (
                        <motion.div variants={cardVariants}>
                          <AccordionItem value="sponsorships">
                            <AccordionTrigger className="text-lg md:text-xl">
                              Sponsorship Products
                            </AccordionTrigger>
                            <AccordionContent>
                              <Card className="w-full">
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                      <CardTitle className="flex flex-col md:flex-row items-center gap-2">
                                        <span className="flex items-center gap-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs truncate"
                                          >
                                            Target: 1000 KES
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="text-xs capitalize truncate"
                                          >
                                            Large Tournament
                                          </Badge>
                                        </span>
                                      </CardTitle>
                                      <CardDescription>
                                        Create and manage sponsorship products
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                  <Tabs
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                  >
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="create">
                                        Create
                                      </TabsTrigger>
                                      <TabsTrigger value="manage">
                                        Manage
                                      </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="create">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                            <Package className="h-5 w-5" />
                                            New Product
                                          </CardTitle>
                                          <CardDescription>
                                            Will be assigned to community tier
                                          </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                          <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                              id="name"
                                              placeholder="Product name"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="description">
                                              Description
                                            </Label>
                                            <Textarea
                                              id="description"
                                              placeholder="Product description"
                                              className="min-h-[100px]"
                                            />
                                          </div>

                                          <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label
                                                  htmlFor="price"
                                                  className="flex items-center gap-2"
                                                >
                                                  Price (KSH)
                                                  <TooltipProvider
                                                    delayDuration={100}
                                                  >
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <Info className="h-4 w-4 text-muted-foreground" />
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>
                                                          Recommended: Add
                                                          30-40% markup to cover
                                                          profit sharing
                                                        </p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </TooltipProvider>
                                                </Label>
                                                <Input
                                                  id="price"
                                                  type="number"
                                                  min="0"
                                                  max="20000"
                                                  className="pr-12"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="inventory">
                                                  Stock
                                                </Label>
                                                <Input
                                                  id="inventory"
                                                  type="number"
                                                  min="1"
                                                />
                                              </div>
                                            </div>

                                            <Card className="bg-muted/50">
                                              <CardContent className="p-3 sm:p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                  <Calculator className="h-4 w-4 text-muted-foreground" />
                                                  <span className="text-sm font-medium">
                                                    Profit Breakdown
                                                  </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                  <div className="space-y-1">
                                                    <p className="text-xs md:text-sm text-muted-foreground">
                                                      Your Profit/Item
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                      KSH 40
                                                    </p>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <p className="text-xs md:text-sm text-muted-foreground">
                                                      Total Profit
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                      KSH 200
                                                    </p>
                                                  </div>
                                                  <div className="col-span-2">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                                      <span>Creator: 70%</span>
                                                      <span>Winner: 25%</span>
                                                      <span>Platform: 5%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                                                      <div
                                                        className="h-full bg-gradient-to-r from-primary to-primary/70"
                                                        style={{ width: "70%" }}
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          </div>
                                        </CardContent>
                                        <CardFooter>
                                          <Button
                                            type="submit"
                                            className="w-full"
                                          >
                                            Create Product
                                          </Button>
                                        </CardFooter>
                                      </Card>
                                    </TabsContent>

                                    <TabsContent value="manage">
                                      products here
                                    </TabsContent>
                                  </Tabs>
                                </CardContent>
                              </Card>
                            </AccordionContent>
                          </AccordionItem>
                        </motion.div>
                      )}

                      <motion.div variants={cardVariants}>
                        <AccordionItem value="prize-distribution">
                          <AccordionTrigger className="text-lg md:text-xl">
                            Prize Distribution{" "}
                          </AccordionTrigger>
                          <AccordionContent>
                            <Card className="pt-4 space-y-4">
                              {/* Economics Overview */}
                              <div className="rounded-lg bg-muted/50 p-4">
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                  {_currentTournament.type === "paid" ? (
                                    <>
                                      <Coins className="h-5 w-5 text-primary" />
                                      Prize Pool Distribution
                                    </>
                                  ) : (
                                    <>
                                      <Gift className="h-5 w-5 text-primary" />
                                      Sponsorship Distribution
                                    </>
                                  )}
                                </h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  {_currentTournament.type === "paid" ? (
                                    <>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Prize Pool
                                        </p>
                                        <p className="font-medium">75%</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Creator
                                        </p>
                                        <p className="font-medium">15%</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Platform
                                        </p>
                                        <p className="font-medium">10%</p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Creator
                                        </p>
                                        <p className="font-medium">60%</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Winners
                                        </p>
                                        <p className="font-medium">30%</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Platform
                                        </p>
                                        <p className="font-medium">10%</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Prize Split Selection */}
                              <RadioGroup>
                                <div className="grid gap-4">
                                  {/* Winner Takes All */}
                                  <Label
                                    className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all border-primary bg-primary/5
                 `}
                                  >
                                    <RadioGroupItem
                                      value="winnerTakeAll"
                                      className="sr-only"
                                    />
                                    <div className="flex items-center gap-4">
                                      <div className="p-2 rounded-full bg-primary/10">
                                        <Trophy className="h-5 w-5 text-primary" />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-semibold">
                                          Winner Takes All
                                        </p>
                                        <Badge className="bg-primary/10 text-primary">
                                          {_currentTournament.type === "paid"
                                            ? "100% of prize pool"
                                            : "30% to winner"}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">
                                          Best for tournaments up to 16 players
                                        </p>
                                      </div>
                                    </div>
                                  </Label>

                                  {/* Three-Way Split */}
                                  <Label
                                    className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all border-primary bg-primary/5
                 `}
                                  >
                                    <RadioGroupItem
                                      value="threeWaySplit"
                                      className="sr-only"
                                    />
                                    <div className="flex items-center gap-4">
                                      <div className="p-2 rounded-full bg-primary/10">
                                        <Medal className="h-5 w-5 text-primary" />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-semibold">
                                          Top 3 Split
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {_currentTournament.type ===
                                          "paid" ? (
                                            <>
                                              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                1st: 60%
                                              </Badge>
                                              <Badge className="bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                                                2nd: 25%
                                              </Badge>
                                              <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                                3rd: 15%
                                              </Badge>
                                            </>
                                          ) : (
                                            <>
                                              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                1st: 18%
                                              </Badge>
                                              <Badge className="bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                                                2nd: 7.5%
                                              </Badge>
                                              <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                                3rd: 4.5%
                                              </Badge>
                                            </>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Recommended for larger tournaments
                                        </p>
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              </RadioGroup>

                              {/* Info Section */}
                            </Card>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>

                      <motion.div variants={cardVariants}>
                        <AccordionItem value="appearance">
                          <AccordionTrigger className="text-lg md:text-xl">
                            Appearance
                          </AccordionTrigger>
                          <AccordionContent>
                            <Card className="pt-4 space-y-4">
                              {" "}
                              <CardContent className="space-y-4 sm:space-y-6">
                                <Tabs defaultValue="table">
                                  <TabsList className="grid w-full grid-cols-3 gap-1 md:gap-2">
                                    <TabsTrigger
                                      value="banner"
                                      className="px-2 py-1 text-xs sm:text-sm"
                                    >
                                      <span className="hidden sm:inline">
                                        Tournament Banner
                                      </span>
                                      <span className="sm:hidden">Banner</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                      value="table"
                                      className="px-2 py-1 text-xs sm:text-sm"
                                    >
                                      <span className="hidden sm:inline">
                                        Table Background
                                      </span>
                                      <span className="sm:hidden">Table</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                      value="card"
                                      className="px-2 py-1 text-xs sm:text-sm"
                                    >
                                      <span className="hidden sm:inline">
                                        Card Skin Design
                                      </span>
                                      <span className="sm:hidden">
                                        Card Skin
                                      </span>
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="banner">
                                    <Card className="w-full max-w-2xl mx-auto">
                                      <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                                          Tournament Banner Image
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Info className="text-muted-foreground cursor-help h-4 w-4 sm:h-5 sm:w-5" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="text-xs sm:text-sm">
                                                  Add a banner image to showcase
                                                  your tournament (Recommended:
                                                  1200x300px)
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                                        <div
                                          className="w-full h-32 sm:h-48 rounded-lg overflow-hidden shadow-lg relative"
                                          style={{
                                            backgroundImage: `url(${preview})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                          }}
                                        ></div>

                                        <div className="max-w-md mx-auto">
                                          <Button
                                            variant="outline"
                                            className="w-full h-auto py-3"
                                          >
                                            <div className="flex items-center gap-2">
                                              <ImageIcon className="h-4 w-4" />

                                              <span>Add Tournament Banner</span>
                                            </div>
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>
                                </Tabs>
                              </CardContent>
                            </Card>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    </Accordion>

                    <motion.div variants={cardVariants}>
                      <Button>Save Settings</Button>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default UserProfile;
