import { notFound } from "next/navigation";
import database_connection from "@/services/database";
import cardsRoomModel from "@/models/cardsroom.model";
// import CardsTable from "@/page_components/Cards/CardsTable";
import CardsTable from "./client";

database_connection().then(() =>
  console.log("Connected successfully [cards game page]")
);

export const generateMetadata = async (props) => {
  const params = await props.params;
  const { slug } = params;
  const roomUrl = `https://wufwuf.io/kadi/${slug}`;

  return {
    title: `KingKadi(${slug}) - Play Now on Wufwuf`,
    description: `Join KingKadi room ${slug} for an exciting card game! Challenge friends in this unique room.`,
    keywords: [
      "KingKadi",
      "card game",
      "multiplayer",
      "Wufwuf",
      `room ${slug}`,
    ],
    openGraph: {
      title: `Join KingKadi Room ${slug} on Wufwuf`,
      description: `Play KingKadi in room ${slug}. Join now for an exciting multiplayer experience!`,
      url: roomUrl,
      image: "https://www.wufwuf.io/public/kadi0.png",
    },
    twitter: {
      title: `KingKadi Room ${slug} - Join Now on Wufwuf!`,
      description: `Play KingKadi in room ${slug}. Challenge friends in this unique game room!`,
    },
    alternates: {
      canonical: roomUrl,
    },
  };
};

const CardsRoom = async (props) => {
  const params = await props.params;
  const { slug } = params;

  // console.log("ROOM DATA ====>> ####");
  // console.log(data);

  return (
    // <div style={{ width: "100%", height: "100%" }}>
    // </div>
    <CardsTable roomSlug={slug} />
  );
};

export default CardsRoom;
