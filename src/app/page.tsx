import { fetchMatches } from "@/lib/api";
import { Match } from "@/types/match";
import Link from "next/link";

export default async function HomePage() {
  const response = await fetchMatches();
  const matches: Match[] = response.data.matches;

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Live Match Center</h1>

      <ul className="space-y-3">
        {matches.map((match) => (
          <li
            key={match.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {match.homeTeam.shortName} vs {match.awayTeam.shortName}
              </p>
              <p
  className={`text-sm ${
    match.status === "FIRST_HALF" || match.status === "SECOND_HALF"
      ? "text-green-600 font-medium"
      : "text-gray-500"
  }`}
>
  {match.status.replace("_", " ")} · {match.minute}
</p>

            </div>

            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">
                {match.homeScore} : {match.awayScore}
              </span>

              <Link
                href={`/match/${match.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
