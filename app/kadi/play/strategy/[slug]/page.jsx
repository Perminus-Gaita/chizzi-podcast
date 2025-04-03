import KadiStrategyTable from "./client";

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

  return (
    <>
      <KadiStrategyTable roomSlug={slug} />
    </>
  );
};

export default CardsRoom;
