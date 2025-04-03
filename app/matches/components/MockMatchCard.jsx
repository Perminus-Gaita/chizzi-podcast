import React from "react";
import moment from "moment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MockMatchCard = ({ match }) => (
  <Card className="relative overflow-hidden dark:bg-gray-800/70">
    <CardContent className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{match.name}</div>
          {match.tournamentContext && (
            <Badge variant="secondary">Tournament</Badge>
          )}
        </div>
        <Badge variant={match.turn === "current-user-id" ? "destructive" : "outline"}>
          {match.turn === "current-user-id" ? "Your Turn" : "Waiting"}
        </Badge>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={match.opponents[0].avatar} />
            <AvatarFallback>{match.opponents[0].username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{match.opponents[0].username}</div>
            <div className="text-sm text-muted-foreground">Rating: {match.opponents[0].rating}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm">
            <span className="font-medium">{match.playerState.playerDeck.length}</span> cards left
          </div>
          <div className="text-xs text-muted-foreground">
            Last move: {moment(match.createdAt).fromNow()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 bg-muted/30 rounded-lg mb-4">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Top Card</div>
          <div className="font-medium">
            {match.gameState.topCard ? `${match.gameState.topCard.color} ${match.gameState.topCard.value}` : "None"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Current Suit</div>
          <div className="font-medium capitalize">{match.currentSuit || "None"}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Direction</div>
          <div className="font-medium">{match.gameState.direction === 1 ? "→" : "←"}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={match.turn === "current-user-id" ? "default" : "outline"} 
          className="flex-1"
          disabled={match.turn !== "current-user-id"}
        >
          {match.turn === "current-user-id" ? "Play Now" : "View Game"}
        </Button>
        <Button variant="outline" size="icon">
          <div className="sr-only">More options</div>
          <div className="w-4 h-4 flex flex-col items-center justify-center gap-[3px]">
            <div className="w-[3px] h-[3px] rounded-full bg-current" />
            <div className="w-[3px] h-[3px] rounded-full bg-current" />
            <div className="w-[3px] h-[3px] rounded-full bg-current" />
          </div>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default MockMatchCard;