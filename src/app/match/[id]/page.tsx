import MatchDetailClient from "./match-detail-client";
import { fetchMatchById } from "@/lib/api";
import { notFound } from "next/navigation";
import { isMatchDetail } from "@/lib/type-guards";
import { MatchDetail } from "@/types/match";

// Mock data for development
const mockMatchDetail: MatchDetail = {
  id: "1",
  homeTeam: {
    id: "MU",
    name: "Manchester United",
    shortName: "Man Utd",
    logo: ""
  },
  awayTeam: {
    id: "MC",
    name: "Manchester City",
    shortName: "Man City",
    logo: ""
  },
  homeScore: 2,
  awayScore: 1,
  status: "SECOND_HALF",
  minute: 78,
  league: "Premier League",
  events: [
    {
      id: "1",
      minute: 12,
      type: "GOAL",
      player: "Marcus Rashford",
      assistPlayer: "Bruno Fernandes",
      team: "home"
    },
    {
      id: "2",
      minute: 34,
      type: "GOAL",
      player: "Erling Haaland",
      team: "away"
    },
    {
      id: "3",
      minute: 67,
      type: "GOAL",
      player: "Casemiro",
      assistPlayer: "Christian Eriksen",
      team: "home"
    },
    {
      id: "4",
      minute: 45,
      type: "YELLOW_CARD",
      player: "Rodri",
      team: "away"
    }
  ],
  statistics: {
    possession: { home: 48, away: 52 },
    shots: { home: 12, away: 15 },
    shotsOnTarget: { home: 6, away: 7 },
    corners: { home: 5, away: 8 },
    fouls: { home: 11, away: 9 },
    yellowCards: { home: 0, away: 1 },
    redCards: { home: 0, away: 0 }
  }
};

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  try {
    const res = await fetchMatchById(id);

    const match = (() => {
      if (isMatchDetail(res)) {
        return res;
      }
      
      if (res && typeof res === "object") {
        const r = res as Record<string, unknown>;
        const data = r.data as Record<string, unknown> | undefined;

        if (data && "match" in data && isMatchDetail(data.match)) {
          return data.match;
        }
        if ("match" in r && isMatchDetail(r.match)) {
          return r.match;
        }
      }
      
      return null;
    })();

    if (!match) return notFound();

    return <MatchDetailClient initialMatch={match} />;
  } catch (error) {
    // Use mock data when API is unavailable
    return <MatchDetailClient initialMatch={mockMatchDetail} />;
  }
}

