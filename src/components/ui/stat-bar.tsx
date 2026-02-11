import { ReactNode } from "react";

type StatBarProps = {
  label: string;
  homeValue: number;
  awayValue: number;
  homeColor?: string;
  awayColor?: string;
  showAsPercentage?: boolean;
  icon?: ReactNode;
};

/**
 * StatBar Component
 * 
 * Visual statistic comparison bar for match statistics
 */
export default function StatBar({ 
  label, 
  homeValue, 
  awayValue, 
  homeColor = "#f97316", 
  awayColor = "#0ea5e9",
  showAsPercentage = false,
  icon 
}: StatBarProps) {
  const total = Math.max(homeValue + awayValue, 1); // Ensure at least 1 to avoid division by zero
  const homePercentage = (homeValue / total) * 100;
  const awayPercentage = (awayValue / total) * 100;
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-center mb-3">
        {icon && <span className="mr-2 text-gray-400" aria-hidden="true">{icon}</span>}
        <span className="text-sm font-semibold text-gray-300">{label}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span 
          className="text-white font-bold w-16 text-right tabular-nums"
          aria-label={`Home: ${homeValue}${showAsPercentage ? '%' : ''}`}
        >
          {homeValue}{showAsPercentage ? '%' : ''}
        </span>
        
        <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div
              className="transition-all duration-500 ease-out"
              style={{ 
                width: `${homePercentage}%`,
                backgroundColor: homeColor
              }}
              aria-hidden="true"
            />
            <div
              className="transition-all duration-500 ease-out"
              style={{ 
                width: `${awayPercentage}%`,
                backgroundColor: awayColor
              }}
              aria-hidden="true"
            />
          </div>
        </div>
        
        <span 
          className="text-white font-bold w-16 text-left tabular-nums"
          aria-label={`Away: ${awayValue}${showAsPercentage ? '%' : ''}`}
        >
          {awayValue}{showAsPercentage ? '%' : ''}
        </span>
      </div>
    </div>
  );
}
