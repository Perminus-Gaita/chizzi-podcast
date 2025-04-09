"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, useScroll, useTransform, useAnimate } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export const HeroSection = () => {
  const userProfile = useSelector((state) => state.auth.profile);

  const [scope, animate] = useAnimate();

  const { scrollY } = useScroll();
  const statsOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const statsY = useTransform(scrollY, [0, 100], [0, -50]);

  // Stagger animation for stats
  const statsAnimationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + index * 0.2,
        duration: 0.5,
      },
    }),
  };

  const stats = [
    // { value: "10K+", label: "Active Players" },
    // { value: "$10K+", label: "Total Prizes" },
  ];

  useEffect(() => {
    animate(scope.current, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 });
  }, []);

  return (
    <div
      className="flex flex-col justify-center items-center gap-6 
      sm:gap-8 relative min-h-screen px-4"
    >
      {/* Animated Stats */}
      <motion.div
        style={{ opacity: statsOpacity, y: statsY }}
        className="absolute top-20 sm:top-10 md:top-20 w-full max-w-lg mx-auto"
      >
        <div className="flex justify-center gap-4 sm:gap-8 text-center text-white/80">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex flex-col"
              variants={statsAnimationVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <motion.span
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text"
                whileInView={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {stat.value}
              </motion.span>
              <span className="text-xs sm:text-sm">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Hero Content */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 sm:space-y-6 max-w-4xl pt-16 sm:pt-0"
      >
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
          Organize, manage and play <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
            Kadi esports tournaments and games.
          </span>
        </h1>
        <h2 className="text-base sm:text-lg md:text-xl text-[#9f9f9f] max-w-2xl mx-auto leading-relaxed px-4">
          Your all-in-one Kadi esports platform: Create tournaments, handle
          payments and sponsorships, manage brackets and players, and play
          official matches online.
        </h2>
      </motion.div> */}

      <div
        ref={scope}
        className="text-center space-y-4 sm:space-y-6 max-w-4xl pt-16 sm:pt-0"
      >
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
          Organize, manage and play
          <br className="hidden md:block" />
          <span className="inline-block bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
            Kadi esports tournaments and games.
          </span>
        </h1>

        <h2 className="text-base sm:text-lg md:text-xl text-[#9f9f9f] max-w-2xl mx-auto leading-relaxed px-4">
          Your all-in-one Kadi esports platform: Create tournaments, handle
          payments and sponsorships, manage brackets and players, and play
          official matches online.
        </h2>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-4">
        {/* {userProfile ? ( */}
        <Link href="/arena" className="w-full sm:w-auto">
          <button
            className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-3.5 bg-white/10 hover:bg-white/15 
              backdrop-blur-lg border border-white/10 rounded-xl
              text-white font-semibold text-base sm:text-lg transition-all duration-300
              hover:scale-105 hover:shadow-xl shadow-md"
          >
            <span className="flex items-center justify-center gap-2 group-hover:gap-4 transition-all duration-300">
              Enter Arena
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl -z-10" />
          </button>
        </Link>
        {/* ) : (
          <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 
                rounded-xl text-white font-semibold text-base sm:text-lg transition-all duration-300
                hover:scale-105 hover:shadow-xl shadow-md"
              >
                <span className="flex items-center justify-center gap-2 group-hover:gap-4 transition-all duration-300">
                  Play For Free
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-xl blur-xl -z-10" />
              </button>
            </Link>
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-white/60 text-xs sm:text-sm px-4">
              <span className="flex items-center gap-1">
                <Check className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" /> Free
                to play
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" /> No
                credit card
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />{" "}
                Instant access
              </span>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export const BottomCTA = () => {
  const userProfile = useSelector((state) => state.auth.profile);

  const buttonVariants = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="mt-20 text-center"
    >
      <Link href={userProfile?.uuid ? "/arena" : "/arena"}>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold 
            py-4 px-8 rounded-lg text-lg transition-colors 
            shadow-[0_0_15px_rgba(99,102,241,0.5)]
            hover:shadow-[0_0_30px_rgba(99,102,241,0.8)]"
        >
          {userProfile?.uuid ? "Enter Arena" : "Start Playing Now"}
        </motion.button>
      </Link>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { delay: 0.3, duration: 0.5 },
        }}
        className="text-[#9f9f9f] mt-4"
      >
        Join tournaments, compete, and win prizes today
      </motion.p>
    </motion.div>
  );
};
