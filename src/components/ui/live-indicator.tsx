type LiveIndicatorProps = {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

/**
 * LiveIndicator Component
 * 
 * Premium status indicator with glassmorphism and orange pulse animation
 */
export default function LiveIndicator({ status, size = "md", className = "" }: LiveIndicatorProps) {
  const isLive = status === "FIRST_HALF" || status === "SECOND_HALF";
  const isFinished = status === "FULL_TIME";
  const isHalfTime = status === "HALF_TIME";
  
  const sizeClass = sizeClasses[size];
  
  const getBadgeStyle = () => {
    if (isLive) {
      return "bg-[#FF5500] text-white border border-[rgba(255,85,0,0.4)] live-glow backdrop-blur-sm";
    } else if (isFinished) {
      return "bg-[#10B981] text-white border border-[rgba(16,185,129,0.4)] backdrop-blur-sm";
    } else if (isHalfTime) {
      return "bg-[#EAB308] text-black border border-[rgba(234,179,8,0.4)] backdrop-blur-sm";
    } else {
      return "bg-[#6B7280] text-white border border-[rgba(107,114,128,0.4)] backdrop-blur-sm";
    }
  };
  
  const getStatusText = () => {
    if (status === "NOT_STARTED") return "Upcoming";
    if (status === "FIRST_HALF") return "LIVE";
    if (status === "SECOND_HALF") return "LIVE";
    if (status === "HALF_TIME") return "HT";
    if (status === "FULL_TIME") return "FT";
    return status;
  };
  
  return (
    <span 
      className={`inline-flex items-center gap-2 font-semibold rounded-full ${sizeClass} ${getBadgeStyle()} ${className}`}
      role="status"
      aria-live={isLive ? "polite" : "off"}
    >
      {isLive && (
        <span 
          className="w-2 h-2 bg-white rounded-full live-dot"
          aria-hidden="true"
        />
      )}
      {getStatusText()}
    </span>
  );
}
