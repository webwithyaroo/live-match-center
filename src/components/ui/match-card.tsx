import Link from "next/link";
import { Match } from "@/types/match";
import TeamBadge from "./team-badge";
import LiveIndicator from "./live-indicator";

type MatchCardProps = {
  match: Match;
  league?: string;
};

/**
 * MatchCard Component
 * 
 * Premium match card with dark theme and orange accents
 */
export default function MatchCard({ match, league = "Premier League" }: MatchCardProps) {
  const isLive = match.status === "FIRST_HALF" || match.status === "SECOND_HALF";
  
  return (
    <Link 
      href={`/match/${match.id}`}
      className="block"
      aria-label={`View details for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
    >
      <div 
        className={`match-card bg-[#1A1A1C] rounded-lg border border-[#2C2C2E] overflow-hidden ${
          isLive ? "border-l-4 border-l-[#FF5500]" : ""
        }`}
      >
        {/* League Header */}
        <div className="bg-[#0E0E10] px-4 py-2 flex items-center justify-between border-b border-[#2C2C2E]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#9E9E9E] uppercase tracking-wider">
              {league}
            </span>
          </div>
          <LiveIndicator status={match.status} size="sm" />
        </div>
        
        {/* Match Info */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <TeamBadge team={match.homeTeam} size="md" />
              <span className="font-medium text-white truncate">
                {match.homeTeam.shortName}
              </span>
            </div>
            
            {/* Score */}
            <div className="flex items-center gap-3 px-4">
              <span 
                className="text-[32px] font-bold text-white leading-none"
                aria-label="Score"
              >
                {match.homeScore}
              </span>
              <span className="text-[#666666] font-semibold text-xl">:</span>
              <span 
                className="text-[32px] font-bold text-white leading-none"
              >
                {match.awayScore}
              </span>
            </div>
            
            {/* Away Team */}
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <span className="font-medium text-white truncate">
                {match.awayTeam.shortName}
              </span>
              <TeamBadge team={match.awayTeam} size="md" />
            </div>
          </div>
          
          {/* Match Status Footer */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span 
              className={`${
                isLive ? "text-[#FF5500] font-medium" : "text-[#9E9E9E]"
              }`}
            >
              {match.minute > 0 ? `${match.minute}'` : ""} 
              {isLive && match.minute > 0 && " • " + league}
            </span>
            <span className="text-[#FF5500] hover:text-[#FF8800] font-medium flex items-center gap-1 transition-colors">
              View
              <svg 
                className="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
