export const maxDuration = 60;
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { TournamentModel, MatchModel } from "@/models/tournament.model";
import { tournamentStructures } from "@/utils/tournaments";
import mongoose from "mongoose";

import database_connection from "@/services/database";
database_connection().then(() =>
  console.log("Connected successfully (Tournament Create)")
);

// Enhanced tier generator with better scaling and product integration
export const generateTiers = (targetAmount) => {
  // Determine tournament scale for better tier distribution
  const getTournamentScale = (amount) => {
    if (amount <= 10000) return "micro"; // ≤ 10k
    if (amount <= 50000) return "small"; // ≤ 50k
    if (amount <= 200000) return "medium"; // ≤ 200k
    return "large"; // > 200k
  };

  // Scale-based percentage ranges for better tier differentiation
  const scalePercentages = {
    micro: {
      community: { min: 10, max: 20 }, // 500-1000 on 5k
      partner: { min: 20, max: 35 }, // 1000-1750 on 5k
      champion: { min: 35, max: 60 }, // 1750-3000 on 5k
      legend: { min: 60, max: 100 }, // 3000-5000 on 5k
    },
    small: {
      community: { min: 5, max: 15 },
      partner: { min: 15, max: 30 },
      champion: { min: 30, max: 50 },
      legend: { min: 50, max: 100 },
    },
    medium: {
      community: { min: 3, max: 10 },
      partner: { min: 10, max: 25 },
      champion: { min: 25, max: 45 },
      legend: { min: 45, max: 90 },
    },
    large: {
      community: { min: 2, max: 8 },
      partner: { min: 8, max: 20 },
      champion: { min: 20, max: 40 },
      legend: { min: 40, max: 80 },
    },
  };

  const scaledProductRanges = {
    micro: {
      community: { min: 0.1, max: 0.2 }, // 10-20% of target
      partner: { min: 0.2, max: 0.35 }, // 20-35% of target
      champion: { min: 0.35, max: 0.6 }, // 35-60% of target
      legend: { min: 0.6, max: 1.0 }, // 60-100% of target
    },
    small: {
      // Same percentage structure as micro
      community: { min: 0.1, max: 0.2 },
      partner: { min: 0.2, max: 0.35 },
      champion: { min: 0.35, max: 0.6 },
      legend: { min: 0.6, max: 1.0 },
    },
    medium: {
      community: { min: 0.1, max: 0.2 },
      partner: { min: 0.2, max: 0.35 },
      champion: { min: 0.35, max: 0.6 },
      legend: { min: 0.6, max: 1.0 },
    },
    large: {
      community: { min: 0.1, max: 0.2 },
      partner: { min: 0.2, max: 0.35 },
      champion: { min: 0.35, max: 0.6 },
      legend: { min: 0.6, max: 1.0 },
    },
  };

  // Replace your current productStrategy with this:
  const getProductStrategy = (scale, tierId, targetAmount) => {
    const ranges = scaledProductRanges[scale][tierId];

    return {
      community: {
        maxProducts: 2,
        priceRange: {
          min: Math.round(targetAmount * ranges.min),
          max: Math.round(targetAmount * ranges.max),
        },
        type: ["digital", "basic-merch"],
      },
      partner: {
        maxProducts: 3,
        priceRange: {
          min: Math.round(targetAmount * ranges.min),
          max: Math.round(targetAmount * ranges.max),
        },
        type: ["digital", "premium-merch", "exclusive-digital"],
      },
      champion: {
        maxProducts: 4,
        priceRange: {
          min: Math.round(targetAmount * ranges.min),
          max: Math.round(targetAmount * ranges.max),
        },
        type: ["premium-merch", "exclusive-digital", "limited-edition"],
      },
      legend: {
        maxProducts: 5,
        priceRange: {
          min: Math.round(targetAmount * ranges.min),
          max: Math.round(targetAmount * ranges.max),
        },
        type: ["limited-edition", "custom-merch", "exclusive-experience"],
      },
    }[tierId];
  };
  // Enhanced tier templates with clear value progression
  // const tierTemplates = [
  //   {
  //     id: "community",
  //     name: "Community Supporter",
  //     icon: "users",
  //     color: "text-blue-500",
  //     bgColor: "bg-blue-500",
  //     directSponsorshipPerks: {
  //       micro: [
  //         "Exclusive Tournament Chat Access",
  //         "Supporter Badge & Custom Chat Color",
  //         "Early Access to Tournament Updates",
  //       ],
  //       small: [
  //         "All Micro Benefits",
  //         "Featured in Community Spotlight",
  //         "Monthly Community Meet & Greet",
  //       ],
  //       medium: [
  //         "All Small Benefits",
  //         "Community Event Naming Rights",
  //         "Community Choice Awards Presenter",
  //       ],
  //       large: [
  //         "All Medium Benefits",
  //         "Community Ambassador Status",
  //         "Featured Content Creator",
  //       ],
  //     },
  //     productPerks: [
  //       "Digital Product Access",
  //       "Early Merch Access",
  //       "Supporter-Exclusive Items",
  //     ],
  //   },
  //   {
  //     id: "partner",
  //     name: "Tournament Partner",
  //     icon: "shield",
  //     color: "text-indigo-500",
  //     bgColor: "bg-indigo-500",
  //     directSponsorshipPerks: {
  //       micro: [
  //         "Stream Overlay Logo Placement",
  //         "Dedicated Social Media Shoutout",
  //         "Partner Badge & Enhanced Chat Features",
  //       ],
  //       small: [
  //         "All Micro Benefits",
  //         "Custom Animated Stream Graphics",
  //         "Partner Spotlight Segment",
  //       ],
  //       medium: [
  //         "All Small Benefits",
  //         "Custom Tournament Graphics",
  //         "Featured Partner Content",
  //       ],
  //       large: [
  //         "All Medium Benefits",
  //         "Tournament Segment Naming Rights",
  //         "Custom Integration Features",
  //       ],
  //     },
  //     productPerks: [
  //       "Premium Product Access",
  //       "Custom Product Variants",
  //       "Partnership Merchandise",
  //     ],
  //   },
  //   {
  //     id: "champion",
  //     name: "Champion Sponsor",
  //     icon: "trophy",
  //     color: "text-yellow-500",
  //     bgColor: "bg-yellow-500",
  //     directSponsorshipPerks: {
  //       micro: [
  //         "Premium Stream Integration",
  //         "Custom Tournament Segment",
  //         "VIP Access & Benefits",
  //       ],
  //       small: [
  //         "All Micro Benefits",
  //         "Tournament MVP Presentation",
  //         "Custom Event Integration",
  //       ],
  //       medium: [
  //         "All Small Benefits",
  //         "Champion's Corner Feature",
  //         "Custom Tournament Mechanics",
  //       ],
  //       large: [
  //         "All Medium Benefits",
  //         "Major Tournament Integration",
  //         "Custom Championship Series",
  //       ],
  //     },
  //     productPerks: [
  //       "Exclusive Product Lines",
  //       "Limited Edition Items",
  //       "Champion Collection Access",
  //     ],
  //   },
  //   {
  //     id: "legend",
  //     name: "Legend Sponsor",
  //     icon: "crown",
  //     color: "text-purple-500",
  //     bgColor: "bg-purple-500",
  //     directSponsorshipPerks: {
  //       micro: [
  //         "Tournament Naming Rights",
  //         "Primary Brand Integration",
  //         "Custom Tournament Format Input",
  //       ],
  //       small: [
  //         "All Micro Benefits",
  //         "Legend's Showcase Series",
  //         "Custom Tournament Rules",
  //       ],
  //       medium: [
  //         "All Small Benefits",
  //         "Tournament Strategy Input",
  //         "Custom Championship Belt Design",
  //       ],
  //       large: [
  //         "All Medium Benefits",
  //         "Tournament Series Naming Rights",
  //         "Complete Tournament Customization",
  //       ],
  //     },
  //     productPerks: [
  //       "Signature Product Line",
  //       "Custom Product Development",
  //       "Exclusive Rights & Benefits",
  //     ],
  //   },
  // ];

  const tierTemplates = [
    {
      id: "community",
      name: "Community Supporter",
      icon: "users",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      directSponsorshipPerks: {
        micro: [
          "Access to Tournament Telegram Group",
          "Community Supporter Badge",
          "Tournament Update Notifications",
        ],
        small: [
          "All Micro Benefits",
          "Logo on Tournament Page",
          "Mention in Tournament Announcements",
        ],
        medium: [
          "All Small Benefits",
          "Dedicated Sponsor Announcement",
          "Featured Supporter Status",
        ],
        large: [
          "All Medium Benefits",
          "Premium Supporter Badge",
          "Sponsor Spotlight Feature",
        ],
      },
      productPerks: [
        "Access to Tournament Merchandise",
        "Early Product Access",
        "Supporter-Exclusive Items",
      ],
    },
    {
      id: "partner",
      name: "Tournament Partner",
      icon: "shield",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500",
      directSponsorshipPerks: {
        micro: [
          "Small Logo on Game Room",
          "Partner Badge in Telegram",
          "Featured in Tournament Updates",
        ],
        small: [
          "All Micro Benefits",
          "Medium Logo on Game Table",
          "Dedicated Partner Announcement",
        ],
        medium: [
          "All Small Benefits",
          "Large Logo on Game Table",
          "Custom Table Background Design",
        ],
        large: [
          "All Medium Benefits",
          "Premium Table Position Branding",
          "Exclusive Table Design Rights",
        ],
      },
      productPerks: [
        "Partner Merchandise Rights",
        "Custom Product Options",
        "Exclusive Partner Products",
      ],
    },
    {
      id: "champion",
      name: "Champion Sponsor",
      icon: "trophy",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      directSponsorshipPerks: {
        micro: [
          "Custom Card Skin(back) Design",
          "Champion Badge in Telegram",
          "Premium Sponsor Recognition",
        ],
        small: [
          "All Micro Benefits",
          "Enhanced Card Design Options",
          "Tournament Round Naming Rights",
        ],
        medium: [
          "All Small Benefits",
          "Exclusive Card Skin Design",
          "Featured Championship Branding",
        ],
        large: [
          "All Medium Benefits",
          "Premium Game Asset Branding",
          "Custom Championship Series",
        ],
      },
      productPerks: [
        "Champion Product Line",
        "Limited Edition Items",
        "Premium Merchandise Rights",
      ],
    },
    {
      id: "legend",
      name: "Legend Sponsor",
      icon: "crown",
      color: "text-purple-500",
      bgColor: "bg-purple-500",
      directSponsorshipPerks: {
        micro: [
          "Tournament Naming Rights",
          "Full Table & Card Branding",
          "Legend Status in Community",
        ],
        small: [
          "All Micro Benefits",
          "Custom Tournament Format",
          "Premium Sponsor Integration",
        ],
        medium: [
          "All Small Benefits",
          "Complete Visual Customization",
          "Exclusive Tournament Rights",
        ],
        large: [
          "All Medium Benefits",
          "Full Tournament Branding",
          "Ultimate Sponsorship Authority",
        ],
      },
      productPerks: [
        "Exclusive Product Rights",
        "Custom Product Development",
        "Premium Brand Integration",
      ],
    },
  ];

  const scale = getTournamentScale(targetAmount / 100);
  const percentages = scalePercentages[scale];

  // Generate tiers with dynamic scaling and product integration
  const generatedTiers = tierTemplates.map((template) => {
    const scalePercentage = percentages[template.id];
    const tierPercentage = Math.min(
      scalePercentage.min +
        (scalePercentage.max - scalePercentage.min) *
          (targetAmount /
            (scale === "micro"
              ? 10000
              : scale === "small"
              ? 50000
              : scale === "medium"
              ? 200000
              : 500000)),
      scalePercentage.max
    );

    const tierAmount = Math.round((targetAmount * tierPercentage) / 100);

    return {
      id: template.id,
      name: template.name,
      icon: template.icon,
      color: template.color,
      bgColor: template.bgColor,
      percentage: tierPercentage,
      amount: tierAmount,
      maxSponsors: Math.max(1, Math.ceil(targetAmount / tierAmount)),
      directSponsorshipPerks: template.directSponsorshipPerks[scale],
      productPerks: template.productPerks,
      productStrategy: getProductStrategy(scale, template.id, targetAmount),
    };
  });

  return {
    tiers: generatedTiers.sort((a, b) => b.amount - a.amount),
    scale,
    targetAmount,
    totalSponsors: generatedTiers.reduce(
      (sum, tier) => sum + tier.maxSponsors,
      0
    ),
  };
};

export async function POST(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400 }
      );
    }

    const formData = await request.json();
    const {
      name,
      numberOfParticipants,
      type,
      slug,
      buyIn,
      sponsorshipDetails,
      telegramGroupId,
      // paymentInformation,
    } = formData;

    console.log({ formData });

    // Validate tournament name
    if (!name || name.trim().length < 3 || name.trim().length > 30) {
      return NextResponse.json({ message: "Invalid name" }, { status: 400 });
    }

    // Validate required fields
    if (!numberOfParticipants || !type || !slug || !telegramGroupId) {
      return NextResponse.json(
        { message: "Missing required tournament details" },
        { status: 400 }
      );
    }

    // Validate type-specific fields
    if (type === "paid" && (!buyIn?.entryFee || buyIn.entryFee <= 0)) {
      return NextResponse.json(
        { message: "Valid entry fee required for paid tournaments" },
        { status: 400 }
      );
    }

    if (
      type === "sponsored" &&
      (!sponsorshipDetails?.targetAmount ||
        sponsorshipDetails.targetAmount <= 10)
    ) {
      return NextResponse.json(
        { message: "Valid target amount required for sponsored tournaments" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingTournament = await TournamentModel.findOne({ slug });
    if (existingTournament) {
      return NextResponse.json(
        { message: "A tournament with this name already exists" },
        { status: 400 }
      );
    }

    const selectedMatches = tournamentStructures[numberOfParticipants] || [];
    if (selectedMatches.length === 0) {
      return NextResponse.json(
        { message: "Invalid number of participants" },
        { status: 400 }
      );
    }

    // if (
    //   !paymentInformation ||
    //   !paymentInformation.type ||
    //   !paymentInformation.details
    // ) {
    //   return NextResponse.json(
    //     { message: "Payment information is required" },
    //     { status: 400 }
    //   );
    // }

    // switch (paymentInformation.type) {
    //   case "phoneNumber":
    //     if (!/^\d{10}$/.test(paymentInformation.details)) {
    //       return NextResponse.json(
    //         { message: "Invalid phone number" },
    //         { status: 400 }
    //       );
    //     }
    //     break;
    //   case "mpesaPaybill":
    //   case "lipaNaMpesa":
    //     if (!/^\d+$/.test(paymentInformation.details)) {
    //       return NextResponse.json(
    //         { message: "Invalid Paybill/Till number" },
    //         { status: 400 }
    //       );
    //     }
    //     break;
    //   default:
    //     break;
    // }

    let generatedTierData;

    if (type === "sponsored") {
      generatedTierData = generateTiers(sponsorshipDetails.targetAmount * 100);
    }

    // Create tournament with telegramGroupId
    const newTournament = new TournamentModel({
      creator: new mongoose.Types.ObjectId(sessionUser?.currentWorkspaceId),
      name: name.trim(),
      slug,
      telegramGroupId, // Add telegramGroupId to the tournament document
      // paymentInformation,
      game: "kadi",
      format: "single elimination",
      numberOfParticipants,
      registrationType: "free",
      status: "draft",
      customTableBackgroundImage:
        "https://wufwuf-bucket.s3.ap-south-1.amazonaws.com/images/cardsBackground.webp",
      customCardSkinImage:
        "https://wufwuf-bucket.s3.ap-south-1.amazonaws.com/images/backred.png",
      autoStart: true,
      type,
      ...(type === "paid" && {
        buyIn: {
          entryFee: buyIn.entryFee,
          prizePool: 0,
        },
        prizeDistribution: {
          first: 100,
          second: 0,
          third: 0,
        },
      }),
      ...(type === "sponsored" && {
        sponsorshipDetails: {
          targetAmount: sponsorshipDetails.targetAmount * 100,
          currentAmount: 0,
          scale: generatedTierData.scale,
          tiers: generatedTierData.tiers,
          totalSponsors: generatedTierData.totalSponsors,
        },
        prizeDistribution: {
          first: 50,
          second: 30,
          third: 20,
        },
      }),
    });

    const savedTournament = await newTournament.save();

    // Create matches
    await Promise.all(
      selectedMatches.map((match) =>
        new MatchModel({
          tournamentId: savedTournament._id,
          id: match.id,
          name: match.name,
          nextMatchId: match.nextMatchId,
          tournamentRoundText: match.tournamentRoundText,
          startTime: null,
          state: "SCHEDULED",
          participants: [],
        }).save()
      )
    );

    return NextResponse.json(
      {
        message: "Tournament Created Successfully",
        tournamentId: savedTournament._id,
        slug: savedTournament.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
