import { MatchStats } from "@/types/match";

type StatRowProps = {
  label: string;
  homeValue: number;
  awayValue: number;
  showAsPercentage?: boolean;
  icon?: string;
};

function StatRow({ label, homeValue, awayValue, showAsPercentage, icon }: StatRowProps) {
  const total = homeValue + awayValue || 1; // Avoid division by zero
  const homePercentage = (homeValue / total) * 100;
  const awayPercentage = (awayValue / total) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-400" aria-hidden="true">{icon}</span>}
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-1">
        <span className="text-white font-bold w-10 text-right">
          {homeValue}{showAsPercentage ? '%' : ''}
        </span>
        
        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div
              className="bg-orange-500 transition-all duration-300"
              style={{ width: `${homePercentage}%` }}
              aria-label={`${homePercentage.toFixed(0)}%`}
            />
            <div
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${awayPercentage}%` }}
              aria-label={`${awayPercentage.toFixed(0)}%`}
            />
          </div>
        </div>
        
        <span className="text-white font-bold w-10 text-left">
          {awayValue}{showAsPercentage ? '%' : ''}
        </span>
      </div>
    </div>
  );
}

type MatchStatisticsProps = {
  statistics: MatchStats;
  homeTeamName: string;
  awayTeamName: string;
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
        <StatRow
          label="Possession"
          homeValue={statistics.possession.home}
          awayValue={statistics.possession.away}
          showAsPercentage
          icon="⚽"
        />
        
        <StatRow
          label="Shots"
          homeValue={statistics.shots.home}
          awayValue={statistics.shots.away}
          icon="🎯"
        />
        
        <StatRow
          label="Shots on Target"
          homeValue={statistics.shotsOnTarget.home}
          awayValue={statistics.shotsOnTarget.away}
          icon="🎯"
        />
        
        <StatRow
          label="Corners"
          homeValue={statistics.corners.home}
          awayValue={statistics.corners.away}
          icon="🚩"
        />
        
        <StatRow
          label="Fouls"
          homeValue={statistics.fouls.home}
          awayValue={statistics.fouls.away}
          icon="⚠️"
        />
        
        <StatRow
          label="Yellow Cards"
          homeValue={statistics.yellowCards.home}
          awayValue={statistics.yellowCards.away}
          icon="🟨"
        />
        
        <StatRow
          label="Red Cards"
          homeValue={statistics.redCards.home}
          awayValue={statistics.redCards.away}
          icon="🟥"
        />
      </div>
    </div>
  );
}
