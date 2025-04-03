import React, { useState } from 'react';
import { Search, UserPlus, Check, Loader2, Users, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UserSearchInvite = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [invitingUsers, setInvitingUsers] = useState(new Set());
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    try {
      const response = await fetch(
        `/api/workspace/invite/search?query=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        if (data.message.includes("More than 50 users matched")) {
          setSearchError(data.message);
          setSearchResults([]);
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } else {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search Failed",
        description: "An error occurred while searching for users.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInvite = async (userId) => {
    setInvitingUsers(prev => new Set([...prev, userId]));
    
    try {
      const response = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeId: userId }),
      });
      
      if (!response.ok) throw new Error('Failed to invite user');
      
      toast({
        title: "Invitation Sent",
        description: "Successfully invited user to the workspace.",
      });
      
      setSearchResults(results => 
        results.map(user => 
          user._id === userId ? { ...user, invitePending: true } : user
        )
      );
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Invitation Failed",
        description: "An error occurred while inviting the user.",
        variant: "destructive",
      });
    } finally {
      setInvitingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <Card className="w-full min-h-[400px] shadow-none border-0">
      <div className="space-y-4">
        {/* Search section */}
        <div className="px-6 pt-6">
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {hasSearched && !isSearching && !searchError && searchResults.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Found {searchResults.length} match{searchResults.length === 1 ? '' : 'es'}
            </div>
          )}
        </div>

        {/* Results section */}
        <div>
          {searchError ? (
            <div className="px-6">
              <Alert variant="destructive" className="bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {searchError}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              {!isSearching && searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between py-4 px-6 border-t border-b"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                    <Avatar className="flex-shrink-0">
                      <AvatarImage src={user.profilePicture} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm leading-tight truncate max-w-[200px]">
                          {user.name}
                        </span>
                        {user.isCurrentUser && (
                          <span className="ml-2 text-sm text-muted-foreground flex-shrink-0">(You)</span>
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm truncate max-w-[200px]">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {user.isCurrentUser ? null : user.isWorkspaceMember ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="w-24"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Member
                      </Button>
                    ) : (
                      <Button
                        variant={user.invitePending ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleInvite(user._id)}
                        disabled={user.invitePending || invitingUsers.has(user._id)}
                        className="w-24"
                      >
                        {user.invitePending ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Invited
                          </>
                        ) : invitingUsers.has(user._id) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Inviting...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          
          {isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          )}

          {!isSearching && hasSearched && !searchError && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground max-w-[600px] mx-auto px-6">
              No users found matching your search criteria
            </div>
          )}

          {!hasSearched && !isSearching && !searchError && (
            <div className="text-center py-8 text-muted-foreground max-w-[600px] mx-auto px-6">
              Enter a search term and click search to find users who you can invite to your workspace.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserSearchInvite;