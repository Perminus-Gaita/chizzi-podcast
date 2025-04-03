"use client";
import React from "react";
import {
  Brain,
  Target,
  Zap,
  Shield,
  Sword,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Clock,
  Crown,
  BringToFront,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BlogPageHeader from "@/components/Navigation/BlogPageHeader";
import Link from 'next/link';

import Footer from "@/components/Footer";

const STRATEGIES = [
  {
    title: "Card Counting",
    description: "Track played cards to predict opponents' hands",
    icon: <Brain className="w-10 h-10 text-violet-500" />,
    tips: [
      "Remember played Question and Answer cards",
      "Track how many cards each player draws",
      "Count penalty cards to anticipate threats",
    ],
    difficulty: "Advanced",
  },
  {
    title: "Sequence Building",
    description: "Master Question Card combinations",
    icon: <Target className="w-10 h-10 text-pink-500" />,
    tips: [
      "Plan sequences at least 2-3 cards ahead",
      "Keep Answer cards for your sequences",
      "Watch for opponent's sequence patterns",
    ],
    difficulty: "Intermediate",
  },
  {
    title: "Defensive Play",
    description: "Protect yourself from penalties and skips",
    icon: <Shield className="w-10 h-10 text-blue-500" />,
    tips: [
      "Save Ace cards to counter penalties",
      "Keep a Jump card for emergency defense",
      "Monitor opponent's card count",
    ],
    difficulty: "Beginner",
  },
  {
    title: "Aggressive Tactics",
    description: "Force opponents to draw cards",
    icon: <Sword className="w-10 h-10 text-red-500" />,
    tips: [
      "Chain penalty cards together",
      "Use Kickbacks to catch opponents off-guard",
      "Time your attacks when opponents are low on cards",
    ],
    difficulty: "Intermediate",
  },
  {
    title: "Hand Management",
    description: "Optimize your card combinations",
    icon: <BringToFront className="w-10 h-10 text-green-500" />,
    tips: [
      "Keep a balanced mix of card types",
      "Plan your winning combination early",
      "Don't hold onto cards too long",
    ],
    difficulty: "Beginner",
  },
];

const KadiStrategies = () => {
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
              <li className="text-primary">Strategies</li>
            </ol>
          </nav>
        </div>

        <section className="text-center space-y-6 px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Master Kadi Strategy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn proven techniques from beginner to advanced levels and
            dominate the game.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-lg">
              Beginner Friendly
            </Badge>
            <Badge variant="outline" className="text-lg">
              Pro Tips
            </Badge>
            <Badge variant="secondary" className="text-lg">
              Tournament Tested
            </Badge>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Early Game
                  </h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Assess your starting hand</li>
                    <li>• Plan potential sequences</li>
                    <li>• Watch opponent&apos;s draws</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Mid Game
                  </h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Execute planned sequences</li>
                    <li>• Track played cards</li>
                    <li>• Position for winning</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    End Game
                  </h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Say &quot;Niko Kadi&quot;</li>
                    <li>• Time your winning move</li>
                    <li>• Watch for counters</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Core Strategies
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STRATEGIES.map((strategy, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-2">
                    {strategy.icon}
                    <div>
                      <CardTitle>{strategy.title}</CardTitle>
                      <Badge variant="outline">{strategy.difficulty}</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {strategy.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="tips">
                      <AccordionTrigger>Key Tips</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {strategy.tips.map((tip, idx) => (
                            <li
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <ArrowRight className="w-4 h-4 text-primary" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <span>Pro Tips & Common Mistakes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">What to Do</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span>Always keep one Answer card for emergencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        Plan your &quot;Niko Kadi&quot; announcement carefully
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        Use Kickbacks to break opponent&apos;s momentum
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">What to Avoid</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <span>
                        Don&apos;t hold onto high-value cards too long
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <span>Avoid playing Question Cards without backup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <span>
                        Never forget to track opponent&apos;s card count
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Test Your Skills?</h2>
            <p className="text-xl text-muted-foreground">
              Put these strategies into practice and become a Kadi master!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Play Now
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5 mr-2" />
                Share Strategies
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default KadiStrategies;
