"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  ArrowRight,
  Heart,
  Diamond,
  Club,
  Spade,
  Trophy,
  Info,
} from "lucide-react";
import BlogPageHeader from "@/components/Navigation/BlogPageHeader";

const KadiSequences = () => {
  const [activeSequence, setActiveSequence] = useState(null);

  const sequences = [
    {
      id: 1,
      title: "Basic Queen Chain",
      sequence: "QH → QD → QS",
      explanation: "Queens can connect to other Queens regardless of suit",
      difficulty: "Beginner",
    },
    {
      id: 2,
      title: "Same Suit Connection",
      sequence: "QH → 8H → QH",
      explanation: "Queens and Eights must match suits when connecting",
      difficulty: "Beginner",
    },
    {
      id: 3,
      title: "Advanced Chain",
      sequence: "8S → QS → QH → 8H → 8D",
      explanation: "Mix of same-suit and cross-suit connections",
      difficulty: "Advanced",
    },
  ];

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
              <li className="text-primary">Kadi Sequences</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-6">
              Master Kadi Sequences
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn the art of combining Question Cards to create powerful
              winning combinations. With 3,976 possible sequences, mastering
              these patterns is key to domination.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <Heart className="w-6 h-6 text-red-500" />,
                  label: "Hearts",
                  cards: "QH, 8H",
                },
                {
                  icon: <Diamond className="w-6 h-6 text-red-500" />,
                  label: "Diamonds",
                  cards: "QD, 8D",
                },
                {
                  icon: <Club className="w-6 h-6" />,
                  label: "Clubs",
                  cards: "QC, 8C",
                },
                {
                  icon: <Spade className="w-6 h-6" />,
                  label: "Spades",
                  cards: "QS, 8S",
                },
              ].map((suit, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center space-x-3">
                    {suit.icon}
                    <div>
                      <p className="font-semibold">{suit.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {suit.cards}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="learn" className="space-y-8">
              <TabsList className="flex flex-wrap w-full gap-2">
                <TabsTrigger className="flex-1 min-w-[120px]" value="learn">
                  Learn
                </TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[120px]" value="examples">
                  Examples
                </TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[120px]" value="practice">
                  Practice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="learn">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-2xl font-bold mb-4">Core Rules</h3>
                        <ul className="space-y-4">
                          <li className="flex items-start space-x-3">
                            <ArrowRight className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <span>
                              Same suit required between Queens and Eights
                            </span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <ArrowRight className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <span>
                              Queens can connect to Queens of any suit
                            </span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <ArrowRight className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <span>
                              Eights can connect to Eights of any suit
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-4">
                          Advanced Tips
                        </h3>
                        <ul className="space-y-4">
                          <li className="flex items-start space-x-3">
                            <Trophy className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <span>
                              Plan sequences based on your answer cards
                            </span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <Trophy className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <span>Use sequences to block opponents</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <Trophy className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <span>
                              Save powerful sequences for winning moves
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sequences.map((seq) => (
                    <Card
                      key={seq.id}
                      className={`bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                        activeSequence === seq.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setActiveSequence(seq.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold">{seq.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {seq.difficulty}
                          </span>
                        </div>
                        <p className="text-lg font-mono mb-4">{seq.sequence}</p>
                        {activeSequence === seq.id && (
                          <p className="text-muted-foreground text-sm">
                            {seq.explanation}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="practice">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">
                      Practice Mode Coming Soon!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Test your knowledge with interactive sequence challenges.
                    </p>
                    <Button asChild>
                      <Link href="/how-to-play">Learn Basic Rules First</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Pro Tips Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Pro Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Sequence Planning",
                  tip: "Always keep track of answer cards in your hand when planning sequences.",
                },
                {
                  title: "Suit Management",
                  tip: "Maintain a balance of suits to maximize sequence possibilities.",
                },
                {
                  title: "Timing is Key",
                  tip: "Save your longest sequences for when you're close to winning.",
                },
              ].map((tip, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <Info className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                    <p className="text-muted-foreground">{tip.tip}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Master Kadi?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your journey to becoming a Kadi champion today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <Link href="/play-online">Play Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/strategies">Learn More Strategies</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default KadiSequences;
