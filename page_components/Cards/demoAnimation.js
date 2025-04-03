import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "../../styles/cards.css";

const CardGameAnimation = ({
  containerRef,
  gameRef,
  turn,
  counter,
  setCounter,
  isSmallScreen,
  handleCardClick,
  handleOpenSuitModal,
  opponentDeck,
  scenarios,
  currentScenario,
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [backColor] = useState(
    ["red", "green", "blue"][Math.floor(Math.random() * 3)]
  );

  const userProfile = useSelector((state) => state.auth.profile);

  const backCard = new Image();
  backCard.src = `/cards/back${backColor}.png`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        // Set canvas dimensions to match container
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Get context and fill with red
        const ctx = canvas.getContext("2d");
        // ctx.fillStyle = "red";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Player {
      constructor(
        uuid,
        username,
        profilePicture,
        numCards,
        on,
        playerIndex,
        canvasWidth,
        canvasHeight
      ) {
        this.x = null;
        this.y = null;
        this.uuid = uuid;
        this.username = username;
        this.profilePicture = profilePicture;
        this.playerDeck = [];
        this.numCards = numCards;
        this.on = on;
        this.playerIndex = playerIndex;
        this.elapsedTime = 30; // Initial time in seconds
        this.maxTime = 30; // Maximum time in seconds

        // ripple for async games
        this.rippleRadius = 0; // Initial radius of the ripple
        this.rippleMaxRadius = 40; // Maximum radius of the ripple
        this.rippleLineWidth = 3; // Width of the ripple lines
        this.rippleNumRipples = 10; // Number of ripples
        this.rippleFadeOutRate = 0.02; // Rate at which the ripple fades out per frame
        this.lastFrameTime = 0; // Last frame time for smoother animationframe time for smoother animation

        // Calculate responsive radius based on canvas dimensions
        const minDimension = Math.min(canvasWidth, canvasHeight);
        this.outerCircleRadius = Math.max(
          Math.min(minDimension * 0.04, 30), // Max radius of 30px
          15 // Min radius of 15px
        );

        // Timer properties
        this.timerStartTime = null;
        this.timerDuration = 30000; // 30 seconds in milliseconds
        this.isTimerActive = false;
        // this.outerCircleRadius = 20; // Radius of the outer circles
      }

      draw(ctx, x, y) {
        // draw ripple
        if (this.uuid === turn) {
          const currentTime = Date.now();
          const deltaTime = currentTime - this.lastFrameTime;
          this.lastFrameTime = currentTime;

          if (this.rippleRadius >= this.rippleMaxRadius) {
            this.rippleRadius = 0; // Reset ripple radius
          }

          ctx.save();

          for (let i = 0; i < this.rippleNumRipples; i++) {
            const radius =
              this.rippleRadius +
              (this.rippleMaxRadius / this.rippleNumRipples) * i;
            const opacity = 1 - radius / this.rippleMaxRadius;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 184, 255, ${opacity})`;
            ctx.lineWidth = this.rippleLineWidth;
            ctx.stroke();
          }

          ctx.restore();

          const rippleSpeed = 0.01; // adjust speed
          this.rippleRadius += rippleSpeed * deltaTime; // increment radius
        }

        const img = new Image();
        img.src = this.profilePicture;

        const radius = this.outerCircleRadius;

        ctx.save();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);

        ctx.restore();
      }

      drawUsername(ctx) {
        const fontSize = Math.max(
          Math.min(this.outerCircleRadius * 0.8, 14), // Reduced max font size for mobile
          12
        );

        ctx.save();
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;

        // Truncate long usernames
        let displayName = this.username;
        if (displayName.length > 10) {
          // Reduced max length for mobile
          displayName = displayName.slice(0, 8) + "..";
        }

        // Get text metrics for background
        const metrics = ctx.measureText(displayName);
        const textWidth = metrics.width;
        const padding = 6;
        const backgroundHeight = fontSize + padding;
        const backgroundWidth = textWidth + padding * 2;

        // Position username consistently below avatar for all players
        const usernameOffset = this.outerCircleRadius - 5;
        const backgroundX = this.x + backgroundWidth / 2;
        const backgroundY = this.y - usernameOffset;

        // Draw semi-transparent background
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.roundRect(
          backgroundX,
          backgroundY,
          backgroundWidth,
          backgroundHeight,
          4
        );
        ctx.fill();

        // Draw text
        ctx.fillStyle = this.uuid === turn ? "#78d64b" : "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          displayName,
          this.x + backgroundWidth,
          backgroundY + backgroundHeight / 2
        );

        ctx.restore();
      }

      roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
      }
    }

    class Card {
      constructor(
        cardImg,
        x,
        y,
        canvasWidth,
        canvasHeight,
        angle = 0,
        isVisible = true
      ) {
        this.cardImg = cardImg;
        this.x = x;
        this.y = y;
        // this.width = width;
        // this.height = height;
        this.isMoving = false;
        // this.dx = 10;
        this.angle = angle;
        this.isVisible = isVisible;

        // Calculate responsive dimensions
        this.calculateDimensions(canvasWidth, canvasHeight);

        // Dynamic movement speed based on canvas size
        this.dx = Math.min(canvasWidth, canvasHeight) * 0.01; // 1% of smallest dimension

        this.arrivedAtDestination = false;
        this.initialDistance = 0;
      }

      calculateDimensions(canvasWidth, canvasHeight) {
        const minDimension = Math.min(canvasWidth, canvasHeight);

        // Make cards slightly smaller for better stacking
        const baseWidth = minDimension * 0.08; // Reduced from 0.12
        const aspectRatio = 1.4;

        this.width = Math.min(Math.max(baseWidth, 40), 60); // Smaller max size
        this.height = this.width * aspectRatio;
        this.cornerRadius = this.width * 0.1;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw outer border
        ctx.beginPath();
        this.createRoundedRect(
          ctx,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height,
          this.cornerRadius
        );
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Draw inner area for custom skin
        const innerWidth = this.width * 0.95;
        const innerHeight = this.height * 0.95;
        const innerX = -innerWidth / 2;
        const innerY = -innerHeight / 2;

        ctx.beginPath();
        this.createRoundedRect(
          ctx,
          innerX,
          innerY,
          innerWidth,
          innerHeight,
          this.cornerRadius * 0.8
        );
        ctx.clip();

        // Draw card image
        ctx.drawImage(this.cardImg, innerX, innerY, innerWidth, innerHeight);

        ctx.restore();
      }

      update(centerX, centerY) {
        if (this.isMoving) {
          // Dynamic easing based on distance
          const distance = Math.hypot(centerX - this.x, centerY - this.y);
          const easing = Math.min(0.1, distance * 0.0005);

          this.x += (centerX - this.x) * easing;
          this.y += (centerY - this.y) * easing;

          // Stop moving when very close to destination
          if (distance < 1) {
            this.x = centerX;
            this.y = centerY;
            this.isMoving = false;
          }
        }
      }

      revUpdate(targetX, targetY) {
        if (this.isMoving) {
          const dx = targetX - this.x;
          const dy = targetY - this.y;

          const distance = Math.hypot(dx, dy);
          const easing = Math.min(0.1, distance * 0.0005);

          this.x += dx * easing;
          this.y += dy * easing;

          // Stop when close enough to target position
          if (Math.abs(dx) < this.width / 2 && Math.abs(dy) < this.height / 2) {
            this.x = targetX;
            this.y = targetY;
            this.isMoving = false;
          }
        }
      }

      createRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
      }
    }

    class Game {
      constructor(
        width,
        height,
        turn,
        players,
        drawPileCount,
        isPenalty,
        handleOpenSuitModal,
        handleCardClick
      ) {
        this.width = width;
        this.height = height;
        this.turn = turn;
        this.players = players;
        this.centerCircleRadius = 20; // Radius of the center circle
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;

        this.lastPlayedCard = null;

        this.outerCircleRadiusWithOffset = canvas.width / 3;

        this.cardWidth = isSmallScreen ? Math.min(width * 0.15, 5) : 60;
        this.cardHeight = isSmallScreen ? Math.min(height * 0.12, 30) : 90;

        this.cards = [];
        this.drawPileCount = drawPileCount; // Number of cards in the pile
        this.drawPile = []; // Array to hold the pile of cards
        this.discardPileCards = [];

        this.isPenalty = isPenalty;
        this.handleOpenSuitModal = handleOpenSuitModal;
        this.handleCardClick = handleCardClick;

        // card placing sounds
        this.cardPlace1 = new Audio("/cards/audio/cardPlace1.wav");
        this.cardPlace2 = new Audio("/cards/audio/cardPlace2.wav");
        this.cardPlace3 = new Audio("/cards/audio/cardPlace3.wav");
        this.cardPlace4 = new Audio("/cards/audio/cardPlace4.wav");

        this.cardPlaceSounds = [
          this.cardPlace1,
          this.cardPlace2,
          this.cardPlace3,
          this.cardPlace4,
        ];

        this.cardPlaceSound =
          this.cardPlaceSounds[
            Math.floor(Math.random() * this.cardPlaceSounds.length)
          ];

        // cards picking sounds
        this.cardPickSound = new Audio("/cards/audio/cardTakeOutPackage1.wav");

        // penalty animations
        this.penaltyDrawInProgress = false;
        this.penaltyCardsRemaining = 0;
        this.penaltyDrawDelay = 300; // Time between each penalty card draw

        // Track last penalty animation time
        this.lastPenaltyDrawTime = 0;

        this.isAnimating = false;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;

        this.activeAnimations = [];

        // Bind the animate method
        this.animate = this.animate.bind(this);

        // Create buffer canvas
        this.bufferCanvas = document.createElement("canvas");
        this.bufferCanvas.width = width;
        this.bufferCanvas.height = height;
        this.bufferCtx = this.bufferCanvas.getContext("2d");
      }

      setPlayerPositions() {
        const currentPlayer = this.players.find(
          (player) => player.uuid === userProfile?.uuid
        );

        // Set current player position at bottom
        currentPlayer.x = this.centerX;
        currentPlayer.y = this.height - 20; // Increased padding from bottom

        // Get other players
        const otherPlayers = this.players.filter(
          (player) => player.uuid !== userProfile?.uuid
        );

        // Mobile-optimized positions for different player counts
        switch (otherPlayers.length) {
          case 1: // 2 players total
            // Top player
            otherPlayers[0].x = this.centerX;
            otherPlayers[0].y = 30;
            break;
        }
      }

      initialize() {
        this.setPlayerPositions();

        this.populatePlayerDecksTwoPlayers();
      }

      hasActiveAnimations() {
        return this.players.some(
          (player) =>
            player.playerDeck.some((card) => card.isMoving) ||
            this.drawPile.some((card) => card.isMoving)
        );
      }

      startAnimation() {
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.animate(0);
        }
      }

      stopAnimation() {
        this.isAnimating = false;
      }

      getCardPosition(player, cardIndex) {
        // Calculate position for each card in player's hand
        const spacing = this.cardWidth * 0.3;
        const startX = player.x - spacing * 1.5;

        return {
          x: startX + cardIndex * spacing,
          y: player.y + this.cardHeight * 0.3,
          angle: 0,
        };
      }

      animateCardDeal(targetPlayer, round, playerIndex) {
        // Create new card from center
        const card = new Card(
          backCard,
          this.centerX,
          this.centerY,
          this.width,
          this.height
        );

        // Calculate final position based on player position
        const player = this.players.find((p) => p.uuid === targetPlayer);
        const finalPos = this.getCardPosition(player, round);

        // Animate card movement
        card.isMoving = true;
        this.activeAnimations.push({
          card,
          targetX: finalPos.x,
          targetY: finalPos.y,
          targetAngle: finalPos.angle,
        });
      }

      populatePlayerDecksTwoPlayers() {
        this.players.forEach((player) => {
          const isSmallScreen = this.width < 768;
          const maxWidth = isSmallScreen ? this.width * 0.9 : this.width * 0.8;

          // Increased overlap for more compact layout on mobile
          const baseOverlap = isSmallScreen ? 0.92 : 0.85;

          // Calculate stack dimensions
          const maxVisibleCards = 7; // Maximum number of visible card edges in stack
          const stackSpacing = 20; // Pixels between each visible card edge

          let startX,
            startY,
            angle = 0;

          if (player.uuid === userProfile?.uuid) {
            // Current player's hand - fan out cards at bottom
            const playerHandWidth = Math.min(
              this.width * 0.8,
              player.numCards * this.cardWidth * (1 - baseOverlap) +
                this.cardWidth
            );
            startX = this.centerX - playerHandWidth / 2; // Changed from player.x to this.centerX
            startY = player.y + this.cardHeight * 0.3;
          } else {
            // Opponent's hand - compact stacking at top
            startX = player.x;
            startY = 0 + this.cardHeight * 0.4;
          }

          // Create cards for the player's deck
          for (let i = 0; i < player.numCards; i++) {
            let cardX, cardY, cardAngle;

            if (player.uuid === userProfile?.uuid) {
              // Current player - fan out cards
              const spreadFactor =
                (maxWidth * 0.5) / Math.max(player.numCards - 1, 1); // Changed from 0.8 to 0.5
              cardX =
                this.centerX +
                i * spreadFactor -
                (player.numCards * spreadFactor) / 2; // Centered calculation
              cardY = startY;
              cardAngle = angle;
            } else {
              // Opponent - stack cards with slight offset
              const visibleCardCount = Math.min(i, maxVisibleCards);
              const stackOffset = visibleCardCount * stackSpacing;

              cardX = startX - this.cardWidth / 2 + stackOffset;
              cardY = startY;

              // Add slight random rotation for visual interest
              const randomAngle = (Math.random() - 0.5) * 0.02;
              cardAngle = angle + randomAngle;
            }

            const cardFace = new Image();
            cardFace.src =
              player.uuid !== userProfile?.uuid
                ? `/cards/${opponentDeck[i]}.png`
                : `/cards/back${backColor}.png`;

            player.playerDeck.push(
              new Card(
                cardFace,
                cardX,
                cardY,
                this.width,
                this.height,
                cardAngle,
                player.uuid !== userProfile?.uuid
              )
            );
          }
        });
      }

      drawKadi(ctx, x, y) {
        const kadiCircleRadius = this.centerCircleRadius * 1.2;
        ctx.save();

        // Draw the RGBA circle
        ctx.beginPath();
        ctx.arc(x, y, kadiCircleRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120, 214, 75, 0.8)";
        ctx.fill();

        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("KADI", x, y);

        ctx.restore();
      }

      drawDrawPile(ctx) {
        // Draw the drawPile
        this.drawPile.forEach((card) => {
          card.draw(ctx);
        });
      }

      playCard() {
        const currentPlayer = this.players.find(
          (player) => player.uuid === this.turn
        );

        // console.log("### CURRENT PLAYER ###");
        // console.log(currentPlayer);

        const playerIndex = this.players.indexOf(currentPlayer);

        // console.log("### CURRENT PLAYER INDEX ###");
        // console.log(playerIndex);

        let playerDeck = this.players[playerIndex].playerDeck;

        // console.log("### CURRENT PLAYER DECK ###");
        // console.log(playerDeck);

        if (playerDeck.length > 0) {
          let card = playerDeck[playerDeck.length - 1];

          card.isMoving = true;
        } else {
          // console.log("no card available");
          return;
        }
      }

      // You might need to implement this method if you don't have it already
      getCardIdentifier(card) {
        // Extract the card identifier from the card object
        // This depends on how your card objects are structured
        // For example, if the card's image src contains the identifier:
        const srcParts = card.cardImg.src.split("/");
        return srcParts[srcParts.length - 1].split(".")[0];
      }

      drawCard(isPenalty = false, totalPenaltyCards = 0) {
        if (isPenalty && !this.penaltyDrawInProgress) {
          // Initialize penalty sequence
          this.penaltyDrawInProgress = true;
          this.penaltyCardsRemaining = totalPenaltyCards;
          this.drawPenaltyCard();
        } else if (!isPenalty) {
          // Regular card draw
          this.performSingleCardDraw();
        }
      }

      drawPenaltyCard() {
        if (this.penaltyCardsRemaining <= 0) {
          this.penaltyDrawInProgress = false;
          return;
        }

        const currentTime = Date.now();
        if (currentTime - this.lastPenaltyDrawTime >= this.penaltyDrawDelay) {
          this.performSingleCardDraw();
          this.penaltyCardsRemaining--;
          this.lastPenaltyDrawTime = currentTime;

          // Schedule next penalty card draw
          if (this.penaltyCardsRemaining > 0) {
            setTimeout(() => this.drawPenaltyCard(), this.penaltyDrawDelay);
          }
        }
      }

      performSingleCardDraw() {
        // Create new card at center of table
        const cardImg = new Image();
        cardImg.src = `/cards/backred.png`;

        const newCard = new Card(
          cardImg,
          this.centerX + this.cardWidth * 0.6,
          this.centerY,
          this.width,
          this.height
        );

        // Find target player position
        const targetPlayer = this.players.find(
          (player) => player.uuid === this.turn
        );
        newCard.isMoving = true;

        // Add to temporary animation array
        this.activeAnimations.push({
          card: newCard,
          targetX: targetPlayer.x,
          targetY: targetPlayer.y,
        });

        if (this.penaltyDrawInProgress) {
          // Add shake effect for penalty cards
          const shakeAmount = 5;
          this.activeAnimations[this.activeAnimations.length - 1].shake = {
            amount: shakeAmount,
            decay: 0.9,
          };
        }
      }

      render(ctx, deltaTime) {
        // Clear buffer
        this.bufferCtx.clearRect(0, 0, this.width, this.height);

        // Draw pile & update animations animate draw pile
        for (let i = this.activeAnimations.length - 1; i >= 0; i--) {
          const anim = this.activeAnimations[i];
          anim.card.revUpdate(anim.targetX, anim.targetY);
          anim.card.draw(this.bufferCtx);

          if (!anim.card.isMoving) {
            // Clear all animations once any card reaches destination
            this.activeAnimations = [];
            break;
          }
        }

        // Draw rest of game state
        this.renderToContext(this.bufferCtx, deltaTime);

        // Copy buffer to main canvas
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.drawImage(this.bufferCanvas, 0, 0);
      }

      renderToContext(ctx, deltaTime) {
        if (turn) {
          // get current player

          const currentPlayer = this.players.find(
            (player) => player.uuid === turn
          );
          const playerIndex = this.players.indexOf(currentPlayer);

          const playerX = this.players[playerIndex].x;
          const playerY = this.players[playerIndex].y;
        }

        // animate player and player deck
        // animate player and player deck
        this.players.forEach((player, playerIdx) => {
          if (player.uuid !== userProfile?.uuid) {
            // Draw stacked cards
            player.playerDeck.forEach((card, idx) => {
              if (idx < 7 || idx === player.playerDeck.length - 1) {
                card.draw(ctx);
              }
            });

            // Draw card count indicator
            if (player.cardCountIndicator) {
              player.cardCountIndicator.draw(ctx);
            }
          } else {
            // Draw current player's hand normally
            player.playerDeck.forEach((card, cardIdx) => {
              if (card.isVisible || card.isMoving) {
                card.draw(ctx);
              }

              if (card.isMoving) {
                card.update(this.centerX, this.centerY);

                if (!card.isMoving) {
                  setTimeout(() => {
                    this.players[playerIdx].playerDeck.splice(cardIdx, 1);
                  }, 200);
                }
              }
            });
          }
        });
      }

      animate(timeStamp) {
        if (!this.isAnimating) return;

        const deltaTime = timeStamp - this.lastFrameTime;
        if (deltaTime >= this.frameInterval) {
          this.lastFrameTime = timeStamp - (deltaTime % this.frameInterval);
          this.render(ctx, deltaTime);
        }

        requestAnimationFrame(this.animate);
      }
    }

    const players = [
      {
        uuid: userProfile?.uuid,
        username: "player_1",
        profilePicture:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=player1&backgroundColor=b6e3f4",
        // playerDeck: ["4H", "5H", "6C", "7C"],
        numCards: 4,
        on: false,
      },
      {
        uuid: 1,
        username: "tutorial_ai",
        profilePicture:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=ai1&backgroundColor=ffdfbf",
        // playerDeck: scenarios[currentScenario]?.setup?.aiHand || [],
        numCards: 4,
        on: false,
      },
    ];

    const generateDicebearUrl = (name) => {
      const backgroundColors = ["b6e3f4", "c0aede", "d1d4f9"];
      const params = new URLSearchParams({
        seed: name,
        backgroundColor: backgroundColors,
        backgroundType: ["solid", "gradientLinear"],
      });

      return `https://api.dicebear.com/6.x/initials/svg?seed=${params}`;
    };

    const roomPlayers = players.map((player, index) => {
      return new Player(
        player.uuid,
        player.username,
        player?.profilePicture || generateDicebearUrl(player.username),
        // player.playerDeck,
        player.numCards,
        player.on,
        index,
        canvas.width, // canvas width
        canvas.height
      );
    });

    const game = new Game(
      canvas.width,
      canvas.height,
      turn,
      roomPlayers,
      10,
      false, //roomData?.isPenalty,
      handleOpenSuitModal,
      handleCardClick
    );

    gameRef.current = game;

    // console.log("hello world");
    game.initialize();
    game.startAnimation();

    return () => {
      game.stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [userProfile, counter, gameRef, currentScenario, scenarios]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ position: "relative", zIndex: 9 }}
      />

      {/* <div
        className="flex items-center gap-4 bg-red-500"
        style={{ backgroundColor: "brown" }}
      >
        <button
          onClick={() => {
            game.playCard();
          }}
        >
          PLAY CARD
        </button>

        <button
          onClick={() => {
            dealCards();
          }}
        >
          DEAL CARDS
        </button>

        <button
          onClick={() => {
            console.log(game);
            console.log(roomDataCopy);
            // console.log(selectedCards);
            console.log(members);
            // setGame(_game)
          }}
        >
          LOG GAME
        </button>
      </div> */}
    </>
  );
};

export default CardGameAnimation;
