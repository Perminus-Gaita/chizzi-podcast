"use client";
import { useState } from "react";
import { Tv, Youtube, PlaySquare, List, Users, Clock } from "lucide-react";

const ShowsTab = () => {
  const [youtubeShows, setYoutubeShows] = useState([
    {
      id: 1,
      title: "My amaizing playlist",
      platform: "YouTube",
      creator: "Me Mimi Me",
      videos: 24,
      totalLength: "16h 45m",
      subscribers: "55K",
      lastUpdated: "2 days ago",
      playlistUrl: "https://youtube.com/playlist?list=example1",
      thumbnailUrl: "/shows/gaming-championship.jpg"
    },
    {
      id: 2,
      title: "My amaizing playlist",
      platform: "YouTube",
      creator: "Me Mimi Me",
      videos: 18,
      totalLength: "12h 20m",
      subscribers: "55K",
      lastUpdated: "1 week ago",
      playlistUrl: "https://youtube.com/playlist?list=example2",
      thumbnailUrl: "/shows/indie-developer.jpg"
    }
  ]);

  return (
    <div className="mt-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">YouTube Playlists</h2>
        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {youtubeShows.map((show) => (
          <div 
            key={show.id} 
            className="overflow-hidden transition-all bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg"
          >
            <div className="relative h-48 bg-gray-200">
              {/* Using placeholder image since actual images aren't available */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                <Youtube className="w-16 h-16 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <Youtube className="w-5 h-5 mr-2 text-red-600" />
                <span className="text-sm font-medium text-red-600">{show.platform}</span>
              </div>
              <h3 className="mb-3 text-lg font-medium">{show.title}</h3>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                By <span className="font-medium">{show.creator}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <PlaySquare className="w-4 h-4 mr-2" />
                  <span>{show.videos} videos</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{show.totalLength}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{show.subscribers} subscribers</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <List className="w-4 h-4 mr-2" />
                  <span>Updated {show.lastUpdated}</span>
                </div>
              </div>
              <a 
                href={show.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
              >
                View Playlist
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowsTab;