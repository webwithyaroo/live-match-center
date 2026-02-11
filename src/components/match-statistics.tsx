import { MatchStats } from "@/types/match";
import StatBar from "./ui/stat-bar";
import { Activity, Target, Flag, AlertTriangle, Square } from "lucide-react";

type MatchStatisticsProps = {
  statistics: MatchStats;
};

/**
 * MatchStatistics Component
 * 
 * Premium statistics display with dark theme and orange accents
 */
export default function MatchStatistics({
  statistics,
}: MatchStatisticsProps) {

  return (
    <div 
      className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-lg p-6"
      role="region"
      aria-label="Match Statistics"
    >
      <h3 className="font-bold text-2xl mb-6 text-white flex items-center gap-2">
        <Activity className="w-6 h-6 text-[#FF5500]" aria-hidden="true" />
        Match Statistics
      </h3>

      <div className="space-y-4">
        <StatBar
          label="Possession"
          homeValue={statistics.possession.home}
          awayValue={statistics.possession.away}
          showAsPercentage
          icon={<Activity className="w-4 h-4" />}
        />
        
        <StatBar
          label="Shots"
          homeValue={statistics.shots.home}
          awayValue={statistics.shots.away}
          icon={<Target className="w-4 h-4" />}
        />
        
        <StatBar
          label="Shots on Target"
          homeValue={statistics.shotsOnTarget.home}
          awayValue={statistics.shotsOnTarget.away}
          icon={<Target className="w-4 h-4" />}
        />
        
        <StatBar
          label="Corners"
          homeValue={statistics.corners.home}
          awayValue={statistics.corners.away}
          icon={<Flag className="w-4 h-4" />}
        />
        
        <StatBar
          label="Fouls"
          homeValue={statistics.fouls.home}
          awayValue={statistics.fouls.away}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        
        <StatBar
          label="Yellow Cards"
          homeValue={statistics.yellowCards.home}
          awayValue={statistics.yellowCards.away}
          icon={<Square className="w-4 h-4 text-yellow-400" fill="currentColor" />}
        />
        
        <StatBar
          label="Red Cards"
          homeValue={statistics.redCards.home}
          awayValue={statistics.redCards.away}
          icon={<Square className="w-4 h-4 text-red-500" fill="currentColor" />}
        />
      </div>
    </div>
  );
}
