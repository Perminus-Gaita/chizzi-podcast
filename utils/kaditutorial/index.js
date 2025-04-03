// Validation utilities
export const validateMove = (card, gameState) => {
  const { currentSuit, currentRank, turn } = gameState;
  if (turn !== gameState.playerId) return false;

  console.log("### RECEIVED CARD ###");
  console.log(card);

  // Get card properties
  const cardSuit = card.slice(-1);
  const cardRank = card.slice(0, -1);

  // Basic validation
  return cardSuit === currentSuit || cardRank === currentRank;
};

export const canPlayerDraw = (gameState, playerId) => {
  const { turn, playerHand, currentSuit, currentRank } = gameState;
  if (turn !== playerId) return false;

  console.log("### HERE ###");
  console.log(playerHand.some((card) => validateMove(card, gameState)));

  // Check if player has any valid moves
  return !playerHand.some((card) => validateMove(card, gameState));
};
