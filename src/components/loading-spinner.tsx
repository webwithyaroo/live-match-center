/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner with orange theme matching the app's color scheme.
 * Includes proper accessibility attributes for screen readers.
 */

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function LoadingSpinner({ 
  size = "md", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        className={`${sizeClasses[size]} border-orange-600 border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
