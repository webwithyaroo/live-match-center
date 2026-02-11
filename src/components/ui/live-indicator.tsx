type LiveIndicatorProps = {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

/**
 * LiveIndicator Component
 * 
 * Displays match status with appropriate styling and animation
 */
export default function LiveIndicator({ status, size = "md", className = "" }: LiveIndicatorProps) {
  const isLive = status === "FIRST_HALF" || status === "SECOND_HALF";
  const isFinished = status === "FULL_TIME";
  const isHalfTime = status === "HALF_TIME";
  
  const sizeClass = sizeClasses[size];
  
  const getBadgeStyle = () => {
    if (isLive) {
      return "bg-red-500 text-white";
    } else if (isFinished) {
      return "bg-green-600 text-white";
    } else if (isHalfTime) {
      return "bg-yellow-500 text-black";
    } else {
      return "bg-gray-200 text-gray-700";
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
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClass} ${getBadgeStyle()} ${className}`}
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
