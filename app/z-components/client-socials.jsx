import React from 'react';

const SocialMediaStats = () => {
  const socialPlatforms = [
    { 
      name: 'YouTube', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-red-600">
          <path d="M23.5 6.19c-.28-1.06-1.11-1.9-2.17-2.18C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.33.51c-1.06.28-1.9 1.12-2.17 2.18C0 8 0 12 0 12s0 4 .5 5.81c.28 1.06 1.11 1.9 2.17 2.18 1.8.51 9.33.51 9.33.51s7.53 0 9.33-.51c1.06-.28 1.9-1.12 2.17-2.18.5-1.81.5-5.81.5-5.81s0-4-.5-5.81z" />
          <path fill="#fff" d="M9.5 15.5V8.5l6 3.5-6 3.5z" />
        </svg>
      ),
      followers: '54.3K',
      color: 'bg-red-100'
    },
    { 
      name: 'Instagram', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-pink-600">
          <path d="M12 2.16c3.2 0 3.58 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33 0 7.05.07 5.78.14 4.9.36 4.14.68a5.76 5.76 0 0 0-2.06 1.34A5.76 5.76 0 0 0 .68 4.14C.36 4.9.14 5.78.07 7.05 0 8.33 0 8.74 0 12s0 3.67.07 4.95c.07 1.27.29 2.15.61 2.91.34.78.79 1.47 1.34 2.06a5.76 5.76 0 0 0 2.06 1.34c.76.32 1.64.54 2.91.61 1.28.07 1.69.07 4.95.07s3.67 0 4.95-.07c1.27-.07 2.15-.29 2.91-.61a5.76 5.76 0 0 0 2.06-1.34 5.76 5.76 0 0 0 1.34-2.06c.32-.76.54-1.64.61-2.91.07-1.28.07-1.69.07-4.95s0-3.67-.07-4.95c-.07-1.27-.29-2.15-.61-2.91a5.76 5.76 0 0 0-1.34-2.06A5.76 5.76 0 0 0 19.86.68C19.1.36 18.22.14 16.95.07 15.67 0 15.26 0 12 0z" />
          <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.15A4 4 0 1 1 16 12a4 4 0 0 1-4 4z" />
          <circle cx="18.41" cy="5.59" r="1.44" />
        </svg>
      ),
      followers: '87.9K',
      color: 'bg-pink-100'
    },
    { 
      name: 'Facebook', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-blue-600">
          <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
        </svg>
      ),
      followers: '32.5K',
      color: 'bg-blue-100'
    },
    { 
      name: 'X', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-black">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      followers: '41.8K',
      color: 'bg-gray-100'
    },
    { 
      name: 'TikTok', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      followers: '124.2K',
      color: 'bg-black'
    }
  ];

  return (
    <div className="p-3 rounded-lg mx-auto">
      <div className="flex flex-wrap justify-center">
        {socialPlatforms.map((platform, index) => (
          <div key={platform.name} className="flex flex-col items-center mx-3">
            <div className={`p-2 rounded-full ${platform.color} dark:bg-opacity-30 bg-opacity-20 flex items-center justify-center mb-1`}>
              {platform.icon}
            </div>
            <div className="font-bold text-xs dark:text-gray-200">{platform.followers}</div>
          </div>
        ))}
      </div>
      <p className="text-center mt-3 text-gray-600 dark:text-gray-400 text-xs">Join our community!</p>
    </div>
  );
};


export default SocialMediaStats;

