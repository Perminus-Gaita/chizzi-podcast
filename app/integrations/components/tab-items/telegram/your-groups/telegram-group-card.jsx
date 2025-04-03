import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from "@/components/ui/separator";
import { Users, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TelegramGroupCard = ({ group, handleWarningClick, hasRequiredPermissions, handleGroupClick }) => {
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  const renderClickableArea = () => (
    <div 
      className="flex items-start gap-4 cursor-pointer" 
      onClick={() => handleGroupClick(group.inviteLink)}
    >
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={getAvatarUrl(group.name)} alt={group.name} />
        <AvatarFallback>
          {group.name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{group.name}</span>
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Users className="h-4 w-4" />
            {group.memberCount.toLocaleString()} members
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-t border-b">
      <div className="px-6 py-4">
        {renderClickableArea()}
        <div className="mt-4 bg-muted/20 rounded-lg p-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-md text-muted-foreground">Group Type:</span>
            <Badge 
              variant="default" 
              className={`flex items-center gap-1 cursor-pointer ${
                group.type === 'supergroup' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
              onClick={(e) => handleWarningClick(e, group)}
            >
              {group.type === 'supergroup' ? 'Super Group' : 'Normal Group'}
              {group.type === 'supergroup' ? 
                <CheckCircle2 className="h-5 w-5 ml-1" /> : 
                <AlertTriangle className="h-5 w-5 ml-1" />
              }
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-md text-muted-foreground">Wufwuf &quot;Rafiki&quot; Bot Role:</span>
            <Badge 
              variant="default" 
              className={`flex items-center gap-1 cursor-pointer ${
                group.wufwufBotRole === 'admin' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
              onClick={(e) => handleWarningClick(e, group)}
            >
              {group.wufwufBotRole === 'admin' ? 'Admin' : 
               group.wufwufBotRole === 'member' ? 'Member' : 
               'Not in Group'}
              {group.wufwufBotRole === 'admin' ? 
                <CheckCircle2 className="h-5 w-5 ml-1" /> : 
                <AlertTriangle className="h-5 w-5 ml-1" />
              }
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-md text-muted-foreground">Bot has required permissions:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge 
                  variant="default" 
                  className={`flex items-center gap-1 cursor-pointer ${
                    hasRequiredPermissions(group.botPermissions) ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {hasRequiredPermissions(group.botPermissions) ? 'Yes' : 'No'}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Bot Permissions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(group.botPermissions || {}).map(([permission, isGranted]) => (
                  <DropdownMenuItem key={permission} className="flex justify-between">
                    <span className="capitalize">
                      {permission.replace(/([A-Z])/g, ' $1').replace('can ', '')}
                    </span>
                    <Badge 
                      variant={isGranted ? "success" : "destructive"}
                      className="ml-2"
                    >
                      {isGranted ? 'Granted' : 'Missing'}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramGroupCard;