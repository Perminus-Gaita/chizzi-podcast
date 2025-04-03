export const canFinishGame = (playerDeck) => {
  if (playerDeck.length === 0) {
    return false; // Player has no cards, cannot finish the game
  }

  const answerCards = ["4", "5", "6", "7", "9", "10"];
  const questionCards = ["8", "Q"];

  // Filter the player's deck to include only answer and question cards
  const answerDeck = playerDeck.filter((card) =>
    answerCards.includes(card.slice(0, -1))
  );
  const questionDeck = playerDeck.filter((card) =>
    questionCards.includes(card.slice(0, -1))
  );

  if (answerDeck.length + questionDeck.length !== playerDeck.length) {
    return false; // If there are non-answer and non-question cards in the player's deck, they cannot finish the game
  }

  // Function to check if there are both '8' and 'Q' cards, and if they share at least one suit
  const hasMatchingSuits = () => {
    const eightCards = questionDeck.filter((card) => card.slice(0, -1) === "8");
    const queenCards = questionDeck.filter((card) => card.slice(0, -1) === "Q");

    if (eightCards.length > 0 && queenCards.length > 0) {
      const eightSuits = eightCards.map((card) => card.slice(-1));
      const queenSuits = queenCards.map((card) => card.slice(-1));

      return eightSuits.some((suit) => queenSuits.includes(suit));
    }

    return true; // If no '8' or 'Q' cards, or if they don't mismatch, return true
  };

  // Function to check if there's at least one answer card that matches the suit of any question card
  const hasValidAnswer = () => {
    if (questionDeck.length > 0) {
      const questionSuits = questionDeck.map((card) => card.slice(-1));
      return questionSuits.some((suit) =>
        answerDeck.some((card) => card.slice(-1) === suit)
      );
    }
    return true; // If no question cards, return true
  };

  // Check if there are question cards and validate them
  if (questionDeck.length > 0) {
    if (!hasMatchingSuits() || !hasValidAnswer()) {
      return false; // If conditions for question cards are not met, cannot finish the game
    }

    // Check if all answer cards have the same rank
    const ranks = answerDeck.map((card) => card.slice(0, -1));
    const allSameRank = ranks.every((rank) => rank === ranks[0]);

    return allSameRank;
  } else {
    // If there are no question cards, check if all answer cards have the same rank
    const ranks = answerDeck.map((card) => card.slice(0, -1));
    const allSameRank = ranks.every((rank) => rank === ranks[0]);
    return allSameRank;
  }
};

export const calculateDeckValue = (deck = []) => {
  let totalValue = 0;

  for (const card of deck) {
    // Check if the card is a joker
    if (card === "JOK1" || card === "JOK2") {
      totalValue += 365;
      continue; // Skip the rest of the iteration
    }

    const rank = card.slice(0, -1); // Extract the rank (remove the last character, which is the suit)

    switch (rank) {
      case "A":
        totalValue += 1;
        break;
      case "K":
        totalValue += 13;
        break;
      case "Q":
      case "8":
        totalValue += 12;
        break;
      case "J":
        totalValue += 11;
        break;
      default:
        // For cards other than face cards, use the numeric value
        totalValue += parseInt(rank);
    }
  }

  return totalValue;
};

export const jokerDrawPile = [
  "2H",
  "3H",
  "4H",
  "5H",
  "6H",
  "7H",
  "8H",
  "9H",
  "10H",
  "JH",
  "QH",
  "KH",
  "AH", // Hearts
  "2D",
  "3D",
  "4D",
  "5D",
  "6D",
  "7D",
  "8D",
  "9D",
  "10D",
  "JD",
  "QD",
  "KD",
  "AD", // Diamonds
  "2S",
  "3S",
  "4S",
  "5S",
  "6S",
  "7S",
  "8S",
  "9S",
  "10S",
  "JS",
  "QS",
  "KS",
  // "AS", // Spades
  "2C",
  "3C",
  "4C",
  "5C",
  "6C",
  "7C",
  "8C",
  "9C",
  "10C",
  "JC",
  "QC",
  "KC",
  "AC", // Clubs
  "JOK1",
  "JOK2", // Two Jokers
];

export const noJokerDrawPile = [
  "2H",
  "3H",
  "4H",
  "5H",
  "6H",
  "7H",
  "8H",
  "9H",
  "10H",
  "JH",
  "QH",
  "KH",
  "AH", // Hearts
  "2D",
  "3D",
  "4D",
  "5D",
  "6D",
  "7D",
  "8D",
  "9D",
  "10D",
  "JD",
  "QD",
  "KD",
  "AD", // Diamonds
  "2S",
  "3S",
  "4S",
  "5S",
  "6S",
  "7S",
  "8S",
  "9S",
  "10S",
  "JS",
  "QS",
  "KS",
  // "AS", // Spades
  "2C",
  "3C",
  "4C",
  "5C",
  "6C",
  "7C",
  "8C",
  "9C",
  "10C",
  "JC",
  "QC",
  "KC",
  "AC", // Clubs
];

export const isValidMove = (topCard, playedCard, currentRoomData) => {
  // Extract the rank and suit of the top card and the played card
  const topCardRank = topCard.slice(0, -1);
  const topCardSuit = topCard.slice(-1);
  const playedCardRank = playedCard.slice(0, -1);
  const playedCardSuit = playedCard.slice(-1);

  // additional moves
  if (currentRoomData?.lastGameplay?.player === currentRoomData?.turn) {
    // For additional moves, only rank needs to match
    return topCardRank === playedCardRank;
  }

  // If in kickback state, only "K" cards are valid moves
  if (currentRoomData?.isKickback) {
    return playedCardRank === "K";
  }

  // If jumpCounter is greater than 0, only "J" cards are valid moves
  if (currentRoomData?.jumpCounter > 0) {
    return playedCardRank === "J";
  }

  // if (currentRoomData?.isPenalty) {
  //   // allow A jok, 2, 3
  //   if (
  //     playedCardRank === "A" ||
  //     playedCard === "JOK1" ||
  //     playedCard === "JOK2" ||
  //     playedCardRank === "2" ||
  //     playedCardRank === "3"
  //   ) {
  //     return true;
  //   }

  //   // blockers must match rank or suit
  //   if (
  //     playedCardRank === topCardRank ||
  //     ((playedCardRank === "2" || playedCardRank === "3") &&
  //       playedCardSuit === topCardSuit)
  //   ) {
  //     return true;
  //   }

  //   return false;
  // }

  if (currentRoomData?.isPenalty) {
    if (!topCard) return false; //Guard clause

    if (topCard[0] === "2" || topCard[0] === "3") {
      //Penalty is 2 or 3
      if (
        playedCardRank === "A" ||
        playedCard === "JOK1" ||
        playedCard === "JOK2" ||
        playedCardRank === topCard[0] || // Match Rank
        playedCard[playedCard.length - 1] === topCard[playedCard.length - 1] //Match Suit
      ) {
        return true;
      }
    } else if (topCard === "JOK1" || topCard === "JOK2") {
      //Penalty is Joker
      if (
        playedCardRank === "A" ||
        playedCardRank === "2" ||
        playedCardRank === "3" ||
        playedCard === "JOK1" ||
        playedCard === "JOK2"
      ) {
        return true;
      }
    }
    return false; //If none of the above is true, then return false
  }

  // If the top card is "JOK1/2", any card is a valid move
  if (topCard === "JOK1" || topCard === "JOK2") {
    return true;
  }

  // Allow Aces and Jokers to be played at any time
  if (
    playedCardRank === "A" ||
    playedCard === "JOK1" ||
    playedCard === "JOK2"
  ) {
    return true;
  }

  // Allow desired rank after aces play
  if (currentRoomData?.desiredSuit) {
    // console.log("## HERE NOW ###");
    // console.log(topCardRank);
    // console.log(playedCardRank);
    // console.log(currentRoomData?.desiredSuit);
    if (
      topCardRank === "A" &&
      playedCardSuit === currentRoomData?.desiredSuit
    ) {
      return true;
    }
  }

  // Check if the played card matches the suit or rank of the top card
  if (topCardSuit === playedCardSuit || topCardRank === playedCardRank) {
    return true;
  }

  return false;
};
