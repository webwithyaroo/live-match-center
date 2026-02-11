// src/types/match.ts

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

// Basic match info
export type Match = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
  startTime: string;
  events?: MatchEvent[]; // optional for list view
  statistics?: MatchStats; // optional for list view
};

// Detailed match including timeline and stats
export type MatchDetail = Match & {
  events: MatchEvent[];
  statistics: MatchStats;
};

// Individual events in a match
export type MatchEvent = {
  id: string;
  type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "FOUL" | "SHOT";
  minute: number;
  team: "home" | "away";
  player?: string;
  assistPlayer?: string;
  description: string;
  timestamp: string;
};

// Statistics object
export type MatchStats = {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
};

// Matches list response from /api/matches
export type MatchesListResponse = {
  matches: Match[];
  total?: number;
};

/**
 * Socket.IO payload types
 */
export type ScoreUpdatePayload = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

export type MatchEventPayload = MatchEvent & {
  matchId: string;
};

export type StatsUpdatePayload = {
  matchId: string;
  statistics: MatchStats;
};

export type StatusChangePayload = {
  matchId: string;
  status: MatchStatus;
  minute: number;
};
