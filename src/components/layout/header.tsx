import Link from "next/link";

type HeaderProps = {
  showBack?: boolean;
  title?: string;
  connected?: boolean;
};

/**
 * Header Component
 * 
 * Premium dark header with backdrop blur and orange accents
 */
export default function Header({ showBack = false, title, connected }: HeaderProps) {
  return (
    <header className="bg-[#1A1A1C] border-b border-[#2C2C2E] sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <Link 
                href="/"
                className="flex items-center gap-2 text-[#9E9E9E] hover:text-[#FF5500] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5500] rounded px-2 py-1"
                aria-label="Back to home"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
                <span className="font-medium hidden sm:inline">Back</span>
              </Link>
            )}
            
            <Link 
              href="/"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FF5500] rounded"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF5500] to-[#FF8800] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚽</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  {title || "Live Match Center"}
                </h1>
              </div>
            </Link>
          </div>
          
          {typeof connected === 'boolean' && (
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${connected ? "bg-[#FF5500]" : "bg-[#6B7280]"} ${connected ? "live-dot" : ""}`}
                aria-hidden="true"
              />
              <span 
                className={`text-xs sm:text-sm font-medium ${
                  connected ? "text-[#FF5500]" : "text-[#9E9E9E]"
                }`}
                role="status"
                aria-live="polite"
              >
                {connected ? "Live" : "Reconnecting"}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
