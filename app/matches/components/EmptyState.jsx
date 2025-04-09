import React from "react";
import Link from "next/link";
import { Clock, Plus, Trophy, PlayCircle, Users, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmptyState = ({ category }) => {
  const config = {
    urgent: {
      icon: <Clock className="h-12 w-12 text-yellow-500" />,
      title: "No Urgent Matches",
      description:
        "You're all caught up! No matches need your immediate attention.",
      action: (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/arena">
            <Button variant="default" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Match
            </Button>
          </Link>
          <Link href="/arena?tab=tournaments">
            <Button variant="outline" className="w-full sm:w-auto">
              <Trophy className="w-4 h-4 mr-2" />
              Browse Tournaments
            </Button>
          </Link>
        </div>
      ),
    },
    active: {
      icon: <PlayCircle className="h-12 w-12 text-blue-500" />,
      title: "No Active Matches",
      description: "You don't have any ongoing matches at the moment.",
      action: (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/arena">
            <Button variant="default" className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              Join Arena Games
            </Button>
          </Link>
          <Link href="/arena">
            <Button variant="outline" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Match
            </Button>
          </Link>
        </div>
      ),
    },
    scheduled: {
      icon: <CalendarClock className="h-12 w-12 text-purple-500" />,
      title: "No Scheduled Matches",
      description: "You don't have any upcoming matches scheduled.",
      action: (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/arena?tab=tournaments">
            <Button variant="default" className="w-full sm:w-auto">
              <Trophy className="w-4 h-4 mr-2" />
              Browse Tournaments
            </Button>
          </Link>
          <Link href="/arena">
            <Button variant="outline" className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              Join Arena Games
            </Button>
          </Link>
        </div>
      ),
    },
  };

  const { icon, title, description, action } = config[category];

  return (
    <Card className="bg-background border-dashed">
      <CardContent className="flex flex-col items-center text-center py-8 px-4">
        <div className="rounded-full bg-muted p-3 mb-4">{icon}</div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  );
};

export default EmptyState;