"use client";
import {
  AlertCircle,
  Award,
  Share2,
  Crown,
  ArrowRight,
  PlayCircle,
  Info,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Badge } from "@/components/ui/badge";
import BlogPageHeader from "@/components/Navigation/BlogPageHeader";
import Link from 'next/link';

// Card Type Definitions
const CARD_TYPES = [
  {
    title: "Question Cards",
    description: "Queens (Q) and Eights (8) form complex sequences",
    icon: <AlertCircle className="w-10 h-10 text-pink-500" />,
    details: [
      "Can be chained in unique sequences",
      "Must follow specific suit-matching rules",
      "Can connect within same card type across suits",
    ],
    examples: ["QS → QH → 8H → 8S", "8D → 8S → QS"],
  },
  {
    title: "Answer Cards",
    description: "4, 5, 6, 7, 9, 10, and Ace cards",
    icon: <Award className="w-10 h-10 text-blue-500" />,
    details: [
      "Can answer Question Cards",
      "Crucial for winning the game",
      "Flexible play options",
    ],
    examples: [
      "Matching answer to a Question Card",
      "Playing multiple cards of same rank",
    ],
  },
  {
    title: "Jump Cards",
    description: "Jacks (J) skip the next player's turn",
    icon: <Share2 className="w-10 h-10 text-green-500" />,
    details: [
      "Tactical card to disrupt opponent's turn",
      "Can be countered by another Jump Card",
      "Multiple Jump Cards can be played in sequence",
    ],
    examples: [
      "Play J to skip next player",
      "Counter opponent's Jump with your own",
    ],
  },
  {
    title: "Kickback Cards",
    description: "Kings (K) reverse game direction",
    icon: <Crown className="w-10 h-10 text-purple-500" />,
    details: [
      "Change game flow instantly",
      "Can be countered by another Kickback Card",
      "Multiple Kickbacks can alternate direction",
    ],
    examples: ["Reverse play order unexpectedly", "Strategic direction change"],
  },
  {
    title: "Penalty Cards",
    description: "2, 3, and Jokers force card draws",
    icon: <AlertCircle className="w-10 h-10 text-red-500" />,
    details: [
      "Force next player to draw cards",
      "Can be countered by specific moves",
      "Joker causes most significant penalty",
    ],
    examples: [
      "2 card: Draw 2 cards",
      "3 card: Draw 3 cards",
      "Joker: Draw 5 cards",
    ],
  },
];

const KadiCards = () => {
  return (
    <>
      <BlogPageHeader />

      <main
        className="min-h-screen bg-gradient-to-b from-background
       to-muted dark:from-slate-950 dark:to-slate-900 px-2 py-20"
      >
        {/* Existing Hero Section with Breadcrumb */}
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
              <li className="text-primary">Card Types</li>
            </ol>
          </nav>
        </div>

        {/* Enhanced Hero Section */}
        <section className="text-center space-y-6 px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Master Kadi&apos;s Special Cards
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the power of each card type and learn winning combinations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-lg">
              2-5 Players
            </Badge>
            <Badge variant="outline" className="text-lg">
              54-Card Deck
            </Badge>
            <Badge variant="secondary" className="text-lg">
              3,976 Valid Sequences
            </Badge>
          </div>
        </section>

        {/* Quick Navigation Tabs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Card Types Section */}
          <h2 className="text-3xl font-bold text-center mb-8">
            Unique Card Types
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CARD_TYPES.map((cardType, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-2">
                    {cardType.icon}
                    <CardTitle>{cardType.title}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    {cardType.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="details">
                      <AccordionTrigger>Card Type Details</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {cardType.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <ArrowRight className="w-4 h-4 text-primary" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Examples:</h4>
                          {cardType.examples.map((example, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="mr-2 mb-2"
                            >
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Existing Card Types Section with Enhancements */}
        {/* Your existing card types section here */}

        {/* New Interactive Sequence Builder */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Practice Makes Perfect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Master Quick Tips
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span>
                        Always keep an Answer Card ready for your Question Cards
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span>
                        Plan your sequences in advance to maximize impact
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span>
                        Remember to announce &quot;Niko Kadi&quot; before your
                        winning move
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <Button className="w-full" size="lg">
                    <PlayCircle className="w-5 h-5 mr-2" /> Practice Now
                  </Button>
                  {/* <Button variant="outline" className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" /> Download Cheat Sheet
                </Button> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Winning Conditions Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-6 h-6 text-primary" />
                <span>How to Win</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="font-medium">
                      Announce &quot;Niko Kadi&quot;
                    </p>
                    <p className="text-muted-foreground">
                      Declare your intention to win in the previous round
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Play Winning Cards</p>
                    <p className="text-muted-foreground">
                      Play all remaining cards in a single, strategic move
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
                      Use Answer Cards or Question Cards with matching answers
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>
        {/* Question Card Sequence Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-pink-500" />
                <span>Question Card Sequences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Same Suit Connections
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span>Queen → Eight (same suit only)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span>Eight → Queen (same suit only)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Any Suit Connections</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span>Queen → Queen (any suit)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span>Eight → Eight (any suit)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    Valid Sequence Examples
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">QS → QH → 8H → 8S</Badge>
                    <Badge variant="secondary">8D → 8S → QS</Badge>
                    <Badge variant="secondary">QH → QD → 8D</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Play?</h2>
            <p className="text-xl text-muted-foreground">
              Join other players mastering Kadi right now!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <PlayCircle className="w-5 h-5 mr-2" /> Play Now
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5 mr-2" /> Share with Friends
              </Button>
            </div>
          </div>
        </section>

        {/* Related Content Section */}
        <section className="bg-muted/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Learn More</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Winning Strategies</h3>
                  <p className="text-muted-foreground mb-4">
                    Master advanced techniques and strategies.
                  </p>
                  <Button variant="link" className="p-0">
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Tournament Guide</h3>
                  <p className="text-muted-foreground mb-4">
                    Compete in Kadi tournaments and championships.
                  </p>
                  <Button variant="link" className="p-0">
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Community Rules</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn about house rules and variations.
                  </p>
                  <Button variant="link" className="p-0">
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default KadiCards;
