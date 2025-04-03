// import { NextResponse } from "next/server";
// import productModel from "@/models/product/index.model";
// import database_connection from "@/services/database";

// export const dynamic = "force-dynamic";

// database_connection().then(() =>
//   console.log("Connected successfully (Get Products)")
// );

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const tournamentId = searchParams.get("tournamentId");

//     if (!tournamentId) {
//       return NextResponse.json(
//         { message: "Tournament ID is required" },
//         { status: 400 }
//       );
//     }

//     // Enhanced query with population and filtering
//     const products = await productModel
//       .find({
//         $or: [{ "usedInTournaments.tournament": tournamentId }],
//       })
//       .populate([
//         {
//           path: "creator",
//           select: "name image",
//         },
//         {
//           path: "currentOwner",
//           select: "name image",
//         },
//         {
//           path: "ownershipHistory.owner",
//           select: "name image",
//         },
//         {
//           path: "redemptionDetails.redeemedBy",
//           select: "name image",
//         },
//       ])
//       .lean()
//       .exec();

//     // Process and organize product data
//     const organizedProducts = products.map((product) => ({
//       ...product,
//       status: getProductStatus(product),
//       availability: getProductAvailability(product, tournamentId),
//       metrics: {
//         totalTransfers: product.transferCount,
//         totalWins: product.tournamentWins,
//         usageCount: product.usedInTournaments.length,
//       },
//     }));

//     return NextResponse.json(
//       {
//         products: organizedProducts,
//         summary: getProductsSummary(organizedProducts),
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Product fetch error:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import productModel from "@/models/product/index.model";
import ProductOwnershipHistory from "@/models/product/ownership-history/index.model"; // Import the ownership history model
import database_connection from "@/services/database";

export const dynamic = "force-dynamic";

database_connection().then(() =>
  console.log("Connected successfully (Get Products)")
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    if (!tournamentId) {
      return NextResponse.json(
        { message: "Tournament ID is required" },
        { status: 400 }
      );
    }

    // Find ownership histories for the given tournament
    const ownershipHistories = await ProductOwnershipHistory.find({
      currentOwnerId: tournamentId,
      currentOwnerModel: "Tournament",
    }).lean();

    // Extract product IDs from ownership histories
    const productPriceMap = new Map();
    const productIds = ownershipHistories.map((history) => {
      productPriceMap.set(history.productId.toString(), history.price);
      return history.productId;
    });

    // Fetch products using the extracted product IDs
    const products = await productModel
      .find({ _id: { $in: productIds } })
      .populate([
        {
          path: "initialOwner",
          select: "name image",
        },
        {
          path: "currentOwner",
          populate: {
            path: "currentOwnerId",
            select: "name image",
          },
        },
      ])
      .lean()
      .exec();

    // Process and organize product data
    // const organizedProducts = products.map((product) => ({
    //   ...product,
    //   status: getProductStatus(product),
    //   availability: getProductAvailability(product, tournamentId),
    //   metrics: {
    //     totalTransfers: product.transferCount,
    //     totalWins: product.tournamentWins,
    //     usageCount: product.usedInTournaments.length,
    //   },
    // }));

    return NextResponse.json(
      {
        products: products,
        // summary: getProductsSummary(organizedProducts),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper functions
function getProductStatus(product) {
  if (product.isRedeemed) {
    return {
      state: "redeemed",
      details: product.redemptionDetails,
      canBeUsed: false,
    };
  }

  if (product.currentOwner) {
    return {
      state: "owned",
      owner: product.currentOwner,
      canBeUsed: true,
    };
  }

  return {
    state: "available",
    canBeUsed: true,
  };
}

function getProductAvailability(product, tournamentId) {
  const tournamentUsage = product.usedInTournaments.find(
    (usage) => usage.tournament.toString() === tournamentId
  );

  return {
    isUsedInTournament: !!tournamentUsage,
    usageType: tournamentUsage?.usedAs,
    usageDate: tournamentUsage?.usedAt,
    canBeUsed:
      !product.isRedeemed &&
      (!tournamentUsage || tournamentUsage.usedAs === "prize"),
  };
}

function getProductsSummary(products) {
  return {
    total: products.length,
    available: products.filter((p) => !p.isRedeemed).length,
    redeemed: products.filter((p) => p.isRedeemed).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.inventory, 0),
    byStatus: {
      available: products.filter((p) => !p.currentOwner && !p.isRedeemed)
        .length,
      owned: products.filter((p) => p.currentOwner && !p.isRedeemed).length,
      redeemed: products.filter((p) => p.isRedeemed).length,
    },
  };
}
