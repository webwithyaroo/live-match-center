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
 * Premium visual statistic comparison with gradient bars
 */
export default function StatBar({ 
  label, 
  homeValue, 
  awayValue, 
  homeColor = "linear-gradient(90deg, #FF5500 0%, #FF8800 100%)", 
  awayColor = "linear-gradient(90deg, #4B5563 0%, #6B7280 100%)",
  showAsPercentage = false,
  icon 
}: StatBarProps) {
  const total = Math.max(homeValue + awayValue, 1);
  const homePercentage = (homeValue / total) * 100;
  const awayPercentage = (awayValue / total) * 100;
  
  return (
    <div className="py-3">
      <div className="flex items-center justify-center mb-3">
        {icon && <span className="mr-2 text-[#9E9E9E]" aria-hidden="true">{icon}</span>}
        <span className="text-sm font-medium text-[#9E9E9E]">{label}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span 
          className="text-white font-bold w-16 text-right tabular-nums"
          aria-label={`Home: ${homeValue}${showAsPercentage ? '%' : ''}`}
        >
          {homeValue}{showAsPercentage ? '%' : ''}
        </span>
        
        <div className="flex-1 h-3 bg-[#0E0E10] rounded-full overflow-hidden backdrop-blur-sm">
          <div className="flex h-full">
            <div
              className="transition-all duration-500 ease-out"
              style={{ 
                width: `${homePercentage}%`,
                background: homeColor
              }}
              aria-hidden="true"
            />
            <div
              className="transition-all duration-500 ease-out"
              style={{ 
                width: `${awayPercentage}%`,
                background: awayColor
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
