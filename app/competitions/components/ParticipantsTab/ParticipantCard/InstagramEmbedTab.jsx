import React, { useState, useEffect } from 'react';

const InstagramEmbedTab = ({ participant }) => {
  // Extract the Instagram post URL from the participant's submissions
  const instagramUrl = participant?.submissions?.instagram;
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Extract Instagram post ID if possible
  const extractPostId = () => {
    if (!instagramUrl) return null;
    const matches = instagramUrl.match(/instagram\.com\/(p|reel)\/([^\/\?]+)/);
    return matches && matches[2] ? matches[2] : null;
  };

  const postId = extractPostId();

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setEmbedError(true);
  };

  // Reset states when refreshing
  const refreshEmbed = () => {
    setIsLoading(true);
    setEmbedError(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Effect to detect if iframe failed to load after timeout
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (isLoading) {
          setEmbedError(true);
          setIsLoading(false);
        }
      }, 5000); // 5 second timeout

      return () => clearTimeout(timer);
    }
  }, [isLoading, refreshKey]);

  if (!instagramUrl) {
    return <div className="p-4 text-center text-gray-500">No Instagram post available</div>;
  }

  return (
    <div className="flex justify-center p-4">
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg overflow-hidden w-full max-w-md">
        <div className="w-full mx-auto relative" style={{ minHeight: '700px' }}> {/* Adjust height for reels */}
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error state */}
          {embedError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
              <div className="w-12 h-12 mb-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-2">
                Instagram embed could not be loaded
              </p>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
              >
                View on Instagram
              </a>
              <button
                onClick={refreshEmbed}
                className="mt-3 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center"
              >
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Try Again
              </button>
            </div>
          )}

          {/* Fallback display when embed fails */}
          {embedError && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="p-4 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {postId || (participant?.participantId?.substring(0, 10) + "...")}
                </div>
              </div>
            </div>
          )}

          {/* Only show iframe if not in error state */}
          {!embedError && (
            <iframe
              key={`instagram-${refreshKey}`}
              src={`https://www.instagram.com/p/${postId || "CXz_OuhtAzB"}/embed/`}
              className={`w-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              style={{ height: '700px' }} // Adjust height for reels
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstagramEmbedTab;