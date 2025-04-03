import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { useIsMobile } from "@/hooks/useIsMobile";

import "../../styles/cards.css";

const CardGameAnimation = ({
  containerRef,
  gameRef,
  roomDataCopy,
  members,
  counter,
  setCounter,
  reaction,
  isSmallScreen,
  setCurrentGame,
  timerData,
  timerState,
  playerObj,
  handleCardClick,
  handleOpenSuitModal,
  customCardSkinImage,
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isMobile = useIsMobile();

  const [backColor] = useState(
    ["red", "green", "blue"][Math.floor(Math.random() * 3)]
  );

  const userProfile = useSelector((state) => state.auth.profile);

  const backCard = new Image();
  // backCard.src = `/cards/back${backColor}.png`;
  backCard.src =
    roomDataCopy[0]?.tournamentDetails?.customCardSkinImage ||
    `/cards/back${backColor}.png`;
  // backCard.src = `/cards/pokerback.png`;

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
        maxPlayers,
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
        this.elapsedTime = 30; // Initial time in seconds
        this.maxTime = 30; // Maximum time in seconds
        this.playerDeck = [];

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

        this.maxPlayers = maxPlayers;
      }

      draw(ctx, x, y) {
        // draw ripple
        if (this.uuid === roomDataCopy[0]?.turn && !roomDataCopy[0]?.timer) {
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

        // draw timer ring current player turn
        if (
          this.uuid === roomDataCopy[0]?.turn &&
          roomDataCopy[0]?.timer &&
          timerState.startTime
        ) {
          const radius = this.outerCircleRadius + 5; // Slightly larger than avatar
          // const timePercent = this.elapsedTime / 30; // Assuming 30 second timer

          const elapsed = (Date.now() - timerState.startTime) / 1000;
          const timePercent = Math.max(0, (30 - elapsed) / 30);

          // Calculate color based on remaining time
          let color;
          if (timePercent > 0.6) {
            color = "#4CAF50"; // Green
          } else if (timePercent > 0.3) {
            color = "#FFC107"; // Yellow
          } else {
            color = "#F44336"; // Red
          }

          // Draw timer ring
          ctx.beginPath();
          ctx.arc(
            x,
            y,
            radius,
            -Math.PI / 2,
            timePercent * 2 * Math.PI - Math.PI / 2
          );
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.stroke();

          // Draw background ring
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.stroke();
        }

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

          let isLeftSide = false;
          let isRightSide = false;

          if (this.maxPlayers === 3) {
            isLeftSide = this.playerIndex === 1;
            isRightSide = this.playerIndex === 2;
          }

          if (this.maxPlayers === 4) {
            isLeftSide = this.playerIndex === 1;
            isRightSide = this.playerIndex === 3;
          }

          let isTopPlayer = this.playerIndex === 2;

          // Add vertical offset for side players
          const sidePlayerOffset = isLeftSide || isRightSide ? -40 : 0;

          // Revised bubble positioning
          const bubbleX = isLeftSide
            ? x + radius * 0.5 + arrowWidth // Right of left player
            : isRightSide
            ? x - radius * 0.5 - arrowWidth - bubbleWidth // Left of right player
            : x + radius * 0.5 + arrowWidth; // Default (top player)

          const bubbleY = y - bubbleHeight / 2 + sidePlayerOffset;

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

          // Draw arrow with corrected positioning
          ctx.beginPath();
          if (isLeftSide) {
            // Left player - arrow points left from bubble
            ctx.moveTo(bubbleX, y + sidePlayerOffset);
            ctx.lineTo(
              x + radius * 0.5,
              y - arrowHeight / 2 + sidePlayerOffset
            );
            ctx.lineTo(
              x + radius * 0.5,
              y + arrowHeight / 2 + sidePlayerOffset
            );
          } else if (isRightSide) {
            // Right player - arrow points right from bubble
            ctx.moveTo(bubbleX + bubbleWidth, y + sidePlayerOffset);
            ctx.lineTo(
              x - radius * 0.5,
              y - arrowHeight / 2 + sidePlayerOffset
            );
            ctx.lineTo(
              x - radius * 0.5,
              y + arrowHeight / 2 + sidePlayerOffset
            );
          } else {
            // Top player - keep original positioning
            ctx.moveTo(x + radius, y + sidePlayerOffset);
            ctx.lineTo(
              x + radius * 0.5,
              y - arrowHeight / 2 + sidePlayerOffset
            );
            ctx.lineTo(bubbleX, y + arrowHeight / 2 + sidePlayerOffset);
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
        const usernameOffset = this.outerCircleRadius + 5;
        const backgroundX = this.x - backgroundWidth / 2;
        const backgroundY = this.y + usernameOffset;

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
        ctx.fillStyle =
          this.uuid === roomDataCopy[0]?.turn ? "#78d64b" : "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayName, this.x, backgroundY + backgroundHeight / 2);

        ctx.restore();
      }

      getCardCountPosition(player) {
        const padding = 10; // Padding from avatar edge
        const radius = 15; // Size of counter circle

        const totalPlayers = this.maxPlayers;

        if (totalPlayers === 4) {
          // 4-player configuration
          switch (player.playerIndex) {
            case 1: // Left opponent
              return {
                x: player.x + this.outerCircleRadius + radius + padding,
                y: player.y - radius,
              };
            case 2: // Top opponent
              return {
                x: player.x + this.outerCircleRadius + radius + padding,
                y: player.y,
              };
            case 3: // Right opponent
              return {
                x: player.x - (this.outerCircleRadius + radius + padding),
                y: player.y - radius,
              };
            default:
              return { x: player.x, y: player.y };
          }
        } else if (totalPlayers === 3) {
          // 3-player configuration
          switch (player.playerIndex) {
            case 1: // Left opponent
              return {
                x: player.x + this.outerCircleRadius + radius + padding,
                y: player.y - radius,
              };
            case 2: // Right opponent
              return {
                x: player.x - (this.outerCircleRadius + radius + padding),
                y: player.y - radius,
              };
            default:
              return { x: player.x, y: player.y };
          }
        } else if (totalPlayers === 2) {
          // 3-player configuration
          switch (player.playerIndex) {
            case 1: // Top opponent
              return {
                x: player.x + this.outerCircleRadius + radius + padding,
                y: player.y - radius,
              };

            default:
              return { x: player.x, y: player.y };
          }
        }

        // Default fallback
        return { x: player.x, y: player.y };
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
        // Reset timer if game not active
        if (
          !timerData ||
          this.uuid !== roomDataCopy[0]?.turn ||
          roomDataCopy[0]?.gameStatus !== "active"
        ) {
          this.elapsedTime = 30;
          return;
        }

        const elapsed = (Date.now() - timerData.startTime) / 1000;
        this.elapsedTime = Math.max(0, 30 - elapsed);
      }
    }

    class Card {
      constructor(
        cardImg,
        x,
        y,
        width,
        height,
        canvasWidth,
        canvasHeight,
        angle = 0,
        isVisible = true
      ) {
        this.cardImg = cardImg;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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

        this.glowIntensity = 0;
        this.scaleFactor = 1;
        this.rotationEffect = 0;
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
        if (this.glowIntensity > 0) {
          ctx.shadowColor = "rgba(255,215,0,0.5)";
          ctx.shadowBlur = 20 * this.glowIntensity;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // ctx.save();
          // ctx.scale(this.scaleFactor, this.scaleFactor);
        }

        const scaledWidth = this.width * this.scaleFactor;
        const scaledHeight = this.height * this.scaleFactor;
        const offsetX = (scaledWidth - this.width) / 2;
        const offsetY = (scaledHeight - this.height) / 2;

        // // Add scale effect
        // ctx.save();
        // ctx.scale(this.scaleFactor, this.scaleFactor);

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
        // ctx.drawImage(this.cardImg, innerX, innerY, innerWidth, innerHeight);

        ctx.drawImage(
          this.cardImg,
          -scaledWidth / 2, // Adjust x to maintain center point
          -scaledHeight / 2, // Adjust y to maintain center point
          scaledWidth, // Scale width
          scaledHeight // Scale height
        );

        ctx.restore();

        ctx.shadowBlur = 0; // Reset shadow
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
          // if (Math.abs(dx) < this.width / 2 && Math.abs(dy) < this.height / 2) {
          if (distance < 1) {
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

      // activateSpecialEffect() {
      //   this.glowIntensity = 1;
      //   this.rotationEffect = Math.PI / 4;
      //   this.scaleFactor = 1.2;
      //   this.x = this.x + 40;
      //   this.y = this.y + 20;

      //   // Animate back to normal
      //   setTimeout(() => {
      //     this.glowIntensity = 0;
      //     this.scaleFactor = 1;
      //     this.rotationEffect = 0;
      //   }, 500);
      // }

      startPlayAnimation(targetX, targetY) {
        this.isMoving = true;
        this.startPos = { x: this.x, y: this.y };
        this.endPos = { x: targetX, y: targetY };
        this.startTime = performance.now();
        this.animationDuration = 600; // ms
        this.animationPhase = "lift"; // lift -> move -> land

        // Initial lift effect
        this.scaleFactor = 1.5;
        this.glowIntensity = 0.8;

        // Calculate control point for arc
        const midX = (this.startPos.x + targetX) / 2;
        const midY = Math.min(this.startPos.y, targetY) - 100; // Arc height
        this.controlPoint = { x: midX, y: midY };
      }

      updatePlayAnimation(currentTime) {
        if (!this.isMoving) return;

        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        // Bezier curve calculation for smooth arc
        const t = this.easeInOutCubic(progress);
        const invT = 1 - t;

        // Quadratic bezier for position
        this.x =
          invT * invT * this.startPos.x +
          2 * invT * t * this.controlPoint.x +
          t * t * this.endPos.x;

        this.y =
          invT * invT * this.startPos.y +
          2 * invT * t * this.controlPoint.y +
          t * t * this.endPos.y;

        // Rotation during flight
        this.angle = this.startRotation + progress * Math.PI * 2;

        // Scale and glow effects
        if (progress < 0.3) {
          // Lift phase
          this.scaleFactor = 1 + 0.1 * (progress / 0.3);
          this.glowIntensity = progress / 0.3;
        } else if (progress > 0.7) {
          // Landing phase
          this.scaleFactor = 1.1 - 0.1 * ((progress - 0.7) / 0.3);
          this.glowIntensity = 1 - (progress - 0.7) / 0.3;
        }

        if (progress >= 1) {
          this.isMoving = false;
          this.scaleFactor = 1;
          this.glowIntensity = 0;
        }
      }

      easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
    }

    class CardCountIndicator {
      constructor(x, y, count, isPenalty = false) {
        this.x = x;
        this.y = y;
        this.count = count;
        this.radius = 15;
        this.originalRadius = 15;

        // Animation properties
        this.animationStartTime = null;
        this.animationDuration = 600;
        this.isPenalty = isPenalty;
        this.isAnimating = false;
        this.alpha = 1;

        // Penalty-specific properties
        this.shakeAmplitude = 0;
        this.shakePhase = 0;
        this.flashIntensity = 0;

        this.shakeOffset = { x: 0, y: 0 };
        this.shakeDecay = 0.9;
      }

      startAnimation(newCount, isPenalty = false) {
        this.isAnimating = true;
        this.animationStartTime = performance.now();
        this.isPenalty = isPenalty;
        this.previousCount = this.count;
        this.count = newCount;

        if (isPenalty) {
          this.shakeAmount = 5;
          this.isShaking = true;
        }
      }

      update(currentTime) {
        if (!this.isAnimating) return;

        const elapsed = currentTime - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        if (this.isShaking) {
          this.shakeOffset.x = (Math.random() - 0.5) * this.shakeAmount;
          this.shakeOffset.y = (Math.random() - 0.5) * this.shakeAmount;
          this.shakeAmount *= this.shakeDecay;

          if (this.shakeAmount < 0.1) {
            this.isShaking = false;
            this.shakeOffset = { x: 0, y: 0 };
          }
        }

        if (this.isPenalty) {
          // Penalty animation
          this.shakeAmplitude *= 1 - progress;
          this.shakePhase = currentTime * 0.01;
          this.flashIntensity *= 1 - progress;
          this.radius = this.originalRadius + Math.sin(progress * Math.PI) * 5;
        } else {
          // Normal draw animation
          this.radius = this.originalRadius + Math.sin(progress * Math.PI) * 3;
        }

        if (progress >= 1) {
          this.isAnimating = false;
          this.radius = this.originalRadius;
          this.shakeAmplitude = 0;
          this.flashIntensity = 0;
        }
      }

      draw(ctx) {
        ctx.save();

        // Apply shake effect for penalties
        const shakeOffsetX = this.shakeAmplitude * Math.sin(this.shakePhase);
        const shakeOffsetY = this.shakeAmplitude * Math.cos(this.shakePhase);

        const drawX = this.x + this.shakeOffset.x;
        const drawY = this.y + this.shakeOffset.y;

        ctx.beginPath();
        ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fill();

        // Draw count text with offset position
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.count.toString(), drawX, drawY);

        ctx.restore();

        // Draw flash effect for penalties
        if (this.flashIntensity > 0) {
          ctx.beginPath();
          ctx.arc(
            this.x + shakeOffsetX,
            this.y + shakeOffsetY,
            this.radius + 5,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(255, 0, 0, ${this.flashIntensity * 0.3})`;
          ctx.fill();
        }

        // Draw main counter circle
        ctx.beginPath();
        ctx.arc(
          this.x + shakeOffsetX,
          this.y + shakeOffsetY,
          this.radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fill();

        // Draw count text
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          this.count.toString(),
          this.x + shakeOffsetX,
          this.y + shakeOffsetY
        );

        ctx.restore();
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
        discardPile,
        isPenalty,
        handleOpenSuitModal,
        handleCardClick,
        customCardSkinImage = null
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

        this.cardWidth = isSmallScreen ? Math.min(width * 0.15, 5) : 60;
        this.cardHeight = isSmallScreen ? Math.min(height * 0.12, 30) : 90;

        this.cards = [];
        this.drawPileCount = drawPileCount; // Number of cards in the pile
        this.drawPile = []; // Array to hold the pile of cards
        this.discardPileCards = [];
        this.discardPile = discardPile;

        this.isPenalty = isPenalty;
        this.handleOpenSuitModal = handleOpenSuitModal;
        this.handleCardClick = handleCardClick;

        this.customCardSkinImage = customCardSkinImage;

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
          case 3: // 4 players total
            // Left player
            otherPlayers[0].x = 40; // Left padding
            otherPlayers[0].y = this.height * 0.3;

            // Top player
            otherPlayers[1].x = this.centerX;
            otherPlayers[1].y = 40; // Top padding

            // Right player
            otherPlayers[2].x = this.width - 40; // Right padding
            otherPlayers[2].y = this.height * 0.3;
            break;

          case 2: // 3 players total
            // Left player
            otherPlayers[0].x = 40;
            otherPlayers[0].y = this.height * 0.25;

            // Right player
            otherPlayers[1].x = this.width - 40;
            otherPlayers[1].y = this.height * 0.25;
            break;

          case 1: // 2 players total
            // Top player
            otherPlayers[0].x = this.centerX;
            otherPlayers[0].y = 40;
            break;
        }
      }

      initialize() {
        this.setPlayerPositions();

        if (this.players.length === 2) {
          this.populatePlayerDecksTwoPlayers();
        } else if (this.players.length === 3) {
          this.populatePlayerDecksThreePlayers();
        } else if (this.players.length === 4) {
          this.populatePlayerDecksFourPlayers();
        }
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
        const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
        const baseCardHeight = isMobile ? 105 : 112;

        // Create new card from center
        const card = new Card(
          backCard,
          this.centerX,
          this.centerY,
          baseCardWidth,
          baseCardHeight,
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

      calculateOverlap = (numCards) => {
        const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions

        if (numCards <= 10) {
          return baseCardWidth * 0.7; // 60% overlap for small hands
        } else if (numCards <= 15) {
          return baseCardWidth * 0.75; // 75% overlap for medium hands
        } else {
          return baseCardWidth * 0.85; // 85% overlap for large hands
        }
      };

      calculateArcOffset = (index, total) => {
        if (total <= 12) return 0;
        const normalizedPosition = (index / (total - 1)) * 2 - 1;
        const maxArcHeight = isMobile ? -4 : -5;
        return -Math.pow(normalizedPosition * 2, 2) * maxArcHeight;
      };

      populatePlayerDecksTwoPlayers() {
        const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
        const baseCardHeight = isMobile ? 105 : 112;

        this.players.forEach((player) => {
          const isSmallScreen = this.width < 768;
          // Calculate stack dimensions
          const maxVisibleCards = 7; // Maximum number of visible card edges in stack
          const stackSpacing = 4; // Pixels between each visible card edge

          // NEW CODE
          let angle = 0;

          // Calculate deck width exactly like HTML
          const cardOverlap =
            player.numCards > 1 ? this.calculateOverlap(player.numCards) : 0;
          const deckWidth = Math.min(
            (player.numCards - 1) * (baseCardWidth - cardOverlap) +
              baseCardWidth,
            this.width * (isMobile ? 0.95 : 0.8)
          );

          let startX, startY;

          if (player.uuid === userProfile?.uuid) {
            startX = this.centerX - deckWidth / 2 + baseCardWidth / 2; // Add half card width to align with HTML

            // startY = player.y - baseCardHeight * 0.3;
            startY = this.height - baseCardHeight; // Position from bottom like HTML
          } else {
            // Opponent's hand - compact stacking at top
            startX = player.x;
            startY = player.y + this.cardHeight * 0.3;
          }

          // Create cards for the player's deck
          for (let i = 0; i < player.numCards; i++) {
            let cardX, cardY, cardAngle;

            if (player.uuid === userProfile?.uuid) {
              const arcOffset = this.calculateArcOffset(i, player.numCards);
              const cardX = startX + i * (baseCardWidth - cardOverlap);
              const cardY = startY + arcOffset;

              player.playerDeck.push(
                new Card(
                  backCard,
                  cardX,
                  cardY,
                  baseCardWidth,
                  baseCardHeight,
                  this.width,
                  this.height,
                  0,
                  false
                  // player.uuid !== userProfile?.uuid
                )
              );
            } else {
              // Opponent - stack cards with slight offset
              const visibleCardCount = Math.min(i, maxVisibleCards);
              const stackOffset = visibleCardCount * stackSpacing;

              const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
              const baseCardHeight = isMobile ? 105 : 112;

              startX = player.x;
              startY = player.y + this.cardHeight * 0.3;

              cardX = startX - this.cardWidth / 2 + stackOffset;
              cardY = startY;

              // Add slight random rotation for visual interest
              const randomAngle = (Math.random() - 0.5) * 0.02;
              cardAngle = angle + randomAngle;

              player.playerDeck.push(
                new Card(
                  backCard,
                  cardX,
                  cardY,
                  baseCardWidth,
                  baseCardHeight,
                  this.width,
                  this.height,
                  cardAngle,
                  true
                )
              );
            }
          }

          // Add card count indicator for opponent
          if (player.uuid !== userProfile?.uuid) {
            const countPosition = player.getCardCountPosition(player);
            this.addCardCountIndicator(player, countPosition);
          }
        });
      }

      populatePlayerDecksThreePlayers() {
        const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
        const baseCardHeight = isMobile ? 105 : 112;

        this.players.forEach((player) => {
          // Calculate stack dimensions
          const maxVisibleCards = 7; // Maximum number of visible card edges in stack
          const stackSpacing = 4; // Pixels between each visible card edge

          let startX,
            startY,
            angle = 0;

          if (player.uuid === userProfile?.uuid) {
            const cardOverlap =
              player.numCards > 1 ? this.calculateOverlap(player.numCards) : 0;
            const deckWidth = Math.min(
              (player.numCards - 1) * (baseCardWidth - cardOverlap) +
                baseCardWidth,
              this.width * (isMobile ? 0.95 : 0.8)
            );

            startX = this.centerX - deckWidth / 2 + baseCardWidth / 2;
            startY = this.height - baseCardHeight;
          } else {
            // Opponent hands - compact stacking
            switch (player.playerIndex) {
              case 1: // Left opponent
                startX = player.x - this.cardHeight * 0.3;
                startY =
                  player.y -
                  (isMobile ? this.cardHeight * 0.5 : this.cardHeight);
                angle = Math.PI / 2;
                break;
              case 2: // Right opponent
                startX = player.x + this.cardHeight * 0.3;
                startY =
                  player.y -
                  (isMobile ? this.cardHeight * 0.5 : this.cardHeight);
                angle = Math.PI / 2;
                break;
            }
          }

          // Create cards for the player's deck
          for (let i = 0; i < player.numCards; i++) {
            let cardX, cardY, cardAngle;

            if (player.uuid === userProfile?.uuid) {
              // Current player
              const arcOffset = this.calculateArcOffset(i, player.numCards);
              const cardOverlap =
                player.numCards > 1
                  ? this.calculateOverlap(player.numCards)
                  : 0;
              const cardX = startX + i * (baseCardWidth - cardOverlap);
              const cardY = startY + arcOffset;

              player.playerDeck.push(
                new Card(
                  backCard,
                  cardX,
                  cardY,
                  baseCardWidth,
                  baseCardHeight,
                  this.width,
                  this.height,
                  0,
                  false
                  // player.uuid !== userProfile?.uuid
                )
              );
            } else {
              // Opponents - stack cards with slight offset
              const visibleCardCount = Math.min(i, maxVisibleCards);
              const stackOffset = visibleCardCount * stackSpacing;

              const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
              const baseCardHeight = isMobile ? 105 : 112;

              switch (player.playerIndex) {
                case 1: // Left opponent
                  cardX = startX;
                  cardY = startY + stackOffset;
                  break;
                case 2: // Right opponent
                  cardX = startX;
                  cardY = startY + stackOffset;
                  break;
              }

              // Add slight random rotation for visual interest
              const randomAngle = (Math.random() - 0.5) * 0.02;
              cardAngle = angle + randomAngle;

              player.playerDeck.push(
                new Card(
                  backCard,
                  cardX,
                  cardY,
                  baseCardWidth,
                  baseCardHeight,
                  this.width,
                  this.height,
                  cardAngle,
                  true
                )
              );
            }
          }

          // Add card count indicator for opponents
          if (player.uuid !== userProfile?.uuid) {
            const countPosition = player.getCardCountPosition(player);
            this.addCardCountIndicator(player, countPosition);
          }
        });
      }

      populatePlayerDecksFourPlayers() {
        const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
        const baseCardHeight = isMobile ? 105 : 112;

        this.players.forEach((player) => {
          const maxVisibleCards = 7; // Maximum number of visible card edges in stack
          const stackSpacing = 4; // Pixels between each visible card edge

          let startX,
            startY,
            angle = 0;

          if (player.uuid === userProfile?.uuid) {
            // Current player's hand
            const cardOverlap =
              player.numCards > 1 ? this.calculateOverlap(player.numCards) : 0;
            const deckWidth = Math.min(
              (player.numCards - 1) * (baseCardWidth - cardOverlap) +
                baseCardWidth,
              this.width * (isMobile ? 0.95 : 0.8)
            );

            startX = this.centerX - deckWidth / 2 + baseCardWidth / 2;
            startY = this.height - baseCardHeight;
          } else {
            // Opponent hands - compact stacking
            switch (player.playerIndex) {
              case 1: // Left opponent
                startX = player.x - this.cardHeight * 0.3;
                startY = player.y;
                angle = Math.PI / 2;
                break;
              case 2: // top opponent
                startX = player.x;
                startY = player.y - this.cardHeight * 0.3;
                angle = 0;
                break;
              case 3: // right opponent
                startX = player.x + this.cardHeight * 0.3;
                startY = player.y;
                angle = Math.PI / 2;
                break;
            }
          }

          // Create cards for the player's deck
          for (let i = 0; i < player.numCards; i++) {
            let cardX, cardY, cardAngle;

            if (player.uuid === userProfile?.uuid) {
              // Current player - fan out cards
              const arcOffset = this.calculateArcOffset(i, player.numCards);
              const cardOverlap =
                player.numCards > 1
                  ? this.calculateOverlap(player.numCards)
                  : 0;
              const cardX = startX + i * (baseCardWidth - cardOverlap);
              const cardY = startY + arcOffset;

              player.playerDeck.push(
                new Card(
                  backCard,
                  cardX,
                  cardY,
                  baseCardWidth,
                  baseCardHeight,
                  this.width,
                  this.height,
                  0,
                  false
                  // player.uuid !== userProfile?.uuid
                )
              );
            } else {
              // Opponents - stack cards with slight offset
              const visibleCardCount = Math.min(i, maxVisibleCards);
              const stackOffset = visibleCardCount * stackSpacing;
              const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
              const baseCardHeight = isMobile ? 105 : 112;

              switch (player.playerIndex) {
                case 1: // Left opponent
                  cardX = startX;
                  cardY = startY + stackOffset;
                  break;
                case 2: // top opponent
                  cardX = startX + stackOffset; // Stack horizontally
                  cardY = startY;
                  break;
                case 3: // right opponent
                  cardX = startX; // Keep horizontal position constant
                  cardY = startY + stackOffset;
                  break;
              }

              // Add slight random rotation for visual interest
              const randomAngle = (Math.random() - 0.5) * 0.02;
              cardAngle = angle + randomAngle;

              player.playerDeck.push(
                new Card(
                  backCard,
                  cardX,
                  cardY,
                  baseCardWidth,
                  baseCardHeight,
                  this.width,
                  this.height,
                  cardAngle,
                  true
                )
              );
            }
          }

          // Add card count indicator for opponents
          if (player.uuid !== userProfile?.uuid) {
            const countPosition = player.getCardCountPosition(player);
            this.addCardCountIndicator(player, countPosition);
          }
        });
      }

      // New method to add card count indicators
      addCardCountIndicator(player, position) {
        player.cardCountIndicator = new CardCountIndicator(
          position.x,
          position.y,
          player.numCards
        );
      }

      updateCardCount(playerUuid, newCount, isPenalty = false) {
        // console.log("### RUNNING THIS >>>");
        // console.log(playerUuid, newCount, isPenalty);

        const player = this.players.find((p) => p.uuid === playerUuid);
        if (player?.cardCountIndicator) {
          if (isPenalty) {
            // Update with shake animation
            player.cardCountIndicator.startAnimation(newCount, true);
          } else {
            // Normal update
            player.cardCountIndicator.startAnimation(newCount, false);
          }
        }
      }

      initializeCardCounts() {
        this.players.forEach((player) => {
          const playerData = this.players.find((p) => p.userId === player.uuid);
          if (playerData && player.cardCountIndicator) {
            player.cardCountIndicator.count = playerData.numCards;
          }
        });
      }

      drawTimer(player) {
        // Draw progress bar background
        const barWidth = 60; // Adjust the width of the progress bar
        const barHeight = 10; // Adjust the height of the progress bar
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
        // ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, progressWidth, barHeight);
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

      playCard(playedCard) {
        const currentPlayer = this.players.find(
          (player) => player.uuid === this.turn
        );

        const playerIndex = this.players.indexOf(currentPlayer);

        // console.log("### CURRENT PLAYER INDEX ###");
        // console.log(playerIndex);

        let playerDeck = this.players[playerIndex].playerDeck;

        if (playerDeck.length > 0) {
          // For opponents, we need to ensure we're selecting a visible card
          let cardIndex = playerDeck.length - 1;

          // If this is an opponent, we should use their last visible card
          if (currentPlayer.uuid !== userProfile?.uuid) {
            // Use the last visible card (either the 7th or last card)
            cardIndex = Math.min(6, playerDeck.length - 1);
          }

          let card = playerDeck[playerDeck.length - 1];

          card.cardImg = new Image();
          card.cardImg.src = `/cards/${playedCard}.png`;

          card.cardImg.onload = () => {
            // card.activateSpecialEffect();

            card.startPlayAnimation(this.centerX, this.centerY);

            // console.log("### THE CARD ###");
            // console.log(card);

            card.isMoving = true;
          };
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

        const baseCardWidth = isMobile ? 75 : 80; // Match HTML dimensions
        const baseCardHeight = isMobile ? 105 : 112;

        const newCard = new Card(
          cardImg,
          this.centerX + this.cardWidth * 0.6,
          this.centerY,
          baseCardWidth,
          baseCardHeight,
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
            return anim.card.isMoving;

            // this.activeAnimations = [];
            // break;
          }
        }

        // Draw rest of game state
        this.renderToContext(this.bufferCtx, deltaTime);

        // Copy buffer to main canvas
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.drawImage(this.bufferCanvas, 0, 0);
      }

      renderToContext(ctx, deltaTime) {
        if (roomDataCopy[0]?.turn) {
          // get current player

          const currentPlayer = this.players.find(
            (player) => player.uuid === roomDataCopy[0]?.turn
          );
          const playerIndex = this.players.indexOf(currentPlayer);

          const playerX = this.players[playerIndex].x;
          const playerY = this.players[playerIndex].y;
        }

        // animate player and player deck
        this.players.forEach((player, playerIdx) => {
          // card counting animation
          if (player.cardCountIndicator) {
            player.cardCountIndicator.update(performance.now());
            player.cardCountIndicator.draw(ctx);
          }
          // end card counting animation

          if (player.uuid !== userProfile?.uuid) {
            // Draw stacked cards
            player.playerDeck.forEach((card, idx) => {
              if (
                idx < 7 ||
                idx === player.playerDeck.length - 1 ||
                card.isMoving
              ) {
                card.draw(ctx);

                if (card.isMoving) {
                  card.update(this.centerX, this.centerY);
                  card.updatePlayAnimation(performance.now());

                  if (!card.isMoving) {
                    setTimeout(() => {
                      this.players[playerIdx].playerDeck.splice(idx, 1);
                    }, 200);
                  }
                }
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
                card.updatePlayAnimation(performance.now());

                if (!card.isMoving) {
                  setTimeout(() => {
                    this.players[playerIdx].playerDeck.splice(cardIdx, 1);
                  }, 200);
                }
              }
            });
          }

          const currentPlayer = this.players.find(
            (player) => player.uuid === userProfile?.uuid
          );

          currentPlayer.draw(ctx, currentPlayer.x, currentPlayer.y);

          if (currentPlayer.on) {
            this.drawKadi(ctx, currentPlayer.x, currentPlayer.y);
          }

          // Draw other players
          const otherPlayers = this.players.filter(
            (player) => player.uuid !== userProfile?.uuid
          );

          switch (otherPlayers.length) {
            case 3: // 4 players
              if (
                roomDataCopy[0].maxPlayers === roomDataCopy[0].players.length
              ) {
                // PLAYER 1

                otherPlayers[0].draw(ctx, otherPlayers[0].x, otherPlayers[0].y);
                otherPlayers[0].drawUsername(
                  ctx,
                  otherPlayers[0].x,
                  otherPlayers[0].y
                );

                // if player 2 is on
                if (otherPlayers[0].on) {
                  this.drawKadi(ctx, otherPlayers[0].x, otherPlayers[0].y);
                }

                // PLAYER 2

                otherPlayers[1].draw(ctx, otherPlayers[1].x, otherPlayers[1].y);
                otherPlayers[1].drawUsername(
                  ctx,
                  otherPlayers[1].x,
                  otherPlayers[1].y
                );

                // if player 3 is on
                if (otherPlayers[1].on) {
                  this.drawKadi(ctx, otherPlayers[1].x, otherPlayers[1].y);
                }

                // PLAYER 3

                otherPlayers[2].draw(ctx, otherPlayers[2].x, otherPlayers[2].y);
                otherPlayers[2].drawUsername(
                  ctx,
                  otherPlayers[2].x,
                  otherPlayers[2].y
                );

                // if player 3 is on
                if (otherPlayers[2].on) {
                  this.drawKadi(ctx, otherPlayers[2].x, otherPlayers[2].y);
                }
              }
              break;
            case 2: // 3 players
              if (
                roomDataCopy[0].maxPlayers === roomDataCopy[0].players.length
              ) {
                otherPlayers[0].draw(ctx, otherPlayers[0].x, otherPlayers[0].y);

                otherPlayers[0].drawUsername(
                  ctx,
                  otherPlayers[0].x,
                  otherPlayers[0].y
                );

                // player 3 online
                otherPlayers[1].draw(ctx, otherPlayers[1].x, otherPlayers[1].y);

                otherPlayers[1].drawUsername(
                  ctx,
                  otherPlayers[1].x,
                  otherPlayers[1].y
                );

                // if player 2 is on
                if (otherPlayers[0].on) {
                  this.drawKadi(ctx, otherPlayers[0].x, otherPlayers[0].y);
                }

                // if player 3 is on
                if (otherPlayers[1].on) {
                  this.drawKadi(ctx, otherPlayers[1].x, otherPlayers[1].y);
                }
              }

              break;
            case 1:
              // room full
              if (
                roomDataCopy[0].maxPlayers === roomDataCopy[0].players.length
              ) {
                otherPlayers[0].draw(ctx, otherPlayers[0].x, otherPlayers[0].y);
                otherPlayers[0].drawUsername(
                  ctx,
                  otherPlayers[0].x,
                  otherPlayers[0].y
                );

                // if current player is on
                if (otherPlayers[0].on) {
                  this.drawKadi(ctx, otherPlayers[0].x, otherPlayers[0].y);
                }
              }
              break;
            default:
              break;
          }
        });

        // // Update player timers
        this.players.forEach((player) => {
          player.updateTimer(deltaTime);
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

    const currentPlayerUUID = userProfile?.uuid;
    const sortedPlayers = roomDataCopy[0]?.players.sort((a, b) => {
      if (a.userId === currentPlayerUUID) return -1;
      if (b.userId === currentPlayerUUID) return 1;
      return 0;
    });

    const generateDicebearUrl = (name) => {
      const backgroundColors = ["b6e3f4", "c0aede", "d1d4f9"];
      const params = new URLSearchParams({
        seed: name,
        backgroundColor: backgroundColors,
        backgroundType: ["solid", "gradientLinear"],
      });

      return `https://api.dicebear.com/6.x/initials/svg?seed=${params}`;
    };

    const roomPlayers = sortedPlayers.map((player, index) => {
      return new Player(
        player.userId,
        player.username,
        player?.profilePicture || generateDicebearUrl(player.username),
        player.numCards,
        player.on,
        index,
        roomDataCopy[0]?.maxPlayers,
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
      roomDataCopy[0]?.discardPile,
      roomDataCopy[0]?.isPenalty,
      handleOpenSuitModal,
      handleCardClick,
      roomDataCopy[0]?.tournamentDetails?.customCardSkinImage
    );

    gameRef.current = game;

    // console.log("hello world");
    game.initialize();
    game.startAnimation();

    return () => {
      game.stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [counter, roomDataCopy, reaction, gameRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}
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
