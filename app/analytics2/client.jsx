"use client";
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, YAxis, XAxis, Tooltip } from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Facebook, 
  Instagram, 
  Youtube
} from 'lucide-react';

const mockFollowerData = [
  { month: 'Jan', followers: 1000 },
  { month: 'Feb', followers: 1500 },
  { month: 'Mar', followers: 2200 },
  { month: 'Apr', followers: 3000 },
  { month: 'May', followers: 4200 },
  { month: 'Jun', followers: 5000 }
];

const mockEngagementData = [
  { month: 'Jan', engagement: 15 },
  { month: 'Feb', engagement: 18 },
  { month: 'Mar', engagement: 22 },
  { month: 'Apr', engagement: 25 },
  { month: 'May', engagement: 28 },
  { month: 'Jun', engagement: 32 }
];

const AnalyticsCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);
  
  const cards = [
    {
      title: "Your Follower Growth",
      data: mockFollowerData,
      dataKey: "followers",
      color: "#2563eb",
      icon: TrendingUp
    },
    {
      title: "Your Engagement Rate",
      data: mockEngagementData,
      dataKey: "engagement",
      color: "#16a34a",
      icon: Activity
    }
  ];

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    
    if ((activeIndex === 0 && diff < 0) || (activeIndex === cards.length - 1 && diff > 0)) {
      setDragOffset(diff * 0.2); // Resistance at edges
    } else {
      setDragOffset(diff);
    }
    
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    const swipeThreshold = 50;

    if (Math.abs(dragOffset) > swipeThreshold) {
      if (dragOffset > 0 && activeIndex < cards.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else if (dragOffset < 0 && activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      }
    }
    setDragOffset(0);
    e.preventDefault();
  };

  // Handle dot click navigation
  const handleDotClick = (index) => {
    setActiveIndex(index);
    setDragOffset(0);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-semibold">
          Your Analytics, Simplified
        </CardTitle>
        <p className="text-muted-foreground">
          Focus on creating while we handle the data 📈
        </p>
        
        <div className="flex justify-center gap-4 pt-2">
          <Facebook className="w-6 h-6 text-blue-600" />
          <Instagram className="w-6 h-6 text-pink-600" />
          <Youtube className="w-6 h-6 text-red-600" />
          <Activity className="w-6 h-6 text-black" />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative bg-gray-50 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${-activeIndex * 100 + (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100}%)`
            }}
          >
            {cards.map((card, idx) => (
              <div key={idx} className="w-full flex-shrink-0 p-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <card.icon className="w-5 h-5" />
                    <h3 className="font-medium">{card.title}</h3>
                  </div>
                  
                  <div className="h-64">
                    <LineChart width={300} height={200} data={card.data}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey={card.dataKey} 
                        stroke={card.color} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 py-4">
            {cards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  idx === activeIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 bg-white">
          <Button className="w-full">
            Connect your social media accounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;