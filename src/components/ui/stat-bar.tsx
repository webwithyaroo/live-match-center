type StatBarProps = {
  label: string;
  homeValue: number;
  awayValue: number;
  homeColor?: string;
  awayColor?: string;
  showAsPercentage?: boolean;
  icon?: string;
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
  const total = homeValue + awayValue || 1;
  const homePercentage = (homeValue / total) * 100;
  const awayPercentage = (awayValue / total) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-center mb-2">
        {icon && <span className="mr-2 text-gray-400" aria-hidden="true">{icon}</span>}
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span 
          className="text-white font-bold w-12 text-right"
          aria-label={`Home: ${homeValue}${showAsPercentage ? '%' : ''}`}
        >
          {homeValue}{showAsPercentage ? '%' : ''}
        </span>
        
        <div className="flex-1 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div
              className="transition-all duration-300"
              style={{ 
                width: `${homePercentage}%`,
                backgroundColor: homeColor
              }}
              aria-hidden="true"
            />
            <div
              className="transition-all duration-300"
              style={{ 
                width: `${awayPercentage}%`,
                backgroundColor: awayColor
              }}
              aria-hidden="true"
            />
          </div>
        </div>
        
        <span 
          className="text-white font-bold w-12 text-left"
          aria-label={`Away: ${awayValue}${showAsPercentage ? '%' : ''}`}
        >
          {awayValue}{showAsPercentage ? '%' : ''}
        </span>
      </div>
    </div>
  );
}
