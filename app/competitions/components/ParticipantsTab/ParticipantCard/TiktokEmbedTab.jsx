import React, { useEffect } from 'react';

const TiktokEmbedTab = ({ participant }) => {
  // Extract the TikTok video URL from the participant's socialLinks
  const tiktokUrl = participant?.submissions?.tiktok;
  
  // Extract video ID from URL (assuming format like https://www.tiktok.com/@username/video/1234567890)
  const videoId = tiktokUrl?.split('/video/')[1]?.split('?')[0];

  useEffect(() => {
    // Clean up any previous script
    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add TikTok embed script
    if (tiktokUrl) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      // Clean up on component unmount
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [tiktokUrl]);

  if (!tiktokUrl) {
    return <div className="p-4 text-center text-gray-500">No TikTok video available</div>;
  }

  return (
    <div className="flex justify-center p-4">
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg overflow-hidden w-full max-w-xs">
        {/* TikTok Embed */}
        <blockquote 
          className="tiktok-embed" 
          cite={tiktokUrl}
          data-video-id={videoId}
          style={{ maxWidth: '100%' }}
        >
          <section>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={tiktokUrl}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Watch on TikTok
            </a>
          </section>
        </blockquote>
      </div>
    </div>
  );
};

export default TiktokEmbedTab;