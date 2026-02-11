import Link from "next/link";
import { Match } from "@/types/match";
import TeamBadge from "./team-badge";
import LiveIndicator from "./live-indicator";

type MatchCardProps = {
  match: Match;
  variant?: "compact" | "full";
  league?: string;
};

/**
 * MatchCard Component
 * 
 * Professional match card with team logos, scores, and status
 */
export default function MatchCard({ match, variant = "full", league = "Premier League" }: MatchCardProps) {
  const isLive = match.status === "FIRST_HALF" || match.status === "SECOND_HALF";
  
  return (
    <Link 
      href={`/match/${match.id}`}
      className="block"
      aria-label={`View details for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
    >
      <div 
        className={`match-card bg-white rounded-lg shadow-sm border border-gray-200 hover:border-orange-400 overflow-hidden ${
          isLive ? "ring-2 ring-red-500" : ""
        }`}
      >
        {/* League Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
              <span className="font-semibold text-gray-900 truncate">
                {match.homeTeam.shortName}
              </span>
            </div>
            
            {/* Score */}
            <div className="flex items-center gap-2 px-4">
              <span 
                className="text-2xl font-bold text-gray-900"
                aria-label="Score"
              >
                {match.homeScore}
              </span>
              <span className="text-gray-400 font-semibold">:</span>
              <span 
                className="text-2xl font-bold text-gray-900"
              >
                {match.awayScore}
              </span>
            </div>
            
            {/* Away Team */}
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <span className="font-semibold text-gray-900 truncate">
                {match.awayTeam.shortName}
              </span>
              <TeamBadge team={match.awayTeam} size="md" />
            </div>
          </div>
          
          {/* Match Status Footer */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span 
              className={`${
                isLive ? "text-orange-600 font-semibold" : "text-gray-500"
              }`}
            >
              {match.minute > 0 ? `${match.minute}'` : ""} 
              {isLive && " • " + league}
            </span>
            <span className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
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
