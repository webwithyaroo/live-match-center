import Link from "next/link";

export default function MatchNotFound() {
  return (
    <main className="min-h-screen bg-[#0E0E10] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl mb-4">⚽</div>
        
        <h1 className="text-2xl font-bold text-white">Match Not Found</h1>
        
        <div className="space-y-2">
          <p className="text-[#9E9E9E]">
            This match may have finished or is no longer being tracked.
          </p>
          <p className="text-sm text-[#6E6E70]">
            If you're seeing this error repeatedly, please check:
          </p>
          <ul className="text-sm text-[#6E6E70] space-y-1 text-left max-w-xs mx-auto">
            <li>• The match ID is correct</li>
            <li>• The match is currently live</li>
            <li>• Your internet connection is stable</li>
          </ul>
        </div>
        
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ← Back to Live Matches
        </Link>
        
        <div className="pt-4 border-t border-[#2C2C2E]">
          <p className="text-xs text-[#6E6E70]">
            💡 Debug tip: Check the browser console for connection logs
          </p>
        </div>
      </div>
    </main>
  );
}
