"use client";

import { Team } from "@/types/match";
import { useState } from "react";

type TeamBadgeProps = {
  team: Team;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
};

/**
 * TeamBadge Component
 * 
 * Displays team logo with smart fallbacks:
 * 1. Use team.logoUrl if available
 * 2. Use DiceBear API with team.id as seed
 * 3. Fallback to team initials in gradient circle
 */
export default function TeamBadge({ team, size = "md", showName = false, className = "" }: TeamBadgeProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size];
  
  // Generate team initials from shortName or name
  const initials = (team.shortName || team.name)
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  // Use DiceBear API for placeholder logos
  const fallbackLogoUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${team.id}`;
  const logoUrl = team.logoUrl || team.logo || fallbackLogoUrl;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`${sizeClass} rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold overflow-hidden flex-shrink-0 border-2 border-white/20 shadow-md`}
        aria-hidden="true"
      >
        {!imageError && logoUrl ? (
          <img 
            src={logoUrl}
            alt={`${team.name} logo`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full">
            {initials}
          </span>
        )}
      </div>
      {showName && (
        <span className="font-semibold text-sm truncate">
          {team.shortName || team.name}
        </span>
      )}
    </div>
  );
}
