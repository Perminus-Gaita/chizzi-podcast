"use client";
import React, { useEffect, useState } from "react";

const TutorialGameDirection = ({ direction, isKickback, isMobile = false }) => {
  const [dots, setDots] = useState([0, 120, 240]);

  const gameDirection = direction === 1 && "clockwise";

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) =>
        prev.map(
          (angle) => (angle + (gameDirection === "clockwise" ? 5 : -5)) % 360
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [direction]);

  const calculatePosition = (angle) => {
    const radius = isMobile ? 85 : 100;
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Base Ring */}
      <div
        className={`absolute inset-0 rounded-xl border-2 transition-colors duration-300
        ${isKickback ? "border-orange-500/20" : "border-emerald-500/20"}`}
      />

      {/* Moving Dots */}
      {dots.map((angle, i) => {
        const pos = calculatePosition(angle);
        return (
          <div
            key={i}
            className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-full
              transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-300
              ${isKickback ? "bg-orange-500" : "bg-emerald-500"}`}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              opacity: 0.8 - i * 0.2,
            }}
          />
        );
      })}
    </div>
  );
};

export default TutorialGameDirection;
