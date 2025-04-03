import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, User2, ArrowLeft, ExternalLink } from 'lucide-react';

const TournamentBracket = ({ tournament, onBack }) => {
  return (
    <div className="h-full">
      <div className="border-b">
        <div className="pt-3 flex items-start justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 -ml-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-100 flex-shrink-0">
                  <img
                    src="/api/placeholder/20/20"
                    alt="Tournament thumbnail"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <h3 className="font-semibold text-[15px] text-gray-900 truncate">
                  {tournament.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1 mb-3 min-w-0">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <User2 className="w-3 h-3 text-gray-600" />
                </div>
                <div className="min-w-0 flex items-center gap-1">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {tournament.creator.name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono truncate">
                    {tournament.creator.username}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="px-2.5 h-12 flex-col items-center justify-center mr-4 flex-shrink-0 -mt-0.5"
          >
            <ExternalLink className="h-3.5 w-3.5 mb-0.5" />
            <span className="text-[11px] leading-none">Full</span>
            <span className="text-[11px] leading-none">View</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-gray-50 flex items-center justify-center" style={{ height: 'calc(100% - 84px)' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Tournament Bracket Preview</p>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;

