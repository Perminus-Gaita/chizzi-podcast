"use client";
import React, { useState } from "react";
import {
  Book,
  Search,
  Info,
  ArrowRight,
  BookOpen,
  Share2,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BlogPageHeader from "@/components/Navigation/BlogPageHeader";
import Link from 'next/link';

const GLOSSARY_TERMS = [
  {
    term: "Answer Cards",
    description:
      "Cards that can be played in response to Question Cards. Include 4, 5, 6, 7, 9, 10, and Ace cards.",
    category: "Card Types",
    example: "Playing a 7♥ after a Q♥",
  },
  {
    term: "Draw Pile",
    description:
      "The face-down stack of cards that players draw from when they cannot play or need more cards.",
    category: "Game Elements",
    example: "Draw when you can't match the current card",
  },
  {
    term: "Jump Card",
    description:
      "Jack (J) cards that skip the next player's turn. Can be countered by another Jump Card.",
    category: "Card Types",
    example: "Playing J♠ to skip the next player",
  },
  {
    term: "Kickback Card",
    description:
      "King (K) cards that reverse the game direction. Can be countered by another Kickback Card.",
    category: "Card Types",
    example: "Playing K♦ to reverse direction",
  },
  {
    term: "Niko Kadi",
    description:
      "Phrase that must be announced in the round before attempting to win. Failure to do so prevents winning.",
    category: "Game Rules",
    example: "Say 'Niko Kadi' when you plan to win next round",
  },
  {
    term: "Penalty Cards",
    description:
      "2, 3, and Joker cards that force the next player to draw cards unless countered.",
    category: "Card Types",
    example: "Playing a 2 makes next player draw 2 cards",
  },
  {
    term: "Question Cards",
    description:
      "Queen (Q) and Eight (8) cards that can form sequences. Must be played with matching Answer Cards.",
    category: "Card Types",
    example: "Q♣ → 8♣ sequence",
  },
  {
    term: "Question Sequence",
    description:
      "A series of connected Question Cards following specific suit-matching rules.",
    category: "Game Mechanics",
    example: "QS → QH → 8H → 8S",
  },
  {
    term: "Same Suit Connection",
    description:
      "Rule requiring Queens and Eights to match suits when played in sequence.",
    category: "Game Rules",
    example: "Q♥ must connect to 8♥, not 8♦",
  },
  {
    term: "Winning Move",
    description:
      "Playing all remaining cards in a single turn after announcing 'Niko Kadi' in previous round.",
    category: "Game Rules",
    example: "Playing final Answer Cards in one turn",
  },
];

const KadiGlossary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(GLOSSARY_TERMS.map((term) => term.category)),
  ];

  const filteredTerms = GLOSSARY_TERMS.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <li className="text-primary">Glossary</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-6 px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Kadi Glossary
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master the terminology and become fluent in the language of Kadi.
          </p>
        </section>

        {/* Search and Filter Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search terms..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Glossary Terms */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="grid gap-6">
            {filteredTerms.map((term, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="w-5 h-5 text-primary" />
                        {term.term}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {term.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {term.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="font-medium">Example:</span>
                    <span className="text-muted-foreground">
                      {term.example}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Reference Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <span>Quick Reference Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Key Terms to Remember</h3>
                  <ul className="space-y-3">
                    {[
                      "Niko Kadi",
                      "Question Sequence",
                      "Same Suit Connection",
                    ].map((term, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Common Rules</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span>Announce before winning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span>Match suits in sequences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span>Counter with matching cards</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Play?</h2>
            <p className="text-xl text-muted-foreground">
              Now that you know the terms, put them into practice!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Playing
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5 mr-2" />
                Share Glossary
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default KadiGlossary;
