import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import UserProfile from "./client";
import { ImageResponse } from "next/og";

export const generateMetadata = async (props) => {
  const params = await props.params;
  const { username } = params;
  const user = userDatabase[username];

  if (!user) {
    return {
      title: "User Not Found | Wufwuf",
      description: "User profile not found.",
    };
  }

  return {
    title: `${user.displayName}'s Profile | Wufwuf`,
    description: `Explore ${user.displayName}'s profile on Wufwuf. View their profile.`,
    keywords: `${user.username}, Wufwuf, user profile`,
    openGraph: {
      title: `${user.displayName}'s Profile | Wufwuf`,
      description: `View ${user.displayName}'s profile on Wufwuf.`,
      url: `https://www.wufwuf.io/${user.username}`,
      siteName: "Wufwuf",
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.displayName}'s Profile | Wufwuf`,
      description: `Check out ${user.displayName}'s profile on Wufwuf.`,
    },
  };
};

export const userDatabase = {
  adultsintheroom: {
    username: "adultsintheroom.podcast",
    name: "THE ADULTS IN THE ROOM",
    displayName: "THE ADULTS IN THE ROOM",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/adultsintheroomprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/adultsintheroombanner.jpg",
    socials: [],
    initials: "AIR",
  },
  Bigtoxicogre: {
    username: "Bigtoxicogre",
    name: "BIG BAD OGRE",
    displayName: "BIG BAD OGRE",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/bigbadogreprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/bigbadogrebanner.jpg",
    socials: [],
    initials: "IK",
  },
  KULTURE_SHiFT: {
    username: "KULTURE_SHiFT",
    name: "/K/ULTURE SHiFT",
    displayName: "/K/ULTURE SHiFT",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/cultureshiftprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/cultureshiftbanner.jpg",
    socials: [],
    initials: "IK",
  },
  YKTVOnline: {
    username: "YKTVOnline",
    name: "YKTV Online",
    displayName: "YKTV Online",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/yktvprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/yktvonlinebanner.jpg",
    socials: [],
    initials: "IK",
  },
  GumzonaChaiPodcast: {
    username: "GumzonaChaiPodcast",
    name: "Gumzo na Chai Podcast",
    displayName: "Gumzo na Chai Podcast",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/gumzonachaiprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/gumzonachaibanner.jpg",
    socials: [],
    initials: "IK",
  },
  hoodtv: {
    username: "hoodtv",
    name: "HOOD TV",
    displayName: "HOOD TV",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/hoodtvprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/hoodtvbanner.jpg",
    socials: [],
    initials: "IK",
  },
  KikaopodcastAE: {
    username: "KikaopodcastAE",
    name: "KIKAO PODCAST",
    displayName: "KIKAO PODCAST",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/kikaoprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/kikaobanner.jpg",
    socials: [],
    initials: "IK",
  },
  MAKACHERO: {
    username: "MAKACHERO",
    name: "Makachero",
    displayName: "Makachero",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/makacheroprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/makacherobanner.jpg",
    socials: [],
    initials: "IK",
  },
  UsoroPodcast: {
    username: "UsoroPodcast",
    name: "Usoro Podcast",
    displayName: "Usoro Podcast",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/usoroprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/usorobanner.jpg",
    socials: [],
    initials: "IK",
  },
  the30percentpod: {
    username: "the30percentpod",
    name: "The 30 Percent Pod",
    displayName: "The 30 Percent Pod",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/the30percentpodprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/the30percentpodbanner.jpg",
    socials: [],
    initials: "IK",
  },
  TwoNilotesInAPod: {
    username: "TwoNilotesInAPod",
    name: "Two Nilotes In A Pod",
    displayName: "Two Nilotes In A Pod",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/twonilotesinapodprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/twonilotesinapodbanner.jpg",
    socials: [],
    initials: "IK",
  },
  abelmutua: {
    username: "abelmutua",
    name: "Abel Mutua",
    displayName: "Abel Mutua",
    avatar:
      "https://www.sinemafocus.com/wp-content/uploads/2024/12/Makosa-ni-Yangu-poster-750x375.png",
    headerImage:
      "https://www.businessdailyafrica.com/resource/image/4851600/portrait_ratio1x1/1600/1600/2529a60be27a246c128cabeb6eb5ebba/zH/makosa.jpg",
    socials: [],
    initials: "AM",
  },
  Husbands2beepodcast: {
    username: "Husbands2beepodcast",
    name: "Husbands 2bee Podcast",
    displayName: "Husbands 2bee Podcast ",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/husbands2beeprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/husbands2beebanner.jpg",
    socials: [],
    initials: "AM",
  },
  gwethetv254: {
    username: "gwethetv254",
    name: "GWETHE TV",
    displayName: "GWETHE TV",
    avatar:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/gwetheprofile.jpg",
    headerImage:
      "https://wufwuf-bucket-development.s3.ap-south-1.amazonaws.com/welcomemedia/gwethebanner.jpg",
    socials: [],
    initials: "AM",
  },
  miccheque: {
    username: "miccheque",
    name: "Mic Cheque Podcast",
    displayName: "Mic Cheque Podcast",
    avatar:
      "https://i.scdn.co/image/ab6765630000ba8ada8d50e68fdf4bb231a40828",
    headerImage:
      "https://i.scdn.co/image/ab6765630000ba8ada8d50e68fdf4bb231a40828",
    socials: [],
    initials: "MCP",
  },
  kifeee: {
    username: "kifeee",
    name: "Andrew Kibe",
    displayName: "Andrew Kibe",
    avatar:
      "https://pbs.twimg.com/profile_images/1818775916345962496/N09FOMQt_400x400.jpg",
    headerImage:
      "https://pbs.twimg.com/profile_banners/877150626911846402/1698342429/1500x500",
    socials: [],
    initials: "AK",
  },
  ikonini: {
    username: "ikonini",
    name: "Iko nini?",
    displayName: "Iko nini?",
    avatar:
      "https://i.scdn.co/image/ab67656300005f1fdbb469920602ad32938a626c",
    headerImage:
      "https://i.scdn.co/image/ab67656300005f1fdbb469920602ad32938a626c",
    socials: [],
    initials: "IKO",
  },
};

const Page = async (props) => {
  const params = await props.params;
  const { username } = params;
  const user = userDatabase[username];

  if (!user) {
    notFound();
  }

  try {
    return <UserProfile user={user} />;
  } catch (error) {
    console.error("Error loading profile:", error);
    throw error;
  }
};

export default Page;
