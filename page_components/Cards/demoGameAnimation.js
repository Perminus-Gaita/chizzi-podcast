import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "../../styles/cards.css";

const DemoCardGameAnimation = ({ gameRef, roomDataCopy, members, counter, setCounter }) => {
  const canvasRef = useRef(null);

  const ctxRef = useRef(null);

  const backCard = new Image();
  backCard.src = `/cards/backred.png`;

  const dealCards = () => {
    // const totalDeals = 3 * 4;
    // console.log("### TOTAL DEALS ###");
    // console.log(totalDeals);
    // const dealInterval = setInterval(() => {
    //   if (game.players.every((player) => player.playerDeck.length === 4)) {
    //     clearInterval(dealInterval);
    //     return;
    //   }
    //   game.drawPile[game.drawPile.length - 1].isMoving = true;
    // }, 100); // Adjust the interval as needed for the animation speed
    return;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    // Update canvas dimensions when the window is resized
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      console.log("### REsizing Canvas ###");
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Player {
      constructor(uuid, username, profilePicture, numCards, on) {
        this.x = null;
        this.y = null;
        this.uuid = uuid;
        this.username = username;
        this.profilePicture = profilePicture;
        this.numCards = numCards;
        this.on = on;
        this.elapsedTime = 60; // Initial time in seconds
        this.maxTime = 60; // Maximum time in seconds
        this.playerDeck = [];
        this.outerCircleRadius = 20; // Radius of the outer circles
      }

      draw(ctx, x, y) {
        const img = new Image();
        img.src = this.profilePicture;

        ctx.save();

        ctx.beginPath();
        ctx.arc(x, y, this.outerCircleRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
          img,
          x - this.outerCircleRadius,
          y - this.outerCircleRadius,
          this.outerCircleRadius * 2,
          this.outerCircleRadius * 2
        );

        ctx.restore();

        ctx.font = "16px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText(
          this.uuid === "1" ? "You" : this.username,
          x + this.outerCircleRadius * 1.2,
          y - this.outerCircleRadius * 0.5
        );
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
      constructor(cardImg, x, y, width, height) {
        this.cardImg = cardImg;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isMoving = false;
        this.dx = 20;
      }

      draw(ctx) {
        ctx.drawImage(this.cardImg, this.x, this.y, this.width, this.height);
      }

      update(centerX, centerY) {
        if (this.isMoving) {
          if (this.x > centerX) {
            // Move left if the card is to the right of the center
            this.x -= this.dx;
          } else if (this.x < centerX) {
            // Move right if the card is to the left of the center
            this.x += this.dx;
          }

          if (this.y > centerY) {
            // Move up if the card is below the center
            this.y -= this.dx;
          } else if (this.y < centerY) {
            // Move down if the card is above the center
            this.y += this.dx;
          }

          if (
            Math.abs(this.x - centerX) <= this.dx &&
            Math.abs(this.y - centerY) <= this.dx
          ) {
            this.isMoving = false;
          }
        }
      }

      revUpdate(playerX, playerY) {
        if (this.isMoving) {
          if (Math.abs(this.x - playerX) > this.dx) {
            // Move left if the card is to the right of the player's position
            this.x += playerX - this.x > 0 ? this.dx : -this.dx;
          }

          if (Math.abs(this.y - playerY) > this.dx) {
            // Move up if the card is below the player's position
            this.y += playerY - this.y > 0 ? this.dx : -this.dx;
          }

          if (
            Math.abs(this.x - playerX) <= this.dx &&
            Math.abs(this.y - playerY) <= this.dx
          ) {
            // If the card is close enough to the player's position, stop moving
            this.isMoving = false;
          }
        }
      }
    }

    class Game {
      constructor(
        width,
        height,
        gameStatus,
        players,
        drawPileCount,
        discardPile
      ) {
        this.width = width;
        this.height = height;
        this.gameStatus = gameStatus;
        this.players = players;
        this.centerCircleRadius = 20; // Radius of the center circle
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;

        this.outerCircleRadiusWithOffset = canvas.width / 3;
        this.cardWidth = 65;
        this.cardHeight = 80;
        this.cards = [];
        this.drawPileCount = drawPileCount; // Number of cards in the pile
        this.drawPile = []; // Array to hold the pile of cards
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

        // Draw other players
        this.otherPlayers = this.players.filter(
          (player) => player.uuid !== "1"
        );

        // set players positions
        this.currentPlayer = this.players[0];

        this.currentPlayer.x = this.centerX;
        this.currentPlayer.y = this.height - 50;

        switch (this.otherPlayers.length) {
          case 1:
            this.otherPlayers[0].x = this.centerX;
            this.otherPlayers[0].y = this.height / 6;
            break;
          default:
            break;
        }
      }

      populateDrawPile() {
        const pileWidth = 60; // Width of the pile
        const pileHeight = 80; // Height of the pile
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw the pile
        for (let i = 0; i < this.drawPileCount; i++) {
          const x = centerX - pileWidth * 1.5 + i * 2;
          // const x = centerX - pileWidth + i * 2;
          const y = centerY - pileHeight / 2; // Stack cards with a small offset
          this.drawPile.push(
            new Card(backCard, x, y, this.cardWidth, this.cardHeight)
          );
        }
      }

      populatePlayerDecks() {
        this.players.forEach((player, index) => {
          let startX;
          let startY;
          if (player.uuid === "1") {
            // Calculate starting position for the user's deck
            startX = player.x - (player.numCards * (this.cardWidth - 30)) / 2;
            startY = player.y - this.cardHeight * 1.5;
          } else {
            // Calculate starting position to center the cards for other players
            startX = player.x - (player.numCards * (this.cardWidth - 30)) / 2;
            startY = player.y;
          }

          // Populate the player's deck with centered cards
          for (let i = 0; i < player.numCards; i++) {
            player.playerDeck.push(
              new Card(
                backCard,
                startX + i * (this.cardWidth - 30),
                startY,
                this.cardWidth,
                this.cardHeight
              )
            );
          }
        });
      }

      drawTimer(player) {
        // Draw progress bar background
        const barWidth = 60; // Adjust the width of the progress bar
        const barHeight = 10; // Adjust the height of the progress bar
        const barX = player.x + barWidth / 2; // X coordinate of the progress bar
        const barY = player.y; // Y coordinate of the progress bar, adjust as needed

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
      }

      drawWaitingForPlayer(ctx, x, y) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Waiting for opponent...`, x, y);
      }

      drawPlayers(ctx) {
        // Current player is always at the bottom
        const currentPlayer = this.players[0];

        // Draw current player
        currentPlayer.x = this.centerX;
        currentPlayer.y = this.height - 30;

        // ripple effect & timer on current player turn
        if (currentPlayer.uuid === roomDataCopy?.turn) {
          this.drawRipple(ctx, currentPlayer.x, currentPlayer.y);

          // players turn last
          this.drawTimer(currentPlayer);
        }

        currentPlayer.draw(ctx, currentPlayer.x, currentPlayer.y);

        if (currentPlayer.on) {
          this.drawKadi(ctx, currentPlayer.x, currentPlayer.y);
        }

        // Draw other players
        const player2 = this.players[1];

        player2.x = this.centerX;
        player2.y = 50;

        // ripple effect on current player turn
        if (player2.uuid === roomDataCopy?.turn) {
          this.drawRipple(ctx, player2.x, player2.y);

          // player turn timer
          this.drawTimer(player2);
        }

        if (members.includes(player2.uuid)) {
          player2.draw(ctx, player2.x, player2.y);
        } else {
          this.drawWaitingText(ctx, player2.username, player2.x, player2.y);
        }

        // if current player is on
        if (player2.on) {
          this.drawKadi(ctx, player2.x, player2.y);
        }
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
          let _card = new Card(
            cardImg,
            this.centerX + index * 10,
            this.centerY - this.cardHeight * 0.5,
            this.cardWidth,
            this.cardHeight
          );
          _card.draw(ctx);
        });
      }

      playCard() {
        const currentPlayer = this.players[0];

        const playerIndex = this.players.indexOf(currentPlayer);

        let playerDeck = this.players[playerIndex].playerDeck;

        if (playerDeck.length > 0) {
          let card = playerDeck[playerDeck.length - 1];

          card.isMoving = true;
        } else {
          console.log("no card available");
          return;
        }
      }

      _drawCard() {
        const card = this.drawPile[this.drawPile.length - 1];

        card.isMoving = true;
      }

      render(ctx, deltaTime) {
        this.drawDrawPile(ctx);

        // animate drawpile
        this.drawDiscardPile(ctx);

        this.drawPlayers(ctx);
      }
    }

    const roomPlayers = roomDataCopy?.players.map((player) => {
      return new Player(
        player.userId,
        player.username,
        player.profilePicture,
        player.numCards,
        player.on
      );
    });

    const game = new Game(
      canvas.width,
      canvas.height,
      roomDataCopy?.gameStatus,
      roomPlayers,
      roomDataCopy?.drawPileLength,
      roomDataCopy?.discardPile
    );

    gameRef.current = game;

    game.populateDrawPile();

    game.populatePlayerDecks();

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

      if (roomDataCopy?.turn) {
        // get current player

        const currentPlayer = game.players.find(
          (player) => player.uuid === roomDataCopy?.turn
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
              // const playerIndex = index % game.players.length;

              // game.players[playerIndex].playerDeck.push(
              //   new Card(
              //     backCard,
              //     game.players[playerIndex].x - index * 1.1,
              //     game.players[playerIndex].y + 30,
              //     game.cardWidth,
              //     game.cardHeight
              //   )
              // );

              // remove from drawpile
              game.drawPile.splice(index, 1);
            }
          }
        });
      }

      // animate player deck
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
      });

      // Update player timers
      game.players.forEach((player) => {
        player.updateTimer(deltaTime);
      });

      // console.log("### THE DISCARD PILE");
      // console.log(game.discardPile);
    }

    animate(0);

    console.log("hello world");

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [counter]);
  // }, [roomDataCopy]);

  return (
    <>
      <div
        className="flex justify-center"
        style={{
          width: "100%", // Set width to 100% to fill the parent container
          maxWidth: "800px", // Set maximum width to 600px
          height: "500px",
          // width: "300px",
          // height: "400px",
          // backgroundColor: "brown",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            borderRadius: "10px",
            backgroundImage:
              "url('https://img.freepik.com/premium-photo/green-poker-table-background_87414-3611.jpg')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      </div>

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
            setCounter(counter + 1);
            console.log(game);
          }}
        >
          RESET
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

export default DemoCardGameAnimation;
