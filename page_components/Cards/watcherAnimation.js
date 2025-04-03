import { useEffect, useRef } from "react";
import "../../styles/cards.css";

const CardGameWatcherAnimation = ({
  containerRef,
  gameRef,
  roomDataCopy,
  members,
  counter,
  setCounter,
  reaction,
  isSmallScreen,
  setCurrentGame,
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const backCard = new Image();
  backCard.src = `/cards/backred.png`;

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
        ctx.fillStyle = "red";
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
        this.numCards = numCards;
        this.on = on;
        this.playerIndex = playerIndex;
        this.elapsedTime = 60; // Initial time in seconds
        this.maxTime = 60; // Maximum time in seconds
        this.playerDeck = [];

        // Calculate responsive radius based on canvas dimensions
        const minDimension = Math.min(canvasWidth, canvasHeight);
        this.outerCircleRadius = Math.max(
          Math.min(minDimension * 0.04, 30), // Max radius of 30px
          15 // Min radius of 15px
        );
        // this.outerCircleRadius = 20; // Radius of the outer circles
      }

      draw(ctx, x, y) {
        const img = new Image();
        img.src =
          reaction && reaction.player === this.uuid
            ? reaction.src
            : this.profilePicture;

        const radius =
          reaction && reaction.player === this.uuid
            ? this.outerCircleRadius * 3
            : this.outerCircleRadius;

        ctx.save();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);

        ctx.restore();

        // Draw reaction bubble if exists
        if (reaction && reaction.player === this.uuid) {
          const padding = this.outerCircleRadius * 0.5;
          const borderRadius = this.outerCircleRadius * 0.5;
          const arrowHeight = this.outerCircleRadius * 0.5;
          const arrowWidth = this.outerCircleRadius * 0.5;

          ctx.font = `${this.outerCircleRadius * 0.8}px Georgia`;
          const textMetrics = ctx.measureText(reaction.text);
          const textWidth = textMetrics.width;
          const textHeight = this.outerCircleRadius * 0.8;

          const bubbleWidth = Math.max(
            textWidth + padding * 2,
            this.outerCircleRadius * 3
          );
          const bubbleHeight = textHeight + padding * 2;

          const isLeftSide = this.playerIndex === 2;
          const bubbleX = isLeftSide
            ? x - radius * 0.5 - arrowWidth - bubbleWidth
            : x + radius * 0.5 + arrowWidth;
          const bubbleY = y - bubbleHeight / 2;

          // Draw bubble background
          ctx.fillStyle = "rgba(255, 255, 255, 1)";
          this.roundRect(
            ctx,
            bubbleX,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            borderRadius
          );

          // Draw arrow
          ctx.beginPath();
          if (isLeftSide) {
            ctx.moveTo(x - radius, y);
            ctx.lineTo(x - radius * 0.5, y - arrowHeight / 2);
            ctx.lineTo(bubbleX + bubbleWidth, y + arrowHeight / 2);
          } else {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + radius * 0.5, y - arrowHeight / 2);
            ctx.lineTo(bubbleX, y + arrowHeight / 2);
          }
          ctx.closePath();
          ctx.fill();

          // Draw text
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            reaction.text,
            bubbleX + bubbleWidth / 2,
            bubbleY + bubbleHeight / 2
          );
        }
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

      updateTimer(deltaTime) {
        // Update timer only if deltaTime is provided
        if (deltaTime) {
          // Calculate seconds passed since last update
          const secondsPassed = deltaTime / 1000; // Convert deltaTime from milliseconds to seconds
          // Deduct seconds passed from the timer
          this.elapsedTime -= secondsPassed;
        }

        if (this.elapsedTime <= 0) {
          // Reset timer when it reaches or goes below 0
          this.elapsedTime = this.maxTime;
        }
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
        this.isMoving = false;
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
        // Base the card size on the smaller canvas dimension
        const minDimension = Math.min(canvasWidth, canvasHeight);

        // Card width will be between 8% and 15% of the smaller canvas dimension
        const baseWidth = minDimension * 0.12; // 12% of smaller dimension

        // Maintain typical playing card proportions (roughly 2.5:3.5)
        const aspectRatio = 1.4;

        // Calculate responsive dimensions with minimum and maximum limits
        this.width = Math.min(Math.max(baseWidth, 40), 80); // Min 40px, Max 80px
        this.height = this.width * aspectRatio;

        // Calculate corner radius based on card size
        this.cornerRadius = this.width * 0.1; // 10% of card width
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Create a rounded rectangle path with responsive corner radius
        ctx.beginPath();
        ctx.moveTo(-this.width / 2 + this.cornerRadius, -this.height / 2);
        ctx.lineTo(this.width / 2 - this.cornerRadius, -this.height / 2);
        ctx.arcTo(
          this.width / 2,
          -this.height / 2,
          this.width / 2,
          -this.height / 2 + this.cornerRadius,
          this.cornerRadius
        );
        ctx.lineTo(this.width / 2, this.height / 2 - this.cornerRadius);
        ctx.arcTo(
          this.width / 2,
          this.height / 2,
          this.width / 2 - this.cornerRadius,
          this.height / 2,
          this.cornerRadius
        );
        ctx.lineTo(-this.width / 2 + this.cornerRadius, this.height / 2);
        ctx.arcTo(
          -this.width / 2,
          this.height / 2,
          -this.width / 2,
          this.height / 2 - this.cornerRadius,
          this.cornerRadius
        );
        ctx.lineTo(-this.width / 2, -this.height / 2 + this.cornerRadius);
        ctx.arcTo(
          -this.width / 2,
          -this.height / 2,
          -this.width / 2 + this.cornerRadius,
          -this.height / 2,
          this.cornerRadius
        );
        ctx.closePath();

        // Clip to the rounded rectangle and draw the image
        ctx.clip();
        ctx.drawImage(
          this.cardImg,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );

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

      revUpdate(playerX, playerY) {
        if (this.isMoving) {
          // Calculate distance to target
          const dx = playerX - this.x;
          const dy = playerY - this.y;
          const distance = Math.hypot(dx, dy);

          // Dynamic easing based on distance
          const easing = Math.min(0.1, distance * 0.0005);

          // Apply movement with easing
          this.x += dx * easing;
          this.y += dy * easing;

          // Stop moving when very close to destination
          if (distance < 1) {
            this.x = playerX;
            this.y = playerY;
            this.isMoving = false;
          }
        }
      }
    }

    class Game {
      constructor(
        width,
        height,
        turn,
        gameStatus,
        players,
        drawPileCount,
        discardPile
      ) {
        this.width = width;
        this.height = height;
        this.turn = turn;
        this.gameStatus = gameStatus;
        this.players = players;
        this.centerCircleRadius = 20; // Radius of the center circle
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;

        this.lastPlayedCard = null;

        this.outerCircleRadiusWithOffset = canvas.width / 3;

        this.cardWidth = isSmallScreen ? Math.min(width * 0.15, 45) : 60;
        this.cardHeight = isSmallScreen ? Math.min(height * 0.12, 70) : 90;

        this.cards = [];
        this.drawPileCount = drawPileCount; // Number of cards in the pile
        this.drawPile = []; // Array to hold the pile of cards
        this.discardPileCards = [];
        this.discardPile = discardPile;

        this.rippleRadius = 0; // Initial radius of the ripple
        this.rippleMaxRadius = 40; // Maximum radius of the ripple
        this.rippleLineWidth = 3; // Width of the ripple lines
        this.rippleNumRipples = 10; // Number of ripples
        this.rippleFadeOutRate = 0.02; // Rate at which the ripple fades out per frame
        this.lastFrameTime = 0; // Last frame time for smoother animationframe time for smoother animation

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
      }

      populateDrawPile() {
        let cardX = this.centerX + this.cardWidth * 0.6;
        let cardY = this.centerY;

        // Draw the pile
        for (let i = 0; i < this.drawPileCount; i++) {
          this.drawPile.push(
            new Card(backCard, cardX, cardY, this.width, this.height)
          );
        }
      }

      populatePlayerDecks() {
        this.players.forEach((player) => {
          const isSmallScreen = this.width < 768;
          const maxWidth = isSmallScreen ? this.width * 0.9 : this.width * 0.8;
          const maxHeight = this.height * 0.8;

          const baseOverlap = isSmallScreen ? 0.85 : 0.7;
          const effectiveOverlap = this.cardWidth * baseOverlap;

          // Calculate overlaps
          const overlapX = Math.max(
            effectiveOverlap,
            this.cardWidth - maxWidth / player.numCards
          );
          const overlapY = Math.max(
            effectiveOverlap,
            this.cardHeight - maxHeight / player.numCards
          );

          // Calculate effective dimensions
          const effectiveCardWidth = this.cardWidth - overlapX;
          const effectiveCardHeight = this.cardHeight - overlapY;

          let startX,
            startY,
            angle = 0;
          const totalWidth =
            effectiveCardWidth * (player.numCards - 1) + this.cardWidth;
          const totalHeight =
            effectiveCardHeight * (player.numCards - 1) + this.cardHeight;

          if (player.playerIndex === 0) {
            startX = player.x - totalWidth / 2 + this.cardWidth / 2;
            startY = player.y;
          } else if (player.playerIndex === 1) {
            startX = player.x - totalWidth / 2 + this.cardWidth / 2;
            startY = player.y;
            angle = -Math.PI;
          }

          for (let i = 0; i < player.numCards; i++) {
            const cardX = startX + i * effectiveCardWidth;
            const cardY = startY;

            player.playerDeck.push(
              new Card(
                backCard,
                cardX,
                cardY,
                this.width,
                this.height,
                angle,
                true
              )
            );
          }
        });
      }

      populatePlayerDecksThreePlayers() {
        this.players.forEach((player) => {
          const isSmallScreen = this.width < 768;
          const maxWidth = isSmallScreen ? this.width * 0.9 : this.width * 0.8;
          const maxHeight = this.height * 0.8;

          const baseOverlap = isSmallScreen ? 0.85 : 0.7;
          const effectiveOverlap = this.cardWidth * baseOverlap;

          // Calculate overlaps
          const overlapX = Math.max(
            effectiveOverlap,
            this.cardWidth - maxWidth / player.numCards
          );
          const overlapY = Math.max(
            effectiveOverlap,
            this.cardHeight - maxHeight / player.numCards
          );

          // Calculate effective dimensions
          const effectiveCardWidth = this.cardWidth - overlapX;
          const effectiveCardHeight = this.cardHeight - overlapY;

          let startX,
            startY,
            angle = 0;
          const totalWidth =
            effectiveCardWidth * (player.numCards - 1) + this.cardWidth;
          const totalHeight =
            effectiveCardHeight * (player.numCards - 1) + this.cardHeight;

          if (player.playerIndex === 0) {
            startX = player.x - totalWidth / 2 + this.cardWidth / 2;
            startY = player.y;
            angle = -Math.PI;
          } else if (player.playerIndex === 1) {
            startX = player.x;
            startY = player.y - totalWidth / 2 + this.cardWidth / 2;
            angle = Math.PI / 2;
          } else if (player.playerIndex === 2) {
            startX = player.x;
            startY = player.y - totalWidth / 2 + this.cardWidth / 2;
            angle = -Math.PI / 2;
          }

          for (let i = 0; i < player.numCards; i++) {
            const cardX =
              player.playerIndex === 1 || player.playerIndex === 2
                ? startX
                : startX + i * effectiveCardWidth;

            const cardY =
              player.playerIndex === 1 || player.playerIndex === 2
                ? startY + i * effectiveCardWidth
                : startY;

            player.playerDeck.push(
              new Card(
                backCard,
                cardX,
                cardY,
                this.width,
                this.height,
                angle,
                true
              )
            );
          }
        });
      }

      populatePlayerDecksFourPlayers() {
        this.players.forEach((player) => {
          const isSmallScreen = this.width < 768;
          const maxWidth = isSmallScreen ? this.width * 0.9 : this.width * 0.8;
          const maxHeight = this.height * 0.8;

          const baseOverlap = isSmallScreen ? 0.85 : 0.7;
          const effectiveOverlap = this.cardWidth * baseOverlap;

          const overlapX = Math.max(
            effectiveOverlap,
            this.cardWidth - maxWidth / player.numCards
          );
          const overlapY = Math.max(
            effectiveOverlap,
            this.cardHeight - maxHeight / player.numCards
          );

          const effectiveCardWidth = this.cardWidth - overlapX;
          const effectiveCardHeight = this.cardHeight - overlapY;

          let startX,
            startY,
            angle = 0;
          const totalWidth =
            effectiveCardWidth * (player.numCards - 1) + this.cardWidth;
          const totalHeight =
            effectiveCardHeight * (player.numCards - 1) + this.cardHeight;

          if (player.playerIndex === 0) {
            startX = player.x - totalWidth / 2 + this.cardWidth / 2;
            startY = player.y;
          } else if (player.playerIndex === 1) {
            startX = player.x - totalWidth / 2 + this.cardWidth / 2;
            startY = player.y;
            angle = -Math.PI;
          } else if (player.playerIndex === 2) {
            startX = player.x;
            startY = player.y - totalWidth / 2 + this.cardWidth / 2;
            angle = Math.PI / 2;
          } else if (player.playerIndex === 3) {
            startX = player.x;
            startY = player.y - totalWidth / 2 + this.cardWidth / 2;
            angle = -Math.PI / 2;
          }

          for (let i = 0; i < player.numCards; i++) {
            const cardX =
              player.playerIndex === 1 || player.playerIndex === 0
                ? startX + i * effectiveCardWidth
                : startX;
            const cardY =
              player.playerIndex === 2 || player.playerIndex === 3
                ? startY + i * effectiveCardWidth
                : player.playerIndex === 1 || player.playerIndex === 0
                ? startY
                : startY + i * effectiveCardHeight;

            player.playerDeck.push(
              new Card(
                backCard,
                cardX,
                cardY,
                this.width,
                this.height,
                angle,
                true
              )
            );
          }
        });
      }

      drawTimer(player) {
        // Draw progress bar background
        const barWidth = 60; // Adjust the width of the progress bar
        const barHeight = 10; // Adjust the height of the progress bar
        // const barX = player.x + barWidth / 2; // X coordinate of the progress bar
        let barX;
        let barY;

        if (player.playerIndex === 0) {
          barX = player.x + 10;
          barY = player.y + 20;
        } else if (player.playerIndex === 1) {
          barX = player.x + barWidth / 2;
          barY = player.y - 40;
        }

        ctx.fillStyle = "gray";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Calculate remaining time percentage
        const remainingTimePercentage = player.elapsedTime / player.maxTime;

        // Draw progress bar foreground
        const progressWidth = barWidth * remainingTimePercentage;
        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, progressWidth, barHeight);
      }

      drawRipple(ctx, x, y) {
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

      drawWaitingText(ctx, username, x, y) {
        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Waiting for ${username}...`, x, y);

        // ctx.restore();
      }

      drawWaitingTextSidePlayers(ctx, username, x, y) {
        const angle = x > this.centerX ? -Math.PI / 2 : Math.PI / 2;
        ctx.save();

        ctx.translate(x, y);

        ctx.rotate(angle);
        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Waiting for ${username}...`, 0, 0);

        ctx.restore();
      }

      drawDrawPile(ctx) {
        // Draw the drawPile
        this.drawPile.forEach((card) => {
          card.draw(ctx);
        });
      }

      drawDiscardPile(ctx) {
        this?.discardPile?.forEach((card, index) => {
          const cardImg = new Image();
          cardImg.src = `/cards/${card}.png`;
          const cardX = this.centerX - this.cardWidth * 0.6;
          const cardY = this.centerY;

          let _card = new Card(cardImg, cardX, cardY, this.width, this.height);
          _card.draw(ctx);
        });
      }

      playCard() {
        const currentPlayer = this.players.find(
          (player) => player.uuid === this.turn
        );

        // console.log("### CURRENT PLAYER ###");
        // console.log(currentPlayer);

        const playerIndex = this.players.indexOf(currentPlayer);

        console.log("### CURRENT PLAYER INDEX ###");
        console.log(playerIndex);

        let playerDeck = this.players[playerIndex].playerDeck;

        console.log("### CURRENT PLAYER DECK ###");
        console.log(playerDeck);

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

      _drawCard() {
        const card = this.drawPile[this.drawPile.length - 1];

        card.isMoving = true;
      }

      render(ctx, deltaTime) {
        // this.drawDrawPile(ctx);
        // animate drawpile
        // this.drawDiscardPile(ctx);
      }
    }

    const generateDicebearUrl = (name) => {
      const backgroundColors = ["b6e3f4", "c0aede", "d1d4f9"];
      const params = new URLSearchParams({
        seed: name,
        backgroundColor: backgroundColors,
        backgroundType: ["solid", "gradientLinear"],
      });

      return `https://api.dicebear.com/6.x/initials/svg?seed=${params}`;
    };

    const roomPlayers = roomDataCopy[0]?.players.map((player, index) => {
      return new Player(
        player.userId,
        player.username,
        player?.profilePicture || generateDicebearUrl(player.username),
        // generateDicebearUrl(player.username),
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
      roomDataCopy[0]?.turn,
      roomDataCopy[0]?.gameStatus,
      roomPlayers,
      roomDataCopy[0]?.drawPileLength,
      roomDataCopy[0]?.discardPile
    );

    gameRef.current = game;

    setCurrentGame(game);

    game.populateDrawPile();

    // game.populateDiscardPile();

    let lastTime = 0;

    function animate(timeStamp) {
      // console.log("animating....");

      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      // const deltaTime = timeStamp - lastTime;
      // lastTime = timeStamp;
      requestAnimationFrame(animate);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      game.render(ctx, deltaTime);

      if (roomDataCopy[0]?.turn) {
        // get current player

        const currentPlayer = game.players.find(
          (player) => player.uuid === roomDataCopy[0]?.turn
        );
        const playerIndex = game.players.indexOf(currentPlayer);

        const playerX = game.players[playerIndex]?.x;
        const playerY = game.players[playerIndex]?.y;

        // animate draw pile
        game.drawPile.forEach((card, index) => {
          // Set card's destination position and initiate animation
          if (card.isMoving) {
            card.revUpdate(playerX, playerY);

            // card reached destination
            if (!card.isMoving) {
              // remove from drawpile
              game.drawPile.splice(index, 1);
            }
          }
        });
      }

      // animate player and player deck
      game.players.forEach((player, playerIdx) => {
        player.playerDeck.forEach((card, cardIdx) => {
          if (card.isVisible || card.isMoving) {
            card.draw(ctx);
          }

          if (card.isMoving) {
            card.update(game.centerX, game.centerY);

            if (!card.isMoving) {
              setTimeout(() => {
                game.players[playerIdx].playerDeck.splice(cardIdx, 1);
              }, 200);
            }
          }
        });

        switch (game.players.length) {
          case 4: // 4 players
            game.players[0].x = game.centerX;
            game.players[0].y = game.height - 50;

            game.players[1].x = game.width * 0.5;
            game.players[1].y = 50;

            game.players[2].x = 50;
            game.players[2].y = game.centerY;

            game.players[3].x = game.width - 50;
            game.players[3].y = game.centerY;

            if (roomDataCopy[0].maxPlayers === roomDataCopy[0].players.length) {
              // ripple effect on current player turn
              if (game.players[0].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[0].x, game.players[0].y);
              }

              if (game.players[1].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[1].x, game.players[1].y);
              }

              if (game.players[2].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[2].x, game.players[2].y);
              }

              if (game.players[3].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[3].x, game.players[3].y);
              }

              game.players[0].draw(ctx, game.players[0].x, game.players[0].y);
              game.players[1].draw(ctx, game.players[1].x, game.players[1].y);
              game.players[2].draw(ctx, game.players[2].x, game.players[2].y);
              game.players[3].draw(ctx, game.players[3].x, game.players[3].y);

              if (game.players[0].on) {
                game.drawKadi(ctx, game.players[0].x, game.players[0].y);
              }

              if (game.players[1].on) {
                game.drawKadi(ctx, game.players[1].x, game.players[1].y);
              }

              if (game.players[2].on) {
                game.drawKadi(ctx, game.players[2].x, game.players[2].y);
              }

              if (game.players[3].on) {
                game.drawKadi(ctx, game.players[3].x, game.players[3].y);
              }
            }

            break;
          case 3: // 3 players
            game.players[0].x = game.width * 0.5;
            game.players[0].y = 50;

            game.players[1].x = 50;
            game.players[1].y = game.centerY;

            game.players[2].x = game.width - 50;
            game.players[2].y = game.centerY;

            if (roomDataCopy[0].maxPlayers === roomDataCopy[0].players.length) {
              // ripple effect on current player turn
              if (game.players[0].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[0].x, game.players[0].y);
              }

              if (game.players[1].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[1].x, game.players[1].y);
              }

              if (game.players[2].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[2].x, game.players[2].y);
              }

              game.players[0].draw(ctx, game.players[0].x, game.players[0].y);
              game.players[1].draw(ctx, game.players[1].x, game.players[1].y);
              game.players[2].draw(ctx, game.players[2].x, game.players[2].y);

              if (game.players[0].on) {
                game.drawKadi(ctx, game.players[0].x, game.players[0].y);
              }

              if (game.players[1].on) {
                game.drawKadi(ctx, game.players[1].x, game.players[1].y);
              }

              if (game.players[0].on) {
                game.drawKadi(ctx, game.players[2].x, game.players[2].y);
              }
            }

            break;
          case 2: // 2 players
            game.players[0].x = game.centerX;
            game.players[0].y = game.height - 50;

            game.players[1].x = game.centerX;
            game.players[1].y = 50;

            if (roomDataCopy[0].maxPlayers === roomDataCopy[0].players.length) {
              // ripple effect on current player turn
              if (game.players[0].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[0].x, game.players[0].y);
              }

              if (game.players[1].uuid === roomDataCopy[0].turn) {
                game.drawRipple(ctx, game.players[1].x, game.players[1].y);
              }

              game.players[0].draw(ctx, game.players[0].x, game.players[0].y);
              game.players[1].draw(ctx, game.players[1].x, game.players[1].y);

              if (game.players[0].on) {
                game.drawKadi(ctx, game.players[0].x, game.players[0].y);
              }

              if (game.players[1].on) {
                game.drawKadi(ctx, game.players[1].x, game.players[1].y);
              }
            }

            break;

          default:
            break;
        }
      });
    }

    animate(0);

    if (roomDataCopy[0]?.players.length === 2) {
      game.populatePlayerDecks();
    }

    if (roomDataCopy[0]?.players.length === 3) {
      game.populatePlayerDecksThreePlayers();
    }

    if (roomDataCopy[0]?.players.length === 4) {
      game.populatePlayerDecksFourPlayers();
    }

    // console.log("hello world");
    // console.log(game);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [counter, roomDataCopy, reaction, gameRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ position: "relative", zIndex: 9 }}
      />
    </>
  );
};

export default CardGameWatcherAnimation;
