// const isValidMove = (topCard, playedCard) => {
//   // Extract the rank and suit of the top card and the played card
//   const topCardRank = topCard.slice(0, -1);
//   const topCardSuit = topCard.slice(-1);
//   const playedCardRank = playedCard.slice(0, -1);
//   const playedCardSuit = playedCard.slice(-1);

//   console.log("### THE RANKED ###");
//   console.log(playedCardRank);

//   // If the top card is "JOK", any card is a valid move
//   if (topCard === "JOK") {
//     return true;
//   }

//   // Allow Aces and Jokers to be played at any time
//   if (playedCardRank === "A" || playedCard === "JOK") {
//     return true;
//   }

//   // Check if the played card matches the suit or rank of the top card
//   if (topCardSuit === playedCardSuit || topCardRank === playedCardRank) {
//     return true;
//   }

//   return false;
// };

export const isValidMove = (currentSuit, topCard, playedCard) => {
  // Extract the rank and suit of the top card and the played card
  const topCardRank = topCard.slice(0, -1);
  const topCardSuit = topCard.slice(-1);
  const playedCardRank = playedCard.slice(0, -1);
  const playedCardSuit = playedCard.slice(-1);

  // console.log("### THE RANKED ###");
  // console.log(playedCardRank);

  // If the top card is "JOK", any card is a valid move
  if (currentSuit === "FREE") {
    return true;
  }

  if (currentSuit === playedCardSuit) {
    return true;
  }

  // Allow Aces and Jokers to be played at any time
  if (playedCardRank === "A" || playedCard === "JOK") {
    return true;
  }

  // Check if the played card matches the suit or rank of the top card
  if (topCardSuit === playedCardSuit || topCardRank === playedCardRank) {
    return true;
  }

  return false;
};

export const hasValidMoveAfterJumpPlay = (playerDeck) => {
  // Iterate over each card in the player's deck
  for (const card of playerDeck) {
    // Check if the current card is an jump
    const cardRank = card.slice(0, -1);
    if (cardRank === "J") {
      return true; // If an Jump card is found, return true
    }
  }

  return false; // If no Jump card found, return false
};

export const hasValidMove = (currentSuit, playerDeck, topCard) => {
  // Iterate over each card in the player's deck
  for (const card of playerDeck) {
    // Check if the current card is a valid move
    if (isValidMove(currentSuit, topCard, card)) {
      return true; // If a valid move is found, return true
    }
  }
  return false; // If no valid move is found, return false
};

export const hasValidMoveAfterAcesPlay = (playerDeck) => {
  // Iterate over each card in the player's deck
  for (const card of playerDeck) {
    // Check if the current card is an Ace
    const cardRank = card.slice(0, -1);
    if (cardRank === "A") {
      return true; // If an Ace is found, return true
    }
  }

  return false; // If no Ace is found, return false
};

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

export const isValidMoveAfterAces = (topCard, playedCard, desiredSuit) => {
  // Extract the rank and suit of the top card and the played card
  const topCardRank = topCard.slice(0, -1);
  const topCardSuit = topCard.slice(-1);
  const playedCardRank = playedCard.slice(0, -1);
  const playedCardSuit = playedCard.slice(-1);

  console.log(desiredSuit);
  console.log(playedCardSuit);

  // Check if the top card is an Ace
  if (topCardRank === "A") {
    // Match the suit of the played card with the desiredSuit
    if (playedCardSuit === desiredSuit) {
      return true;
    }
  } else {
    // Check if the played card matches the suit or rank of the top card
    if (topCardSuit === playedCardSuit || topCardRank === playedCardRank) {
      return true;
    }
  }

  return false;
};

export const hasValidMoveAfterQuestionPlay = (playerDeck, topCard) => {
  // Extract the rank and suit of the top card
  const topCardRank = topCard.slice(0, -1);
  const topCardSuit = topCard.slice(-1);

  // Define the ranks considered as the same for question cards
  const questionRanks = ["Q", "8"];

  // Iterate over each card in the player's deck
  for (const card of playerDeck) {
    // Extract the rank and suit of the current card
    const cardRank = card.slice(0, -1);
    const cardSuit = card.slice(-1);

    // Check if the current card's rank matches the top card's rank
    if (cardRank === topCardRank) {
      return true; // If a matching rank is found, return true
    }

    // Check if the current card matches the top card's suit and is a question card
    if (questionRanks.includes(cardRank) && cardSuit === topCardSuit) {
      return true; // If a matching suit is found with the same rank set, return true
    }
  }

  return false; // If no matching rank is found, return false
};

export const hasValidMoveAfterPlay = (playerDeck, topCard) => {
  // Extract the rank of the top card
  const topCardRank = topCard.slice(0, -1);

  // Iterate over each card in the player's deck
  for (const card of playerDeck) {
    // Extract the rank of the current card
    const cardRank = card.slice(0, -1);

    // Check if the current card's rank matches the top card's rank
    if (cardRank === topCardRank) {
      return true; // If a matching rank is found, return true
    }
  }

  return false; // If no matching rank is found, return false
};

export const isValidAdditionalMove = (topCard, playedCard) => {
  // Extract the rank and suit of the top card and the played card
  const topCardRank = topCard.slice(0, -1);
  const playedCardRank = playedCard.slice(0, -1);

  // Allow same rank or if last play was K/J (Kickback/Jump)
  return topCardRank === playedCardRank || ["K", "J"].includes(topCardRank);
};

export const shuffle = (deck) => {
  console.log("shuffling...");

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
  }

  return deck;
};
