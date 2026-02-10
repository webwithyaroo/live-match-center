export type Team = {
  id: string;
  name: string;
  shortName: string;
};

export type MatchStatus =
  | "NOT_STARTED"
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "FULL_TIME";

export type Match = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
  startTime: string;
};

export type MatchEvent = {
  id: string;
  type: string;
  minute: number;
  team: "home" | "away";
  player?: string;
  assistPlayer?: string;
  description: string;
  timestamp: string;
};

export type MatchStatistics = {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
};

export type MatchDetail = Match & {
  events: MatchEvent[];
  statistics: MatchStatistics;
};
