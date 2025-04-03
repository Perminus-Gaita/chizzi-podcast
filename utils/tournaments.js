import { Gift, Trophy, Medal, Crown } from "lucide-react";

const fourPlayerMatches = [
  {
    id: 1,
    name: "Semi Final 1",
    nextMatchId: 3,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 2,
    name: "Semi Final 2",
    nextMatchId: 3,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 3,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const eightPlayerMatches = [
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 25,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 29 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 29,
    name: "Semi Final 1",
    nextMatchId: 31,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 30,
    name: "Semi Final 2",
    nextMatchId: 31,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 31,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const sixteenPlayerMatches = [
  // Round of 16
  ...Array(8)
    .fill()
    .map((_, i) => ({
      id: i + 17,
      name: `Round ${i + 1} of 16`,
      nextMatchId: 25 + Math.floor(i / 2),
      tournamentRoundText: `1`,
    })),
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 25,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 29 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 29,
    name: "Semi Final 1",
    nextMatchId: 31,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 30,
    name: "Semi Final 2",
    nextMatchId: 31,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 31,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const thirtyTwoPlayerMatches = [
  // Round of 32
  ...Array(16)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      name: `Round ${i + 1} of 32`,
      nextMatchId: 17 + Math.floor(i / 2),
      tournamentRoundText: "1",
    })),
  // Round of 16
  ...Array(8)
    .fill()
    .map((_, i) => ({
      id: i + 17,
      name: `Round ${i + 1} of 16`,
      nextMatchId: 25 + Math.floor(i / 2),
      tournamentRoundText: "2",
    })),
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 25,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 29 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 29,
    name: "Semi Final 1",
    nextMatchId: 31,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 30,
    name: "Semi Final 2",
    nextMatchId: 31,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 31,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const sixtyFourPlayerMatches = [
  // Round of 64
  ...Array(32)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      name: `Round ${i + 1} of 64`,
      nextMatchId: 33 + Math.floor(i / 2),
      tournamentRoundText: "1",
    })),
  // Round of 32
  ...Array(16)
    .fill()
    .map((_, i) => ({
      id: i + 33,
      name: `Round ${i + 1} of 32`,
      nextMatchId: 49 + Math.floor(i / 2),
      tournamentRoundText: "2",
    })),
  // Round of 16
  ...Array(8)
    .fill()
    .map((_, i) => ({
      id: i + 49,
      name: `Round ${i + 1} of 16`,
      nextMatchId: 57 + Math.floor(i / 2),
      tournamentRoundText: "3",
    })),
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 57,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 61 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 61,
    name: "Semi Final 1",
    nextMatchId: 63,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 62,
    name: "Semi Final 2",
    nextMatchId: 63,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 63,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const oneHundredTwentyEightPlayerMatches = [
  // Round of 128
  ...Array(64)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      name: `Round ${i + 1} of 128`,
      nextMatchId: 65 + Math.floor(i / 2),
      tournamentRoundText: "1",
    })),
  // Round of 64
  ...Array(32)
    .fill()
    .map((_, i) => ({
      id: i + 65,
      name: `Round ${i + 1} of 64`,
      nextMatchId: 97 + Math.floor(i / 2),
      tournamentRoundText: "2",
    })),
  // Round of 32
  ...Array(16)
    .fill()
    .map((_, i) => ({
      id: i + 97,
      name: `Round ${i + 1} of 32`,
      nextMatchId: 113 + Math.floor(i / 2),
      tournamentRoundText: "3",
    })),
  // Round of 16
  ...Array(8)
    .fill()
    .map((_, i) => ({
      id: i + 113,
      name: `Round ${i + 1} of 16`,
      nextMatchId: 121 + Math.floor(i / 2),
      tournamentRoundText: "4",
    })),
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 121,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 125 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 125,
    name: "Semi Final 1",
    nextMatchId: 127,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 126,
    name: "Semi Final 2",
    nextMatchId: 127,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 127,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const twoHundredFiftySixPlayerMatches = [
  // Round of 256
  ...Array(128)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      name: `Round ${i + 1} of 256`,
      nextMatchId: 129 + Math.floor(i / 2),
      tournamentRoundText: "1",
    })),
  // Round of 128
  ...Array(64)
    .fill()
    .map((_, i) => ({
      id: i + 129,
      name: `Round ${i + 1} of 128`,
      nextMatchId: 193 + Math.floor(i / 2),
      tournamentRoundText: "2",
    })),
  // Round of 64
  ...Array(32)
    .fill()
    .map((_, i) => ({
      id: i + 193,
      name: `Round ${i + 1} of 64`,
      nextMatchId: 225 + Math.floor(i / 2),
      tournamentRoundText: "3",
    })),
  // Round of 32
  ...Array(16)
    .fill()
    .map((_, i) => ({
      id: i + 225,
      name: `Round ${i + 1} of 32`,
      nextMatchId: 241 + Math.floor(i / 2),
      tournamentRoundText: "4",
    })),
  // Round of 16
  ...Array(8)
    .fill()
    .map((_, i) => ({
      id: i + 241,
      name: `Round ${i + 1} of 16`,
      nextMatchId: 249 + Math.floor(i / 2),
      tournamentRoundText: "5",
    })),
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 249,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 253 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 253,
    name: "Semi Final 1",
    nextMatchId: 255,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 254,
    name: "Semi Final 2",
    nextMatchId: 255,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 255,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const fiveHundredTwelvePlayerMatches = [
  // Round of 512
  ...Array(256)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      name: `Round ${i + 1} of 512`,
      nextMatchId: 257 + Math.floor(i / 2),
      tournamentRoundText: "1",
    })),
  // Round of 256
  ...Array(128)
    .fill()
    .map((_, i) => ({
      id: i + 257,
      name: `Round ${i + 1} of 256`,
      nextMatchId: 385 + Math.floor(i / 2),
      tournamentRoundText: "2",
    })),
  // Round of 128
  ...Array(64)
    .fill()
    .map((_, i) => ({
      id: i + 385,
      name: `Round ${i + 1} of 128`,
      nextMatchId: 449 + Math.floor(i / 2),
      tournamentRoundText: "3",
    })),
  // Round of 64
  ...Array(32)
    .fill()
    .map((_, i) => ({
      id: i + 449,
      name: `Round ${i + 1} of 64`,
      nextMatchId: 481 + Math.floor(i / 2),
      tournamentRoundText: "4",
    })),
  // Round of 32
  ...Array(16)
    .fill()
    .map((_, i) => ({
      id: i + 481,
      name: `Round ${i + 1} of 32`,
      nextMatchId: 497 + Math.floor(i / 2),
      tournamentRoundText: "5",
    })),
  // Round of 16
  ...Array(8)
    .fill()
    .map((_, i) => ({
      id: i + 497,
      name: `Round ${i + 1} of 16`,
      nextMatchId: 505 + Math.floor(i / 2),
      tournamentRoundText: "6",
    })),
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 505,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 509 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 509,
    name: "Semi Final 1",
    nextMatchId: 511,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 510,
    name: "Semi Final 2",
    nextMatchId: 511,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 511,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

const oneThousandTwentyFourPlayerMatches = [
  // Round of 1024
  ...Array(512)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      name: `Round ${i + 1} of 1024`,
      nextMatchId: 513 + Math.floor(i / 2),
      tournamentRoundText: "1",
    })),
  // Round of 512
  ...Array(256)
    .fill()
    .map((_, i) => ({
      id: i + 513,
      name: `Round ${i + 1} of 512`,
      nextMatchId: 769 + Math.floor(i / 2),
      tournamentRoundText: "2",
    })),
  // Round of 256
  ...Array(128)
    .fill()
    .map((_, i) => ({
      id: i + 769,
      name: `Round ${i + 1} of 256`,
      nextMatchId: 897 + Math.floor(i / 2),
      tournamentRoundText: "3",
    })),
  // Round of 128
  ...Array(64)
    .fill()
    .map((_, i) => ({
      id: i + 897,
      name: `Round ${i + 1} of 128`,
      nextMatchId: 961 + Math.floor(i / 2),
      tournamentRoundText: "4",
    })),
  // Round of 64
  ...Array(32)
    .fill()
    .map((_, i) => ({
      id: i + 961,
      name: `Round ${i + 1} of 64`,
      nextMatchId: 993 + Math.floor(i / 2),
      tournamentRoundText: "5",
    })),
  // Round of 32
  ...Array(16)
    .fill()
    .map((_, i) => ({
      id: i + 993,
      name: `Round ${i + 1} of 32`,
      nextMatchId: 1009 + Math.floor(i / 2),
      tournamentRoundText: "6",
    })),
  // Round of 16
  ...Array(8)
    .fill()
    .map((_, i) => ({
      id: i + 1009,
      name: `Round ${i + 1} of 16`,
      nextMatchId: 1017 + Math.floor(i / 2),
      tournamentRoundText: "7",
    })),
  // Quarter Finals
  ...Array(4)
    .fill()
    .map((_, i) => ({
      id: i + 1017,
      name: `Quarter Final ${i + 1}`,
      nextMatchId: 1021 + Math.floor(i / 2),
      tournamentRoundText: "Quarter Final",
    })),
  // Semi Finals
  {
    id: 1021,
    name: "Semi Final 1",
    nextMatchId: 1023,
    tournamentRoundText: "Semi Final",
  },
  {
    id: 1022,
    name: "Semi Final 2",
    nextMatchId: 1023,
    tournamentRoundText: "Semi Final",
  },
  // Final
  {
    id: 1023,
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "Final",
  },
];

export const tournamentStructures = {
  4: fourPlayerMatches,
  8: eightPlayerMatches,
  16: sixteenPlayerMatches,
  32: thirtyTwoPlayerMatches,
  64: sixtyFourPlayerMatches,
  128: oneHundredTwentyEightPlayerMatches,
  256: twoHundredFiftySixPlayerMatches,
  512: fiveHundredTwelvePlayerMatches,
  1024: oneThousandTwentyFourPlayerMatches,
};

export const TIER_ICONS = {
  bronze: {
    icon: Medal,
    color: "text-amber-600",
    bgColor: "bg-amber-600",
  },
  silver: {
    icon: Gift,
    color: "text-slate-400",
    bgColor: "bg-slate-400",
  },
  gold: {
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
  },
  platinum: {
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
  },
};

export const getTierIcon = (tierId) => {
  const tierConfig = TIER_ICONS[tierId];
  if (!tierConfig) return TIER_ICONS.bronze;
  return tierConfig;
};
