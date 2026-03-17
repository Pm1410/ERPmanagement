"use client";

import { useEffect, useState, useRef } from "react";
import { AlertCircle, Bell, Calendar, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Assuming a utility for class merge

type NoticeType = "academic" | "event" | "emergency" | "general";

interface Notice {
  id: string;
  title: string;
  type: NoticeType;
  date: string;
}

// Mock data, in production this would come from an API endpoint
const notices: Notice[] = [
  { id: "1", title: "Final Exams Schedule Released for Semester 2", type: "academic", date: "Oct 15" },
  { id: "2", title: "Heavy Rain Alert: School will remain closed tomorrow", type: "emergency", date: "Oct 14" },
  { id: "3", title: "Annual Cultural Fest registration ends this Friday!", type: "event", date: "Oct 12" },
  { id: "4", title: "Library hours extended during exam week", type: "general", date: "Oct 10" },
];

export function AnnouncementTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We duplicate the array to create an infinite scroll illusion
    // This is handled by CSS animation in actual practice for smoother results
  }, []);

  const getIcon = (type: NoticeType) => {
    switch (type) {
      case "academic": return <Calendar className="w-4 h-4 text-primary" />;
      case "emergency": return <AlertCircle className="w-4 h-4 text-danger" />;
      case "event": return <Bell className="w-4 h-4 text-success" />;
      default: return <Info className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getColor = (type: NoticeType) => {
    switch (type) {
      case "academic": return "border-l-primary bg-primary/5 text-primary";
      case "emergency": return "border-l-danger bg-danger/5 text-danger";
      case "event": return "border-l-success bg-success/5 text-success";
      default: return "border-l-neutral-400 bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="w-full bg-background border-y border-border py-3 overflow-hidden shadow-sm relative z-20">
      <div className="container flex items-center">
        <div className="flex-shrink-0 font-bold text-sm uppercase tracking-wider text-danger flex items-center whitespace-nowrap mr-6 z-10 bg-background pr-4">
          <AlertCircle className="w-4 h-4 mr-2" />
          Latest NotificATions
        </div>
        
        {/* Ticker Window */}
        <div 
          className="flex-1 overflow-hidden group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={cn(
            "flex space-x-6 whitespace-nowrap transition-transform duration-1000",
            // For a real infinite marquee, we typically use keyframes in standard CSS/Tailwind config
            "animate-marquee"
          )} style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
            {/* Duplicated for scroll loop */}
            {[...notices, ...notices].map((notice, index) => (
              <button
                key={`${notice.id}-${index}`}
                className={cn(
                  "inline-flex items-center px-4 py-1.5 rounded-md border-l-4 text-sm font-medium transition-colors hover:opacity-80",
                  getColor(notice.type)
                )}
                onClick={() => console.log("Open Modal for:", notice.id)}
              >
                {getIcon(notice.type)}
                <span className="mx-2 truncate max-w-[300px]">{notice.title}</span>
                <span className="text-xs opacity-70 ml-2">[{notice.date}]</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
