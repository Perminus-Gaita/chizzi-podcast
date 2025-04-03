"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TermsSection = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
      {title}
    </h2>
    {children}
  </section>
);

const SubSection = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
      {title}
    </h3>
    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const TermsOfService = () => {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Terms of Service
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Last Updated: November 6, 2024
                </p>
              </div>

              {/* Introduction */}
              <TermsSection title="1. Introduction">
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome to Wufwuf - The #1 Kadi Esports Platform
                  (&quot;Wufwuf,&quot; &quot;we,&quot; &quot;us,&quot; or
                  &quot;our&quot;). These Terms of Service (&quot;Terms&quot;)
                  govern your access to and use of our esports tournament
                  platform, including our website, mobile applications, and
                  related services (collectively, the &quot;Services&quot;).
                </p>
              </TermsSection>

              {/* Acceptance */}
              <TermsSection title="2. Acceptance of Terms">
                <p className="text-gray-600 dark:text-gray-300">
                  By accessing or using our Services, you agree to be bound by
                  these Terms. If you do not agree to these Terms, do not use
                  our Services. You must be at least 18 years old to use our
                  Services.
                </p>
              </TermsSection>

              {/* Platform Purpose */}
              <TermsSection title="3. Platform Purpose">
                <SubSection title="3.1 Esports Focus">
                  <p className="text-gray-600 dark:text-gray-300">
                    Our Platform is designed to facilitate competitive esports
                    tournaments for Kadi, a digital card game. The Platform
                    provides infrastructure for organizing, managing, and
                    participating in tournaments.
                  </p>
                </SubSection>

                <SubSection title="3.2 Competition Features">
                  <p className="text-gray-600 dark:text-gray-300">
                    Kadi tournaments feature:
                  </p>
                  <BulletList
                    items={[
                      "Strategic gameplay mechanics",
                      "Tournament management tools",
                      "Real-time match tracking",
                      "Competitive leaderboards",
                      "Official tournament rankings",
                    ]}
                  />
                </SubSection>

                <SubSection title="3.3 Platform Features">
                  <p className="text-gray-600 dark:text-gray-300">
                    The Platform offers:
                  </p>
                  <BulletList
                    items={[
                      "Free casual matches",
                      "Practice rooms",
                      "Community events",
                      "Free tournaments",
                      "Skill-based matchmaking",
                    ]}
                  />
                </SubSection>
              </TermsSection>

              {/* Account Registration */}
              <TermsSection title="4. Account Registration and Authentication">
                <SubSection title="4.1 Google Sign-In">
                  <BulletList
                    items={[
                      "The Platform uses Google Sign-In for authentication",
                      "You must have a valid Google account to use the Services",
                      "Your Google account email will serve as your primary Platform identifier",
                      "You must maintain access to your linked Google account",
                      "You are responsible for maintaining the security of your Google account",
                    ]}
                  />
                </SubSection>

                <SubSection title="4.2 Account Requirements">
                  <BulletList
                    items={[
                      "One Platform account per person",
                      "One Google account per Platform account",
                      "Must be at least 18 years old",
                      "Must provide accurate profile information",
                      "Must maintain updated contact information",
                    ]}
                  />
                </SubSection>

                <SubSection title="4.3 Account Restrictions">
                  <p className="text-gray-600 dark:text-gray-300">
                    You may not:
                  </p>
                  <BulletList
                    items={[
                      "Create multiple Platform accounts",
                      "Use multiple Google accounts to access the Platform",
                      "Share your Platform access with others",
                      "Sell or transfer your Platform access",
                      "Use automated systems to access the Platform",
                      "Attempt to bypass Google authentication",
                    ]}
                  />
                </SubSection>
              </TermsSection>

              {/* Tournament Organization */}
              <TermsSection title="5. Tournament Organization">
                <SubSection title="5.1 Creator Rights">
                  <BulletList
                    items={[
                      "Set entry fees",
                      "Establish tournament rules",
                      "Determine prize structures",
                      "Manage participant eligibility",
                      "Secure sponsorships",
                      "Sell tournament merchandise",
                    ]}
                  />
                </SubSection>

                <SubSection title="5.2 Creator Responsibilities">
                  <BulletList
                    items={[
                      "Comply with platform rules",
                      "Maintain fair competition",
                      "Distribute prizes as advertised",
                      "Properly manage participant data",
                      "Communicate clearly with participants",
                      "Handle disputes professionally",
                    ]}
                  />
                </SubSection>

                <SubSection title="5.3 Entry Fees and Prizes">
                  <BulletList
                    items={[
                      "Entry fees support prize pools and platform maintenance",
                      "Prize distribution follows predetermined structures",
                      "All financial transactions processed through Paystack",
                      "Transparent fee and prize pool calculations",
                      "Clear policies on cancellations and refunds",
                    ]}
                  />
                </SubSection>
              </TermsSection>

              {/* Fair Play and Competition */}
              <TermsSection title="6. Fair Play and Competition">
                <SubSection title="6.1 Anti-Cheating Measures">
                  <BulletList
                    items={[
                      "Server-side game processing",
                      "Automated pattern detection",
                      "Performance monitoring",
                      "Connection quality verification",
                      "Device fingerprinting",
                      "Account verification",
                    ]}
                  />
                </SubSection>

                <SubSection title="6.2 Prohibited Behaviors">
                  <BulletList
                    items={[
                      "Using automated play systems",
                      "Exploiting game bugs",
                      "Intentionally disconnecting",
                      "Colluding with other players",
                      "Using unauthorized software",
                      "Manipulating match results",
                    ]}
                  />
                </SubSection>

                <SubSection title="6.3 Enforcement">
                  <BulletList
                    items={[
                      "Automated detection systems",
                      "Manual review processes",
                      "Progressive penalty system",
                      "Appeal mechanisms",
                      "Permanent account bans for serious violations",
                    ]}
                  />
                </SubSection>
              </TermsSection>

              {/* Payment Terms */}
              <TermsSection title="7. Payment Terms">
                <SubSection title="7.1 Processing">
                  <BulletList
                    items={[
                      "All payments processed through Paystack",
                      "Secure transaction handling",
                      "Clear fee structure",
                      "Automated prize distribution",
                      "Regular creator payouts",
                    ]}
                  />
                </SubSection>

                <SubSection title="7.2 Refund Policy">
                  <BulletList
                    items={[
                      "Tournament cancellation refunds",
                      "Technical issue refunds",
                      "No refunds for tournament eliminations",
                      "Processing fee retention",
                      "Dispute resolution process",
                    ]}
                  />
                </SubSection>
              </TermsSection>

              {/* Privacy and Data */}
              <TermsSection title="8. Privacy and Data">
                <SubSection title="8.1 Data Collection">
                  <p className="text-gray-600 dark:text-gray-300">
                    We collect:
                  </p>
                  <BulletList
                    items={[
                      "Account information",
                      "Game statistics",
                      "Tournament results",
                      "Payment details",
                      "Platform usage data",
                    ]}
                  />
                </SubSection>

                <SubSection title="8.2 Data Usage">
                  <p className="text-gray-600 dark:text-gray-300">
                    Data is used for:
                  </p>
                  <BulletList
                    items={[
                      "Tournament operations",
                      "Performance analysis",
                      "Platform improvement",
                      "Security measures",
                      "Legal compliance",
                    ]}
                  />
                </SubSection>
              </TermsSection>

              {/* Termination */}
              <TermsSection title="9. Termination">
                <p className="text-gray-600 dark:text-gray-300">
                  We may terminate accounts for:
                </p>
                <BulletList
                  items={[
                    "Terms violation",
                    "Cheating",
                    "Harmful behavior",
                    "Payment issues",
                    "Legal requirements",
                  ]}
                />
              </TermsSection>

              {/* Changes to Terms */}
              <TermsSection title="10. Changes to Terms">
                <p className="text-gray-600 dark:text-gray-300">
                  We reserve the right to modify these Terms at any time. Users
                  will be notified of significant changes through the platform
                  or via email. Continued use of the platform after such
                  modifications constitutes acceptance of the updated Terms.
                </p>
              </TermsSection>

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  For questions about these Terms of Service, please contact us
                  at wufwuf78@gmail.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
