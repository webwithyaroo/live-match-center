"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

type MatchEvent = {
  type?: string;
  player?: string;
  minute?: number;
  matchId?: string | number;
};

type Match = {
  id: string | number;
  homeScore: number;
  awayScore: number;
  events?: Array<MatchEvent>;
  statistics?: Record<string, unknown>;
  status?: string;
  minute?: number;
};

type Props = {
  initialMatch: Match;
};

export default function MatchDetailClient({ initialMatch }: Props) {
  const [match, setMatch] = useState(initialMatch);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.emit("subscribe_match", { matchId: match.id });

    socket.on("score_update", (payload) => {
      if (payload.matchId !== match.id) return;

      setMatch((prev: Match) => ({
        ...prev,
        homeScore: payload.homeScore,
        awayScore: payload.awayScore,
      }));
    });

    socket.on("match_event", (event) => {
      if (event.matchId !== match.id) return;

      setMatch((prev: Match) => ({
        ...prev,
        events: [event, ...(prev.events ?? [])],
      }));
    });

    socket.on("stats_update", (payload) => {
      if (payload.matchId !== match.id) return;

      setMatch((prev: Match) => ({
        ...prev,
        statistics: payload.statistics,
      }));
    });

    socket.on("status_change", (payload) => {
      if (payload.matchId !== match.id) return;

      setMatch((prev: Match) => ({
        ...prev,
        status: payload.status,
        minute: payload.minute,
      }));
    });

    return () => {
      socket.emit("unsubscribe_match", { matchId: match.id });

      socket.off("score_update");
      socket.off("match_event");
      socket.off("stats_update");
      socket.off("status_change");
    };
  }, [match.id]);

  return (
    <div>
      <p className="text-xs text-gray-500">
        {connected ? "🟢 Live updates connected" : "🔴 Reconnecting..."}
      </p>

      {/* render score, timeline, stats here */}
      <div>
        <h2 className="text-lg font-bold">Score</h2>
          {match.events?.map((event, index) => (
            <li key={index}>{`${event.type ?? ''}: ${event.player ?? ''} (${event.minute ?? ''})`}</li>
          ))}
      </div>
      <div>
        <h2 className="text-lg font-bold">Timeline</h2>
        <ul>
          {match.events?.map((event, index) => (
            <li key={index}>{event.type}: {event.player} ({event.minute})</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-bold">Statistics</h2>
        <pre>{JSON.stringify(match.statistics, null, 2)}</pre>
      </div>
    </div>
  );
}
