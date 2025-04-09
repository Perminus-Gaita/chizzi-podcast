"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Socials from "./z-components/client-socials";
import FantasyLeaderboard from "./z-components/leaderboard"; // Import the new component
import Link from 'next/link';

export default function Index() {
  const [isWobbling, setIsWobbling] = useState(false);

  const wobbleAnimation = {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.6 },
  };

  const handleWobble = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 600);
  };

  return (
    <>
      {/* Header section with image behind text */}
      <div className="container max-w-3xl mx-auto p-4 relative">
        <div className="relative flex items-center justify-center min-h-[150px]">
          {/* Background image that wobbles on click */}
          <motion.div
            className="absolute z-0"
            animate={isWobbling ? wobbleAnimation : {}}
            onClick={handleWobble}
          >
            <img
              src="/your-logo-here.png"
              alt="your-logo-here"
              className="w-48 opacity-70 cursor-pointer"
            />
          </motion.div>
          
          {/* Text overlay */}
          <div className="text-center relative z-10">
            <h1 className="text-5xl font-bold mb-2 text-gray-800 dark:text-white drop-shadow-md">Your brand name here</h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 drop-shadow-sm">Your cool tag-line.</p>
          </div>
        </div>
      </div>

      {/* Centered leaderboard using the new component */}
      <div className="my-12 relative">
        <FantasyLeaderboard />
      </div>

      {/* Updated subscriber section to match Swift Podcast style */}
      <div className="subscribers">
        <style jsx global>{`
          .subscribers {
            margin: 40px 0;
            text-align: center;
          }
          .sub-count {
            font-size: 24px;
            margin-bottom: 15px;
          }
          .sub-target {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            max-width: 500px;
          }
          .progress-bar {
            flex-grow: 1;
            height: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            margin: 0 15px;
          }
          .progress {
            height: 100%;
            background-color: #333;
            border-radius: 5px;
          }
        `}</style>
        
        <p className="sub-count">
          <Link
            href="/login" 
            style={{ 
              textDecoration: 'underline', 
              cursor: 'pointer',
              display: 'inline-block',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Join <strong>11,867</strong> members.
          </Link>
        </p>
        <div className="sub-target">
          <span>0</span>
          <div className="progress-bar">
            <div className="progress" style={{ width: '60%' }}></div>
          </div>
          <span>20,000</span>
        </div>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>Road to 20,000 members!</p>
      </div>

      <Socials />
    </>
  );
}