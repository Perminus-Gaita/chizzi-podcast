import { useEffect, useRef } from "react";
import "../../styles/cards.css";

const CardGameReplayAnimation = ({
  gameRef,
  roomData,
  isSmallScreen,
  counter,
  setCounter,
  currentGameIndex,
  setCurrentGameIndex,
  setLoading,
  setTopCard,
  calculateCardCounts,
  topCard,
}) => {
  const canvasRef = useRef(null);

  const ctxRef = useRef(null);

  const backCard = new Image();
  backCard.src = `/cards/backred.png`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    // Update canvas dimensions when the window is resized
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      // console.log("### REsizing Canvas ###");
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
      constructor(cardImg, x, y, canvasWidth, canvasHeight, angle = 0) {
        this.cardImg = cardImg;
        this.x = x;
        this.y = y;
        // this.width = width;
        // this.height = height;
        this.isMoving = false;
        // this.dx = 20;
        this.angle = angle;

        // Calculate responsive dimensions
        this.calculateDimensions(canvasWidth, canvasHeight);

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
        // ctx.drawImage(this.cardImg, this.x, this.y, this.width, this.height);

        ctx.save(); // Save the current canvas state
        ctx.translate(this.x, this.y); // Translate to the card's position
        ctx.rotate(this.angle); // Rotate the canvas by the specified angle

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

        // ctx.drawImage(this.cardImg, 0, 0, this.width, this.height); // Draw the card image
        ctx.restore(); // Restore the canvas state
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

            if (currentGameIndex + 1 < roomData.gamePlay.length) {
              setCurrentGameIndex(currentGameIndex + 1);
              setTopCard(roomData?.gamePlay[currentGameIndex]?.card);
            } else {
              setTopCard(roomData?.gamePlay[currentGameIndex]?.card);
            }

            setLoading(false);
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

            setCurrentGameIndex(currentGameIndex + 1);
            setLoading(false);
          }
        }
      }
    }

    class Game {
      constructor(width, height, gameStatus, players, drawPileCount) {
        this.width = width;
        this.height = height;
        this.gameStatus = gameStatus;
        this.players = players;
        this.centerCircleRadius = 20; // Radius of the center circle
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;

        this.outerCircleRadiusWithOffset = canvas.width / 3;
        this.cardWidth = isSmallScreen ? 55 : 66;
        this.cardHeight = isSmallScreen ? 65 : 85;
        this.cards = [];
        this.drawPileCount = drawPileCount; // Number of cards in the pile
        this.drawPile = []; // Array to hold the pile of cards

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
        const pileWidth = 80; // Width of the pile

        // Draw the pile
        for (let i = 0; i < this.drawPileCount; i++) {
          // const x = centerX - pileWidth * 1.5 + i * 2;
          const x = this.centerX - this.cardWidth - 25;
          // const x = centerX - pileWidth + i * 2;

          const y = this.centerY - this.cardHeight * 0.5; // Stack cards with a small offset
          this.drawPile.push(
            new Card(backCard, x, y, this.cardWidth, this.cardHeight)
          );
        }
      }

      populatePlayerDecks() {
        this.players.forEach((player, index) => {
          let startX;
          let startY;

          if (player.playerIndex === 0) {
            startX = player.x - (player.numCards * (this.cardWidth - 30)) / 2;
            startY = player.y - this.cardHeight * 1.5;
          } else if (player.playerIndex === 1) {
            startX = player.x - (player.numCards * (this.cardWidth - 30)) / 2;
            startY = player.y + this.cardHeight * 0.5;
          }

          // Populate the player's deck with centered cards
          for (let i = 0; i < player.numCards; i++) {
            player.playerDeck.push(
              new Card(
                backCard,
                startX + i * (this.cardWidth - 25),
                startY,
                this.cardWidth,
                this.cardHeight
              )
            );
          }
        });
      }

      populatePlayerDecksThreePlayers() {
        this.players.forEach((player, index) => {
          let startX;
          let startY;
          let angle = 0;
          let offset = 0;

          if (player.playerIndex === 0) {
            startX = player.x - (player.numCards * (this.cardWidth - 30)) / 2;
            startY = player.y - this.cardHeight * 1.5;
            offset = this.cardWidth - 30;
          } else if (player.playerIndex === 1) {
            // Player 2 - left side
            startX = isSmallScreen
              ? this.cardHeight
              : player.x + this.cardHeight + this.centerCircleRadius * 2;
            startY = player.y - this.cardWidth;
            angle = Math.PI / 2; // 90 degrees
            offset = this.cardHeight - 30;
          } else if (player.playerIndex === 2) {
            // Player 3 - right side
            startX = isSmallScreen
              ? this.width - this.cardHeight
              : player.x - this.cardHeight - this.centerCircleRadius * 2;
            startY = player.y;
            angle = -Math.PI / 2; // -90 degrees
            offset = this.cardHeight - 30;
          }

          // Populate the player's deck with centered cards
          for (let i = 0; i < player.numCards; i++) {
            let cardX = startX;
            let cardY = startY;

            if (player.playerIndex === 0) {
              // For the user, spread cards horizontally
              cardX = startX + i * offset;
            } else {
              // For other players, spread cards vertically
              cardY = startY + (i * offset) / 2;
            }

            player.playerDeck.push(
              new Card(
                backCard,
                cardX,
                cardY,
                this.cardWidth,
                this.cardHeight,
                angle // Pass the rotation angle to the card
              )
            );
          }
        });
      }

      populatePlayerDecksFourPlayers() {
        this.players.forEach((player, index) => {
          let startX;
          let startY;
          let angle = 0;
          let offset = 0;

          // Determine angle of rotation, offset based on the player's position
          if (player.playerIndex === 0) {
            // Player 1 - bottom
            // Calculate starting position for player 1 (bottom of the canvas)
            startX = player.x - (player.numCards * (this.cardWidth - 30)) / 2;
            startY = player.y - this.cardHeight * 1.5;
            offset = this.cardWidth - 30;
          } else if (player.playerIndex === 1) {
            // Player 2 - left side
            startX = isSmallScreen
              ? this.cardHeight
              : player.x + this.cardHeight + this.centerCircleRadius * 2;
            startY = player.y - this.cardWidth;
            angle = Math.PI / 2; // 90 degrees
            offset = this.cardHeight - 30;
          } else if (player.playerIndex === 2) {
            // Player 3 - right side
            startX = isSmallScreen
              ? this.width - this.cardHeight
              : player.x - this.cardHeight - this.centerCircleRadius * 2;
            startY = player.y;
            angle = -Math.PI / 2; // -90 degrees
            offset = this.cardHeight - 30;
          } else if (player.playerIndex === 3) {
            // Player 3 - top side
            startX = player.x - (player.numCards * (this.cardWidth - 30)) / 2;
            startY = isSmallScreen ? 0 : player.y + this.cardHeight * 0.5;

            offset = this.cardWidth - 30;
          }

          // Populate the player's deck with centered cards
          for (let i = 0; i < player.numCards; i++) {
            let cardX = startX;
            let cardY = startY;

            if (player.playerIndex === 0 || player.playerIndex === 3) {
              // For the user, spread cards horizontally
              cardX = startX + i * offset;
            } else {
              if (player.playerIndex === 1 || player.playerIndex === 2) {
                // For other players, spread cards vertically
                cardY = startY + (i * offset) / 2;
              }
            }

            player.playerDeck.push(
              new Card(
                backCard,
                cardX,
                cardY,
                this.cardWidth,
                this.cardHeight,
                angle // Pass the rotation angle to the card
              )
            );
          }
        });
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

      drawTopCard(ctx) {
        const cardImg = new Image();
        cardImg.src = `/cards/${topCard}.png`;
        let _card = new Card(
          cardImg,
          this.centerX,
          this.centerY - this.cardHeight * 0.5,
          this.cardWidth,
          this.cardHeight
        );
        _card.draw(ctx);
      }

      playCard(playerIndex) {
        // console.log("### The player INDEX ####");
        // console.log(playerIndex);

        // console.log("### Player ###");
        // console.log(this.players[playerIndex]);

        let playerDeck = this.players[playerIndex].playerDeck;

        if (playerDeck.length > 0) {
          let card = playerDeck[playerDeck.length - 1];

          card.isMoving = true;
        } else {
          // console.log("no card available");
          return;
        }
      }

      _drawCard() {
        // console.log("trying to draw card...");
        const card = this.drawPile[this.drawPile.length - 1];

        card.isMoving = true;
      }

      render(ctx, deltaTime) {
        this.drawDrawPile(ctx);

        // animate drawpile
        this.drawTopCard(ctx);
      }
    }

    const { drawPileLength, playerCardCounts } = calculateCardCounts(
      roomData?.gamePlay
    );

    const roomPlayers = roomData?.players.map((player, index) => {
      const numCards = playerCardCounts[player.userId] || 0; // Get the number of cards from playerCardCounts or default to 0

      return new Player(
        player.userId,
        player.username,
        player.profilePicture,
        numCards,
        player.on,
        index
      );
    });

    const game = new Game(
      canvas.width,
      canvas.height,
      roomData?.gameStatus,
      roomPlayers,
      drawPileLength
    );

    gameRef.current = game;

    game.populateDrawPile();

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

      // get current player
      const currentPlayer = game.players.find(
        (player) => player.uuid === roomData.gamePlay[currentGameIndex]?.player
      );
      const playerIndex = game.players.indexOf(currentPlayer);

      const playerX = game.players[playerIndex].x;
      const playerY = game.players[playerIndex].y;

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

      // animate player and player deck
      game.players.forEach((player, playerIdx) => {
        player.playerDeck.forEach((card, cardIdx) => {
          card.draw(ctx); // Draw the card at its position

          if (card.isMoving) {
            card.update(game.centerX, game.centerY);

            // card reached discard pile
            if (!card.isMoving) {
              // remove from playerdeck
              game.players[playerIdx].playerDeck.splice(cardIdx, 1);
            }
          }
        });

        // Draw other players
        switch (game.players.length) {
          case 4: // 4 players
            game.players[0].x = game.centerX;
            game.players[0].y = game.height - 30;

            game.players[1].x = 50;
            game.players[1].y = game.centerY;

            game.players[2].x = game.width - 50;
            game.players[2].y = game.centerY;

            game.players[3].x = game.centerX;
            game.players[3].y = 50;

            // room full
            if (roomData.maxPlayers === roomData.players.length) {
              // PLAYER 1
              // draw player 1 timer and ripple
              if (
                game.players[0].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[0].x, game.players[0].y);
              }

              game.players[0].draw(ctx, game.players[0].x, game.players[0].y);

              // if player 2 is on
              if (game.players[0].on) {
                game.drawKadi(ctx, game.players[0].x, game.players[0].y);
              }

              // PLAYER 2
              // draw player 3 timer and ripple
              if (
                game.players[1].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[1].x, game.players[1].y);
              }

              game.players[1].draw(ctx, game.players[1].x, game.players[1].y);

              // if player 2 is on
              if (game.players[1].on) {
                game.drawKadi(ctx, game.players[1].x, game.players[1].y);
              }

              // PLAYER 3
              // draw player 3 timer and ripple
              if (
                game.players[2].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[2].x, game.players[2].y);
              }

              game.players[2].draw(ctx, game.players[2].x, game.players[2].y);

              // if player 3 is on
              if (game.players[2].on) {
                game.drawKadi(ctx, game.players[2].x, game.players[2].y);
              }

              // PLAYER 4
              // draw player 4 timer and ripple
              if (
                game.players[3].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[3].x, game.players[3].y);
              }

              game.players[3].draw(ctx, game.players[3].x, game.players[3].y);

              // if player 4 is on
              if (game.players[3].on) {
                game.drawKadi(ctx, game.players[3].x, game.players[3].y);
              }
            }
            break;
          case 3: // 3 players
            if (isSmallScreen) {
              game.players[0].x = game.centerX;
              game.players[0].y = game.height - 30;

              game.players[1].x = 50;
              game.players[1].y = game.centerY * 0.5;

              game.players[2].x = game.width - 50;
              game.players[2].y = game.centerY * 0.5;
            } else {
              game.players[0].x = game.centerX;
              game.players[0].y = game.height - 30;

              game.players[1].x = 50;
              game.players[1].y = game.centerY;

              game.players[2].x = game.width - 50;
              game.players[2].y = game.centerY;
            }

            // room full
            if (roomData.maxPlayers === roomData.players.length) {
              // PLAYER 1
              // draw player 1 timer and ripple
              if (
                game.players[0].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[0].x, game.players[0].y);
              }

              game.players[0].draw(ctx, game.players[0].x, game.players[0].y);

              // if player 2 is on
              if (game.players[0].on) {
                game.drawKadi(ctx, game.players[0].x, game.players[0].y);
              }

              // PLAYER 2
              // draw player 3 timer and ripple
              if (
                game.players[1].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[1].x, game.players[1].y);
              }

              game.players[1].draw(ctx, game.players[1].x, game.players[1].y);

              // if player 2 is on
              if (game.players[1].on) {
                game.drawKadi(ctx, game.players[1].x, game.players[1].y);
              }

              // PLAYER 3
              // draw player 3 timer and ripple
              if (
                game.players[2].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[2].x, game.players[2].y);
              }

              game.players[2].draw(ctx, game.players[2].x, game.players[2].y);

              // if player 3 is on
              if (game.players[2].on) {
                game.drawKadi(ctx, game.players[2].x, game.players[2].y);
              }
            }
            break;
          case 2: // 2 players
            game.players[0].x = game.centerX;
            game.players[0].y = game.height - 30;

            game.players[1].x = game.centerX;
            game.players[1].y = 50;

            // room full
            if (roomData.maxPlayers === roomData.players.length) {
              // draw player 1 timer and ripple
              if (
                game.players[0].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[0].x, game.players[0].y);
              }

              game.players[0].draw(ctx, game.players[0].x, game.players[0].y);

              // draw player 2 timer and ripple
              if (
                game.players[1].uuid ===
                roomData.gamePlay[currentGameIndex]?.player
              ) {
                game.drawRipple(ctx, game.players[1].x, game.players[1].y);
              }

              game.players[1].draw(ctx, game.players[1].x, game.players[1].y);

              // if player 1 is on
              if (game.players[0].on) {
                game.drawKadi(ctx, game.players[0].x, game.players[0].y);
              }

              // if player 2 is on
              if (game.players[1].on) {
                game.drawKadi(ctx, game.players[1].x, game.players[1].y);
              }
            }

            break;
          default:
            break;
        }
      });

      // Update player timers
      game.players.forEach((player) => {
        player.updateTimer(deltaTime);
      });
    }

    animate(0);

    if (roomData?.players.length === 2) {
      game.populatePlayerDecks();
    }

    if (roomData?.players.length === 3) {
      game.populatePlayerDecksThreePlayers();
    }

    if (roomData?.players.length === 4) {
      game.populatePlayerDecksFourPlayers();
    }

    // console.log("hello world");

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [counter, currentGameIndex, topCard, roomData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ position: "relative", zIndex: 9 }}
    />
  );
};

export default CardGameReplayAnimation;
