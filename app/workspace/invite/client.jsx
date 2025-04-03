"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";

const UserSearchAndInvite = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const debouncedSearch = useCallback(
    debounce((term) => searchUsers(term), 300),
    []
  );

  useEffect(() => {
    if (searchTerm) {
      setIsLoading(true);
      debouncedSearch(searchTerm);
    } else {
      setUsers([]);
    }
  }, [searchTerm, debouncedSearch]);

  const searchUsers = async (query) => {
    try {
      const response = await fetch(
        `/api/workspace/invite/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.data);
      setError(null);
    } catch (err) {
      setError("An error occurred while searching for users");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUser = async (userId) => {
    try {
      const response = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeId: userId }),
      });
      if (!response.ok) throw new Error("Failed to invite user");
      const data = await response.json();
      toast({
        title: "Invitation Sent",
        description: `Successfully invited user to the workspace.`,
      });
      // Update the local state to reflect the pending invitation
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, invitePending: true } : user
        )
      );
    } catch (err) {
      toast({
        title: "Invitation Failed",
        description: "An error occurred while inviting the user.",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {isLoading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center text-destructive">{error}</p>}
          {!isLoading && !error && users.length === 0 && searchTerm && (
            <p className="text-center text-muted-foreground">No users found</p>
          )}
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user._id}
                className={`flex items-center justify-between p-2 rounded-md ${
                  user.isCurrentUser || user.invitePending
                    ? "cursor-not-allowed"
                    : "hover:bg-accent cursor-pointer"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="ml-2 text-md text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
                {user.invitePending ? (
                  <div className="flex items-center text-yellow-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Pending</span>
                  </div>
                ) : (
                  !user.isCurrentUser && (
                    <Button size="sm" onClick={() => inviteUser(user._id)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  )
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

function debounce(func, wait) {
  let timeout = null;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default UserSearchAndInvite;
