import React, { useState, useEffect } from 'react';

const CompetitionCard = ({ 
  title = "Riccobeatz 808 challange 1",
  creatorName = "Riccobeatz MR.808",
  creatorUsername = "RiccobeatzMR.808",
  creatorInitial = "R",
  status = "submission",
  startDate = "March 21 2025",
  endDate = "March 28 2025",
  timeProgress = 0,
  prize = "Premium Riccobeatz beatz",
  participantCount = 0,
  sponsorsCount = 1,
  votesCount = 0,
  bannerImage = null,
  onParticipantClick,
  onSponsorsClick,
  onVotesClick
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('tiktok'); // 'instagram' or 'tiktok'
  const [refreshKey, setRefreshKey] = useState(0); // Used to refresh the iframes
  const [daysLeft, setDaysLeft] = useState('');

  // Helper function to calculate days left
  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const timeDiff = end - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff > 0 ? `${daysDiff} days left` : '7 days left';
  };

  // Update days left on mount and every day
  useEffect(() => {
    const updateDaysLeft = () => {
      setDaysLeft(calculateDaysLeft(endDate));
    };

    updateDaysLeft(); // Initial calculation
    const interval = setInterval(updateDaysLeft, 86400000); // Update every 24 hours

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [endDate]);
  
  // Load TikTok embed script
  useEffect(() => {
    if (showVideo && activeTab === 'tiktok') {
      // Clean up any previous script
      const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add TikTok embed script
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      // Clean up on component unmount
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showVideo, activeTab, refreshKey]);

  // Helper function to get badge style based on status
  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'draft':
        return 'bg-slate-200/20 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400';
      case 'ready':
        return 'bg-green-100/20 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-amber-100/20 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed':
        return 'bg-purple-100/20 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-slate-200/20 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400';
    }
  };

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRefreshKey(prevKey => prevKey + 1); // Refresh when changing tabs
  };

  const refreshVideos = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment key to force iframe reload
  };

  return (
    <div className="max-w-[600px] w-full">
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-800">
        {/* Banner Section */}
        <div className="relative h-48">
          <div 
            className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700"
            style={bannerImage ? { backgroundImage: `url(${bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold truncate max-w-[240px]">{title}</h2>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold border border-white/30">
                  {creatorInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{creatorName}</span>
                  <span className="text-xs opacity-80">@{creatorUsername}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap gap-2">
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(status)}`}>
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
              {status}
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              competition
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</span>
              <span className="text-sm font-medium">{daysLeft}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full" 
                style={{ width: `${timeProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{startDate}</span>
              <span>{endDate}</span>
            </div>
          </div>
          
          <div className="mt-3 mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Prize:</span>
            <a 
              href="https://www.beatstars.com/beat/fom-dancehall-18210878" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 dark:text-blue-400 font-medium hover:underline"
            >
              {prize}
            </a>
          </div>
          
          {/* Collapsible Video Section */}
          <div className="mt-4">
            <button 
              onClick={toggleVideo}
              className="flex items-center justify-between w-full py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <span className="text-sm font-medium">Challenge Video</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${showVideo ? 'transform rotate-180' : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {showVideo && (
              <div className="mt-3">
                <div className="p-3">
                  {/* Tab Buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTabChange('tiktok')}
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          activeTab === 'tiktok'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1.05-.08 6.44 6.44 0 00-5.17 2.59 6.44 6.44 0 003.44 10.15 6.44 6.44 0 006.44-6.44v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.4-.2z" />
                        </svg>
                        TikTok
                      </button>
                      <button
                        onClick={() => handleTabChange('instagram')}
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          activeTab === 'instagram'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 01-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                        </svg>
                        Instagram
                      </button>
                    </div>
                    <button
                      onClick={refreshVideos}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                      </svg>
                    </button>
                  </div>

                  {/* Video Embed */}
                  <div className="flex justify-center">
                    {activeTab === 'instagram' && (
                      <div className="aspect-[9/16] w-full max-w-xs">
                        <iframe
                          key={`instagram-${refreshKey}`} // Force reload on refresh
                          src="https://www.instagram.com/reel/DGr5hm5NGXk/embed"
                          className="w-full h-full"
                          frameBorder="0"
                          scrolling="no"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    {activeTab === 'tiktok' && (
                      <div className="w-full max-w-xs">
                        {/* TikTok Embed using blockquote (like in TikTokEmbedTab) */}
                        <blockquote
                          key={`tiktok-${refreshKey}`}
                          className="tiktok-embed"
                          cite="https://www.tiktok.com/@riccobeatz_mr808/video/7340787547704020255"
                          data-video-id="7340787547704020255"
                          style={{ maxWidth: '100%', aspectRatio: '9/16' }}
                        >
                          <section>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href="https://www.tiktok.com/@riccobeatz_mr808/video/7340787547704020255"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Watch on TikTok
                            </a>
                          </section>
                        </blockquote>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 flex">
          <a 
            href="#" 
            className="flex-1 py-4 flex flex-col items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative"
            onClick={onParticipantClick}
          >
            <div className="relative mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="absolute -top-1.5 -right-3 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {participantCount}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Participants</span>
          </a>
          <a 
            href="#" 
            className="flex-1 py-4 flex flex-col items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={onSponsorsClick}
          >
            <div className="relative mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span className="absolute -top-1.5 -right-3 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {sponsorsCount}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Sponsors</span>
          </a>
          <a 
            href="#" 
            className="flex-1 py-4 flex flex-col items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={onVotesClick}
          >
            <div className="relative mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="absolute -top-1.5 -right-3 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {votesCount}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Votes</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CompetitionCard;