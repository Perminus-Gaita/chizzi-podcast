// components/tab-items/telegram/bot-groups.jsx
import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, Loader2, MessagesSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const BotGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/integrations/telegram/bot-groups');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bot groups');
      }

      setGroups(data.groups);
    } catch (err) {
      console.error('Error fetching bot groups:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="border-0">
        <CardHeader>
          <CardTitle>Bot Groups</CardTitle>
          <CardDescription>View all groups where your bot is a member</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Bot Groups</CardTitle>
        <CardDescription>View all groups where your bot is a member</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading bot groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Groups Found</h3>
            <p className="text-muted-foreground">
              Your bot is not a member of any groups yet.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessagesSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{group.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        ID: {group.id}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          {group.members_count} members
                        </Badge>
                        {group.is_forum && (
                          <Badge className="bg-blue-500">Forum</Badge>
                        )}
                        {group.is_supergroup && (
                          <Badge className="bg-green-500">Supergroup</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default BotGroups;