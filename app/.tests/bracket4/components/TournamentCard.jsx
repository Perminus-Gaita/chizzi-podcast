// /components/TournamentCard.jsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import TournamentDetails from './TournamentDetails';
import TournamentBracket from './TournamentBracket';

const TournamentCard = ({ tournament }) => {
  const [showBracket, setShowBracket] = useState(false);
  
  // We'll use a wrapper div for max-width control
  return (
    <div className="flex justify-center w-full">
      <div className="w-full" style={{ maxWidth: '640px', minWidth: '280px' }}>
        <Card className="w-full hover:shadow-lg transition-shadow" style={{ height: '375px' }}>
          {!showBracket ? (
            <TournamentDetails 
              tournament={tournament} 
              onViewBracket={() => setShowBracket(true)} 
            />
          ) : (
            <TournamentBracket 
              tournament={tournament}
              onBack={() => setShowBracket(false)}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default TournamentCard;

