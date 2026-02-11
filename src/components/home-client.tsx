"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Match, ScoreUpdatePayload, StatusChangePayload } from "@/types/match";
import { getSocket } from "@/lib/socket";

type Props = {
  initialMatches: Match[];
};

export default function HomeClient({ initialMatches }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    function handleConnect() {
      setConnected(true);
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleScoreUpdate(payload: ScoreUpdatePayload) {
      setMatches((prev) =>
        prev.map((match) =>
          match.id === payload.matchId
            ? {
                ...match,
                homeScore: payload.homeScore,
                awayScore: payload.awayScore,
              }
            : match,
        ),
      );
    }

    function handleStatusChange(payload: StatusChangePayload) {
      setMatches((prev) =>
        prev.map((match) =>
          match.id === payload.matchId
            ? {
                ...match,
                status: payload.status,
                minute: payload.minute,
              }
            : match,
        ),
      );
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("score_update", handleScoreUpdate);
    socket.on("status_change", handleStatusChange);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("score_update", handleScoreUpdate);
      socket.off("status_change", handleStatusChange);
    };
  }, []);

  return (
    <main className="max-w-full bg-black/100 min-h-screen">
  
     
      <section className="max-w-5xl mx-auto p-4">
        <div className="flex flex-col justify-between items-center mb-4">
          <span
            className={`text-xs font-medium ${
              connected ? "text-green-600" : "text-red-600"
            }`}
            role="status"
            aria-live="polite"
            aria-label={connected ? "Connected to live updates" : "Reconnecting to live updates"}
          >
            {connected ? "🟢 Connected" : "🔴 Reconnecting..."}
          </span>
          <h1 className="text-5xl max-sm:text-2xl font-bold">
            Live Match Center
          </h1>
        </div>

        <ul className="space-y-3" role="list" aria-label="Live matches">
          {matches.map((match) => {
            const isLive =
              match.status === "FIRST_HALF" || match.status === "SECOND_HALF";

            return (
              <li
                key={match.id}
                className={`bg-white/10 rounded-sm p-4 flex justify-between items-center transition ${
                  isLive ? "border-green-500 bg-green-50" : ""
                }`}
                role="listitem"
              >
                <div>
                  <p className="font-semibold">
                    {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                  </p>

                  <p
                    className={`text-sm ${
                      isLive ? "text-orange-600 font-medium" : "text-gray-500"
                    }`}
                    role="status"
                    aria-live={isLive ? "polite" : "off"}
                  >
                    {match.status.replace("_", " ")} · {match.minute}&apos;
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span 
                    className="text-lg font-bold"
                    aria-label={`Score: ${match.homeTeam.shortName} ${match.homeScore}, ${match.awayTeam.shortName} ${match.awayScore}`}
                  >
                    {match.homeScore} : {match.awayScore}
                  </span>

                  <Link
                    href={`/match/${match.id}`}
                    className="text-sm text-orange-600 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                    aria-label={`View details for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
                  >
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
