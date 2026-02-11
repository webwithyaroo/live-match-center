import Link from "next/link";

export default function MatchNotFound() {
  return (
    <main className="max-w-md mx-auto p-6 text-center space-y-4">
      <h1 className="text-xl font-bold">Match not available</h1>
      <p className="text-sm text-gray-600">
        This match may have finished or is no longer being tracked.
      </p>
      <Link
        href="/"
        className="inline-block text-blue-600 hover:underline text-sm"
      >
        Back to live matches
      </Link>
    </main>
  );
}
