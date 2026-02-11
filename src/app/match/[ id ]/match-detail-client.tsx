"use client";

import { useState } from "react";
import { MatchDetail } from "@/types/match";
import MatchNotFound from "./not-found";


type Props = {
  initialMatch: MatchDetail;
};

export default function MatchDetailClient({ initialMatch }: Props) {
  const [match, setMatch] = useState(initialMatch);

  if (!match) {
    return <MatchNotFound />;
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Score Header */}
      <section className="text-center">
        <h1 className="text-lg font-semibold">
          {match.homeTeam.shortName} {match.homeScore} –{" "}
          {match.awayScore} {match.awayTeam.shortName}
        </h1>
        <p className="text-sm text-gray-500">
          {match.status} • {match.minute}
        </p>
      </section>

      {/* Events Timeline */}
      <section>
        <h2 className="font-medium mb-2">Match Events</h2>
        <ul className="space-y-2">
          {match.events.map((event) => (
            <li key={event.id} className="text-sm">
              <strong>{event.minute}</strong> — {event.description}
            </li>
          ))}
        </ul>
      </section>

      {/* Statistics */}
      <section>
        <h2 className="font-medium mb-2">Statistics</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Possession" home={match.statistics.possession.home} away={match.statistics.possession.away} suffix="%" />
          <Stat label="Shots" home={match.statistics.shots.home} away={match.statistics.shots.away} />
          <Stat label="Shots on Target" home={match.statistics.shotsOnTarget.home} away={match.statistics.shotsOnTarget.away} />
          <Stat label="Corners" home={match.statistics.corners.home} away={match.statistics.corners.away} />
          <Stat label="Fouls" home={match.statistics.fouls.home} away={match.statistics.fouls.away} />
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  home,
  away,
  suffix = "",
}: {
  label: string;
  home: number;
  away: number;
  suffix?: string;
}) {
  return (
    <div className="flex justify-between border-b pb-1">
      <span className="text-gray-500">{label}</span>
      <span>
        {home}
        {suffix} – {away}
        {suffix}
      </span>
    </div>
  );
}
