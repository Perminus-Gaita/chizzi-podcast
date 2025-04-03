"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Check, Sparkles, DollarSign } from "lucide-react";

const WaitingPlayer = ({ roomDataCopy, pathname, copied, handleCopyClick }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
              <Users className="h-6 w-6" />
              Waiting for Opponent
              {roomDataCopy[0]?.maxPlayers - roomDataCopy[0].players.length >
                1 && "s"}
            </CardTitle>
            <Badge
              variant={roomDataCopy[0].pot > 0 ? "default" : "secondary"}
              className="text-xs md:text-md"
            >
              {roomDataCopy[0].pot > 0 ? (
                <DollarSign className="h-4 w-4 mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {roomDataCopy[0].pot > 0 ? "Competitive" : "Practice"}
            </Badge>
          </div>
          <CardDescription className="text-xs md:text-md">
            This table can have a maximum of {roomDataCopy[0]?.maxPlayers}{" "}
            players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: roomDataCopy[0]?.maxPlayers }).map(
                (_, index) => (
                  <Card
                    key={index}
                    className={`flex flex-col items-center p-4 ${
                      index >= roomDataCopy[0].players.length
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <Avatar className="h-16 w-16 mb-2">
                      {roomDataCopy[0].players[index] ? (
                        <AvatarImage
                          src={
                            roomDataCopy[0].players[index].profilePicture ||
                            `https://api.dicebear.com/6.x/initials/svg?seed=${roomDataCopy[0].players[index].username}`
                          }
                          alt={roomDataCopy[0].players[index].username}
                        />
                      ) : (
                        <AvatarFallback>?</AvatarFallback>
                      )}
                    </Avatar>

                    {roomDataCopy[0].players[index] ? (
                      <p className="text-center space-y-1 w-full">
                        <span className="text-sm md:text-md font-medium block truncate capitalize">
                          {roomDataCopy[0].players[index].name}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground truncate block">
                          @{roomDataCopy[0].players[index].username}
                        </span>
                      </p>
                    ) : (
                      <p className="text-center space-y-1 w-full">
                        <span className="font-medium block truncate">
                          Waiting...
                        </span>
                      </p>
                    )}
                  </Card>
                )
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Invite Link:</h3>
              <div className="flex items-center space-x-2">
                <Input
                  value={`https://www.wufwuf.io${pathname}`}
                  readOnly
                  className="flex-grow"
                />
                <Button onClick={handleCopyClick} variant="outline" size="icon">
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingPlayer;
