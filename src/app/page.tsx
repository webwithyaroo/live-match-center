import HomeClient from "@/components/home-client";
import { fetchMatches } from "@/lib/api";
import { Match } from "@/types/match";

export const dynamic = "force-dynamic";

// Mock data for development when API is unavailable
const mockMatches: Match[] = [
  {
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
    startTime: new Date().toISOString()
  },
  {
    id: "2",
    homeTeam: {
      id: "LIV",
      name: "Liverpool",
      shortName: "Liverpool",
      logo: ""
    },
    awayTeam: {
      id: "CHE",
      name: "Chelsea",
      shortName: "Chelsea",
      logo: ""
    },
    homeScore: 0,
    awayScore: 0,
    status: "FIRST_HALF",
    minute: 23,
    startTime: new Date().toISOString()
  },
  {
    id: "3",
    homeTeam: {
      id: "ARS",
      name: "Arsenal",
      shortName: "Arsenal",
      logo: ""
    },
    awayTeam: {
      id: "TOT",
      name: "Tottenham",
      shortName: "Spurs",
      logo: ""
    },
    homeScore: 3,
    awayScore: 2,
    status: "FULL_TIME",
    minute: 90,
    startTime: new Date().toISOString()
  }
];

async function getMatches(): Promise<Match[]> {
  try {
    const data = await fetchMatches();
    return data.matches;
  } catch {
    // Use mock data when API is unavailable
    return mockMatches;
  }
}

export default async function HomePage() {
  const matches = await getMatches();
  return <HomeClient initialMatches={matches} />;
}
