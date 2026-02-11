import { fetchMatchById } from "@/lib/api";
import { MatchDetail } from "@/types/match";
import Link from "next/link";

type PageProps = {
  params: { id: string };
};

export default async function MatchDetailPage({ params }: PageProps) {
  const response = await fetchMatchById(params.id);
  const match: MatchDetail = response.data;

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back to matches
      </Link>

      {/* Header */}
      <section className="border rounded-lg p-4">
        <h1 className="text-xl font-bold mb-2">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold">
            {match.homeScore} : {match.awayScore}
          </span>

          <span className="text-sm text-gray-600">
            {match.status.replace("_", " ")} · {match.minute}
          </span>
        </div>
      </section>

      {/* Events */}
      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Match Events</h2>

        {match.events.length === 0 ? (
          <p className="text-sm text-gray-500">No events yet.</p>
        ) : (
          <ul className="space-y-2">
            {match.events.map((event) => (
              <li key={event.id} className="text-sm">
                <span className="font-medium">{event.minute}</span>{" "}
                <span className="ml-2">{event.description}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Statistics */}
      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Statistics</h2>

        <ul className="grid grid-cols-2 gap-2 text-sm">
          <StatRow
            label="Possession"
            home={`${match.statistics.possession.home}%`}
            away={`${match.statistics.possession.away}%`}
          />
          <StatRow
            label="Shots"
            home={match.statistics.shots.home}
            away={match.statistics.shots.away}
          />
          <StatRow
            label="Shots on Target"
            home={match.statistics.shotsOnTarget.home}
            away={match.statistics.shotsOnTarget.away}
          />
          <StatRow
            label="Corners"
            home={match.statistics.corners.home}
            away={match.statistics.corners.away}
          />
          <StatRow
            label="Fouls"
            home={match.statistics.fouls.home}
            away={match.statistics.fouls.away}
          />
          <StatRow
            label="Yellow Cards"
            home={match.statistics.yellowCards.home}
            away={match.statistics.yellowCards.away}
          />
          <StatRow
            label="Red Cards"
            home={match.statistics.redCards.home}
            away={match.statistics.redCards.away}
          />
        </ul>
      </section>
    </main>
  );
}

function StatRow({
  label,
  home,
  away,
}: {
  label: string;
  home: number | string;
  away: number | string;
}) {
  return (
    <>
      <span>{label}</span>
      <span className="text-right">
        {home} – {away}
      </span>
    </>
  );
}
