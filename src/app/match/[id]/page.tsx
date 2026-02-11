import MatchDetailClient from "./match-detail-client";
import { fetchMatchById } from "@/lib/api";
import { notFound } from "next/navigation";
import { isMatchDetail } from "@/lib/type-guards";
import { MatchDetail } from "@/types/match";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Team pool for generating realistic match-ups
const TEAM_POOL = [
  { id: "MU", name: "Manchester United", shortName: "Man Utd" },
  { id: "MC", name: "Manchester City", shortName: "Man City" },
  { id: "LIV", name: "Liverpool", shortName: "Liverpool" },
  { id: "ARS", name: "Arsenal", shortName: "Arsenal" },
  { id: "CHE", name: "Chelsea", shortName: "Chelsea" },
  { id: "TOT", name: "Tottenham Hotspur", shortName: "Spurs" },
  { id: "NEW", name: "Newcastle United", shortName: "Newcastle" },
  { id: "AVL", name: "Aston Villa", shortName: "Villa" },
  { id: "WHU", name: "West Ham United", shortName: "West Ham" },
  { id: "BHA", name: "Brighton & Hove Albion", shortName: "Brighton" },
];

const PLAYER_POOL = [
  "Marcus Rashford", "Bruno Fernandes", "Erling Haaland", "Kevin De Bruyne",
  "Mohamed Salah", "Darwin Nunez", "Bukayo Saka", "Martin Odegaard",
  "Raheem Sterling", "Cole Palmer", "Son Heung-min", "James Maddison",
  "Alexander Isak", "Anthony Gordon", "Ollie Watkins", "John McGinn",
];

// Generate dynamic mock data based on match ID
function generateMockMatchDetail(id: string): MatchDetail {
  // Use ID as seed for deterministic randomness
  const seed = parseInt(id) || id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Select teams based on seed
  const homeTeamIndex = seed % TEAM_POOL.length;
  const awayTeamIndex = (seed * 3 + 5) % TEAM_POOL.length;
  
  const homeTeam = TEAM_POOL[homeTeamIndex];
  const awayTeam = TEAM_POOL[awayTeamIndex === homeTeamIndex ? (awayTeamIndex + 1) % TEAM_POOL.length : awayTeamIndex];
  
  // Generate scores (0-3 goals each)
  const homeScore = Math.floor((seed * 7) % 4);
  const awayScore = Math.floor((seed * 11) % 4);
  
  // Determine match status
  const statusOptions: Array<"FIRST_HALF" | "HALF_TIME" | "SECOND_HALF" | "FULL_TIME"> = 
    ["FIRST_HALF", "SECOND_HALF", "HALF_TIME", "FULL_TIME"];
  const status = statusOptions[seed % statusOptions.length];
  
  // Generate minute based on status
  let minute = 0;
  if (status === "FIRST_HALF") minute = 15 + (seed % 30);
  else if (status === "HALF_TIME") minute = 45;
  else if (status === "SECOND_HALF") minute = 46 + (seed % 44);
  else minute = 90;
  
  // Generate events based on goals scored
  const events: MatchDetail["events"] = [];
  let eventId = 1;
  
  // Add goal events for home team
  for (let i = 0; i < homeScore; i++) {
    const goalMinute = Math.floor(10 + ((seed + i * 17) % Math.max(minute - 10, 1)));
    const playerIndex = (seed + i * 3) % PLAYER_POOL.length;
    const assistIndex = (seed + i * 5 + 1) % PLAYER_POOL.length;
    
    events.push({
      id: String(eventId++),
      minute: goalMinute,
      type: "GOAL",
      player: PLAYER_POOL[playerIndex],
      assistPlayer: assistIndex !== playerIndex ? PLAYER_POOL[assistIndex] : undefined,
      team: "home",
      description: "Goal",
      timestamp: new Date(Date.now() - (minute - goalMinute) * 60000).toISOString()
    });
  }
  
  // Add goal events for away team
  for (let i = 0; i < awayScore; i++) {
    const goalMinute = Math.floor(10 + ((seed + i * 23) % Math.max(minute - 10, 1)));
    const playerIndex = (seed + i * 7) % PLAYER_POOL.length;
    const assistIndex = (seed + i * 11 + 1) % PLAYER_POOL.length;
    
    events.push({
      id: String(eventId++),
      minute: goalMinute,
      type: "GOAL",
      player: PLAYER_POOL[playerIndex],
      assistPlayer: assistIndex !== playerIndex ? PLAYER_POOL[assistIndex] : undefined,
      team: "away",
      description: "Goal",
      timestamp: new Date(Date.now() - (minute - goalMinute) * 60000).toISOString()
    });
  }
  
  // Add some cards based on seed
  const yellowCards = (seed % 3);
  for (let i = 0; i < yellowCards; i++) {
    const cardMinute = Math.floor(20 + ((seed + i * 31) % Math.max(minute - 20, 1)));
    const playerIndex = (seed + i * 13) % PLAYER_POOL.length;
    const team = i % 2 === 0 ? "home" : "away";
    
    events.push({
      id: String(eventId++),
      minute: cardMinute,
      type: "YELLOW_CARD",
      player: PLAYER_POOL[playerIndex],
      team,
      description: "Yellow Card",
      timestamp: new Date(Date.now() - (minute - cardMinute) * 60000).toISOString()
    });
  }
  
  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);
  
  return {
    id,
    homeTeam: { ...homeTeam, logo: "" },
    awayTeam: { ...awayTeam, logo: "" },
    homeScore,
    awayScore,
    status,
    minute,
    startTime: new Date(Date.now() - minute * 60000).toISOString(),
    events,
    statistics: {
      possession: { 
        home: 40 + (seed % 20), 
        away: 60 - (seed % 20)
      },
      shots: { 
        home: 5 + (seed % 10), 
        away: 8 + ((seed * 3) % 10) 
      },
      shotsOnTarget: { 
        home: 2 + (seed % 5), 
        away: 3 + ((seed * 3) % 5) 
      },
      corners: { 
        home: 2 + (seed % 6), 
        away: 3 + ((seed * 3) % 6) 
      },
      fouls: { 
        home: 8 + (seed % 8), 
        away: 6 + ((seed * 3) % 8) 
      },
      yellowCards: { 
        home: events.filter(e => e.type === "YELLOW_CARD" && e.team === "home").length, 
        away: events.filter(e => e.type === "YELLOW_CARD" && e.team === "away").length
      },
      redCards: { home: 0, away: 0 }
    }
  };
}

async function getMatchDetail(id: string): Promise<MatchDetail | null> {
  try {
    const res = await fetchMatchById(id);

    if (isMatchDetail(res)) {
      console.log(`✅ Fetched match ${id} from API`);
      return res;
    }
    
    if (res && typeof res === "object") {
      const r = res as Record<string, unknown>;
      const data = r.data as Record<string, unknown> | undefined;

      if (data && "match" in data && isMatchDetail(data.match)) {
        console.log(`✅ Fetched match ${id} from API (nested)`);
        return data.match;
      }
      if ("match" in r && isMatchDetail(r.match)) {
        console.log(`✅ Fetched match ${id} from API (nested)`);
        return r.match;
      }
    }
    
    console.log(`⚠️ API returned invalid data for match ${id}, using mock data`);
    return generateMockMatchDetail(id);
  } catch (error) {
    // Use dynamic mock data when API is unavailable
    console.log(`⚠️ API unavailable for match ${id}, using mock data:`, error);
    return generateMockMatchDetail(id);
  }
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const match = await getMatchDetail(id);

  if (!match) return notFound();

  return <MatchDetailClient initialMatch={match} />;
}

