import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getUserSession } from "@/services/auth/get-user-session";
import { getUserProfileData } from "@/services/user/get-user-profile-data";
import { getUserTournaments } from "@/services/user/get-user-tournaments";
import { getUserProfileMembers } from "@/services/user/get-user-profile-members";
import { getUserProducts } from "@/services/user/get-user-products";
import UserProfile from "./client";

export const generateMetadata = async (props) => {
  const params = await props.params;
  const { username } = params;
  return {
    title: `${username}'s Profile | Wufwuf`,
    description: `Explore ${username}'s profile on Wufwuf. View their tournaments, products, and more.`,
    keywords: `${username}, Wufwuf, user profile, tournaments, products, gaming profile`,
    openGraph: {
      title: `${username}'s Profile | Wufwuf`,
      description: `View ${username}'s profile on Wufwuf.`,
      url: `https://www.wufwuf.io/${username}`,
      siteName: "Wufwuf",
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s Profile | Wufwuf`,
      description: `Check out ${username}'s profile on Wufwuf.`,
    },
  };
};

const serializeData = (data) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

const Page = async (props) => {
  const params = await props.params;
  const { username } = params;

  try {
    const userSession = await getUserSession(cookies, false);

    // Fetch all data in parallel
    const [userProfileData, tournamentsData, productsData, userProfileMembers] =
      await Promise.all([
        getUserProfileData(username, userSession?._id),
        getUserTournaments(username),
        getUserProducts(username, userSession?._id),
        getUserProfileMembers(username, userSession?._id),
      ]);

    if (userProfileData.userNotFound) {
      notFound();
    }

    // const dummyProducts = [
    //   {
    //     _id: "1",
    //     name: "Limited Edition Gaming Chair",
    //     description:
    //       "Custom-designed gaming chair with RGB lighting and premium leather finish",
    //     price: 599.99,
    //     image: "https://api.dicebear.com/7.x/shapes/svg?seed=chair123",
    //     tournamentWins: 3,
    //     transferCount: 2,
    //     ownershipHistory: [
    //       {
    //         owner: {
    //           _id: "u1",
    //           name: "Sarah Chen",
    //           username: "sarahgaming",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    //         },
    //         acquiredAt: "2024-01-15T10:30:00Z",
    //         transactionType: "won",
    //       },
    //       {
    //         owner: {
    //           _id: "u2",
    //           name: "Alex Thompson",
    //           username: "alexthompson",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    //         },
    //         acquiredAt: "2023-12-01T15:45:00Z",
    //         transactionType: "sponsored",
    //       },
    //       {
    //         owner: {
    //           _id: "u3",
    //           name: "Gaming Emporium",
    //           username: "gamingemp",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=emporium",
    //         },
    //         acquiredAt: "2023-11-15T09:00:00Z",
    //         transactionType: "created",
    //       },
    //     ],
    //   },
    //   {
    //     _id: "2",
    //     name: "Golden Trophy NFT",
    //     description:
    //       "Exclusive digital trophy commemorating the 2024 Championship",
    //     price: 299.99,
    //     image: "https://api.dicebear.com/7.x/shapes/svg?seed=trophy456",
    //     tournamentWins: 1,
    //     transferCount: 4,
    //     ownershipHistory: [
    //       {
    //         owner: {
    //           _id: "u4",
    //           name: "Maria Rodriguez",
    //           username: "mariagamer",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    //         },
    //         acquiredAt: "2024-02-01T12:00:00Z",
    //         transactionType: "transferred",
    //       },
    //       {
    //         owner: {
    //           _id: "u5",
    //           name: "John Blake",
    //           username: "johnb",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    //         },
    //         acquiredAt: "2024-01-20T14:30:00Z",
    //         transactionType: "won",
    //       },
    //       {
    //         owner: {
    //           _id: "u6",
    //           name: "Digital Collectibles Inc",
    //           username: "dcollect",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=digital",
    //         },
    //         acquiredAt: "2023-12-25T08:15:00Z",
    //         transactionType: "created",
    //       },
    //     ],
    //   },
    //   {
    //     _id: "3",
    //     name: "Mythical Gaming Keyboard",
    //     description:
    //       "One-of-a-kind mechanical keyboard with custom keycaps and RGB",
    //     price: 899.99,
    //     image: "https://api.dicebear.com/7.x/shapes/svg?seed=keyboard789",
    //     tournamentWins: 0,
    //     transferCount: 1,
    //     ownershipHistory: [
    //       {
    //         owner: {
    //           _id: "u7",
    //           name: "Lisa Wong",
    //           username: "lisagaming",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
    //         },
    //         acquiredAt: "2024-01-30T16:45:00Z",
    //         transactionType: "sponsored",
    //       },
    //       {
    //         owner: {
    //           _id: "u8",
    //           name: "Custom Peripherals LLC",
    //           username: "customper",
    //           profilePicture:
    //             "https://api.dicebear.com/7.x/avataaars/svg?seed=custom",
    //         },
    //         acquiredAt: "2024-01-01T11:30:00Z",
    //         transactionType: "created",
    //       },
    //     ],
    //   },
    // ];

    // console.log(JSON.stringify(productsData, null, 2));

    return (
      <UserProfile
        username={username}
        tournaments={serializeData(tournamentsData)}
        products={productsData}
        userData={userProfileData}
        members={userProfileMembers}
      />
    );
  } catch (error) {
    console.error("Error loading profile:", error);
    throw error;
  }
};

export default Page;
