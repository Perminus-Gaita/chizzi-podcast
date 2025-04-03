import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const TelegramStatus = ({ telegramUserId, telegramGroupId }) => {
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!telegramUserId || !telegramGroupId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/integrations/telegram/group/check-membership?userId=${telegramUserId}&groupId=${telegramGroupId}`);

        setIsGroupMember(response.data.isMember);
      } catch (err) {
        console.error('Error checking Telegram membership:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkMemberStatus();
  }, [telegramUserId, telegramGroupId]);

  if (loading) {
    return (
      <div className="flex items-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !telegramUserId || !telegramGroupId) {
    return (
      <div className="flex items-center">
        <Send className="text-gray-300 transform rotate-45" size={20} />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Send 
        className={`${isGroupMember ? "text-green-500" : "text-gray-300"} transform rotate-45`}
        size={20}
      />
    </div>
  );
};

export default TelegramStatus;