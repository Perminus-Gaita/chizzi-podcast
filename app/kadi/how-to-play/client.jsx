"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoonIcon,
  SunIcon,
  PlayCircle,
  Users,
  Crown,
  Sparkles,
  Loader2,
  Gamepad,
  ArrowRight,
  BringToFront,
} from "lucide-react";
import { useGame } from "@/hooks/useGame";
import BlogPageHeader from "@/components/Navigation/BlogPageHeader";

const HowToPlayKadi = () => {
  const { loading, handleQuickMatch } = useGame();

  return (
    <>
      <BlogPageHeader />

      <main
        className="min-h-screen bg-gradient-to-b from-background
       to-muted dark:from-slate-950 dark:to-slate-900 px-2 py-20"
      >
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <nav className="text-sm mb-4">
            <ol className="list-none p-0 flex text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link> 
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-primary">How To Play</li>
            </ol>
          </nav>
        </div>

        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                How to Play Kadi
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                A fast-paced card game for 2-5 players. Simple to learn, fun to
                master!
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="py-12 px-2 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <PlayCircle className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Get Started</h3>
                  <p className="text-muted-foreground">
                    Each player gets 4 cards. Place one card face-up to start
                    the game.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <BringToFront className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Match Cards</h3>
                  <p className="text-muted-foreground">
                    Play cards matching the suit or rank on top. Special cards
                    have unique powers!
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Take Action</h3>
                  <p className="text-muted-foreground">
                    Use special cards to skip players, reverse direction, or
                    make others draw cards!
                  </p>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Crown className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Win the Game</h3>
                  <p className="text-muted-foreground">
                    Say &quot;Niko Kadi&quot; when you&apos;re about to win,
                    then play all your cards in one move!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Special Cards Section */}
        <section className="py-12 px-2 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Special Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Question Cards",
                  description:
                    "Queens (Q) and Eights (8) - Must be played with matching answer cards",
                  icon: <Sparkles className="w-8 h-8" />,
                  color: "text-pink-500",
                },
                {
                  title: "Jump Cards",
                  description: "Jacks (J) - Skip the next player's turn",
                  icon: <PlayCircle className="w-8 h-8" />,
                  color: "text-blue-500",
                },
                {
                  title: "Kickback Cards",
                  description: "Kings (K) - Reverse the game direction",
                  icon: <Crown className="w-8 h-8" />,
                  color: "text-purple-500",
                },
              ].map((card, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <div className={`mb-4 ${card.color}`}>{card.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                    <p className="text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-2 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Tips</h2>
            <div className="space-y-6">
              {[
                {
                  question: "What makes a winning move?",
                  answer:
                    "Play all your Answer Cards or Question Cards with matching answers in one move.",
                },
                {
                  question: "When should I say 'Niko Kadi'?",
                  answer:
                    "Say it in the round before you plan to win. If you don't, you can't win!",
                },
                {
                  question: "What if I can't play?",
                  answer:
                    "Draw a card from the pile. If you still can't play, your turn ends.",
                },
              ].map((faq, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready for a Match?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create a room or join an existing one to start playing Kadi with
              friends!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleQuickMatch}
                disabled={loading}
                className={`group w-full sm:w-48 h-12 flex items-center justify-center gap-2
                px-4 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg
                border border-indigo-500/30 hover:border-indigo-500/50
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Gamepad className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm sm:text-base text-indigo-400 group-hover:text-indigo-300 whitespace-nowrap">
                      Quick Match
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <Link href="/arena">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-48 h-12 hover:bg-secondary"
                >
                  Join Room
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No downloads needed - play instantly in your browser!
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default HowToPlayKadi;
