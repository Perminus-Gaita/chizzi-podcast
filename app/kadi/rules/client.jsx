"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

import {
  Crown,
  Users,
  BringToFront,
  AlertCircle,
  ArrowRight,
  Award,
  Share2,
} from "lucide-react";

import BlogPageHeader from "@/components/Navigation/BlogPageHeader";

const RulesPage = () => {
  return (
    <>
      <BlogPageHeader />

      <main
        className="min-h-screen bg-gradient-to-b from-background
       to-muted dark:from-slate-950 dark:to-slate-900 px-2 py-20"
      >
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
              <li className="text-primary">Kadi Rules</li>
            </ol>
          </nav>
        </div>

        <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent mb-4">
              Kadi Rules
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master the game with our comprehensive guide. Learn everything
              from basic moves to advanced strategies.
            </p>
          </div>
        </section>

        {/* Quick Overview Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-4">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Players</h3>
                      <p className="text-muted-foreground">2-5 players</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <BringToFront className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Deck</h3>
                      <p className="text-muted-foreground">
                        54 cards (with Jokers)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Crown className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Objective</h3>
                      <p className="text-muted-foreground">
                        Play all winning cards
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Rules Content */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="basics" className="space-y-10">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full gap-2 mb-2">
                <TabsTrigger className="text-xs sm:text-sm" value="basics">
                  Basics
                </TabsTrigger>
                <TabsTrigger className="text-xs sm:text-sm" value="cards">
                  Card Types
                </TabsTrigger>
                <TabsTrigger className="text-xs sm:text-sm" value="special">
                  Special Moves
                </TabsTrigger>
                <TabsTrigger className="text-xs sm:text-sm" value="winning">
                  Winning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basics">
                <Card>
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Setup</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                            <span>Each player gets 4 cards</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                            <span>Place one valid card face-up to start</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                            <span>Remaining cards form the draw pile</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Play</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                            <span>Match the suit or rank of the top card</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                            <span>Draw if you can&apos;t play</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                            <span>Play multiple cards of same rank</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cards">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          title: "Question Cards",
                          description:
                            "Queens (Q) and Eights (8) must be played with matching answer cards",
                          icon: <AlertCircle className="w-8 h-8" />,
                          color: "text-pink-500",
                        },
                        {
                          title: "Answer Cards",
                          description:
                            "4, 5, 6, 7, 9, 10, and Ace cards can answer Question Cards",
                          icon: <Award className="w-8 h-8" />,
                          color: "text-blue-500",
                        },
                        {
                          title: "Jump Cards",
                          description: "Jacks (J) skip the next player's turn",
                          icon: <Share2 className="w-8 h-8" />,
                          color: "text-green-500",
                        },
                        {
                          title: "Kickback Cards",
                          description: "Kings (K) reverse the game direction",
                          icon: <Crown className="w-8 h-8" />,
                          color: "text-purple-500",
                        },
                        {
                          title: "Penalty Cards",
                          description:
                            "2, 3, and Jokers make next player draw cards",
                          icon: <AlertCircle className="w-8 h-8" />,
                          color: "text-red-500",
                        },
                      ].map((card, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border bg-card/50"
                        >
                          <div className={`mb-4 ${card.color}`}>
                            {card.icon}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            {card.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {card.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="special">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="bg-card/50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">
                          Question Card Sequences
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Chain Queens (Q) and Eights (8) following these rules:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              Same Suit Connections
                            </h4>
                            <ul className="space-y-2">
                              <li>Queen → Eight (same suit only)</li>
                              <li>Eight → Queen (same suit only)</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">
                              Any Suit Connections
                            </h4>
                            <ul className="space-y-2">
                              <li>Queen → Queen (any suit)</li>
                              <li>Eight → Eight (any suit)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-card/50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">
                          Counter Moves
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              Against Penalties
                            </h4>
                            <ul className="space-y-2">
                              <li>Play matching penalty card</li>
                              <li>Play a Joker</li>
                              <li>Play an Ace</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">
                              Against Special Cards
                            </h4>
                            <ul className="space-y-2">
                              <li>Counter Jump with Jump</li>
                              <li>Counter Kickback with Kickback</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="winning">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="bg-card/50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">
                          How to Win
                        </h3>
                        <ol className="space-y-4">
                          <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              1
                            </span>
                            <div>
                              <p className="font-medium">
                                Say &quot;Niko Kadi&quot;
                              </p>
                              <p className="text-muted-foreground">
                                Announce this in the round before you plan to
                                win
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              2
                            </span>
                            <div>
                              <p className="font-medium">Play All Cards</p>
                              <p className="text-muted-foreground">
                                Must play all remaining cards in a single move
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              3
                            </span>
                            <div>
                              <p className="font-medium">Valid Winning Cards</p>
                              <p className="text-muted-foreground">
                                Answer Cards or Question Cards with matching
                                answers
                              </p>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Now that you know the rules, it&apos;s time to jump in and play!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Play Now
              </Button>
              <Button size="lg" variant="outline">
                Watch Tutorial
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default RulesPage;
