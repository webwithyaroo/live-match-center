import { MatchStats } from "@/types/match";
import StatBar from "./ui/stat-bar";

type MatchStatisticsProps = {
  statistics: MatchStats;
};

/**
 * MatchStatistics Component
 * 
 * Displays match statistics in a formatted way with progress bars
 * for visual representation. Uses icons for different stat types.
 */
export default function MatchStatistics({
  statistics,
}: MatchStatisticsProps) {

  return (
    <div 
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
      role="region"
      aria-label="Match Statistics"
    >
      <h3 className="font-semibold text-lg mb-4 text-white flex items-center gap-2">
        <svg 
          className="w-5 h-5 text-orange-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        Statistics
      </h3>

      <div className="space-y-1">
        <StatBar
          label="Possession"
          homeValue={statistics.possession.home}
          awayValue={statistics.possession.away}
          showAsPercentage
          icon="⚽"
        />
        
        <StatBar
          label="Shots"
          homeValue={statistics.shots.home}
          awayValue={statistics.shots.away}
          icon="🎯"
        />
        
        <StatBar
          label="Shots on Target"
          homeValue={statistics.shotsOnTarget.home}
          awayValue={statistics.shotsOnTarget.away}
          icon="🎯"
        />
        
        <StatBar
          label="Corners"
          homeValue={statistics.corners.home}
          awayValue={statistics.corners.away}
          icon="🚩"
        />
        
        <StatBar
          label="Fouls"
          homeValue={statistics.fouls.home}
          awayValue={statistics.fouls.away}
          icon="⚠️"
        />
        
        <StatBar
          label="Yellow Cards"
          homeValue={statistics.yellowCards.home}
          awayValue={statistics.yellowCards.away}
          icon="🟨"
        />
        
        <StatBar
          label="Red Cards"
          homeValue={statistics.redCards.home}
          awayValue={statistics.redCards.away}
          icon="🟥"
        />
      </div>
    </div>
  );
}
