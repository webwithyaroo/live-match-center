"use client";

import { useEffect, useState } from "react";
import { Match, ScoreUpdatePayload, StatusChangePayload } from "@/types/match";
import { getSocket } from "@/lib/socket";
import Header from "./layout/header";
import Container from "./layout/container";
import MatchCard from "./ui/match-card";

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
    <div className="min-h-screen bg-[#0E0E10]">
      <Header connected={connected} />
      
      <main>
        <Container maxWidth="lg" className="py-8">
          <div className="mb-8">
            <h2 className="text-h1 text-white mb-2">Live Matches</h2>
            <p className="text-body text-[#9E9E9E]">
              Follow your favorite matches in real-time with live scores and updates
            </p>
          </div>

          <div className="space-y-4" role="list" aria-label="Live matches">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            
            {matches.length === 0 && (
              <div className="bg-[#1A1A1C] rounded-lg border border-[#2C2C2E] p-12 text-center">
                <div className="text-6xl mb-4">⚽</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Live Matches
                </h3>
                <p className="text-[#9E9E9E]">
                  Check back later for live football matches
                </p>
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
