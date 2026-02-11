import { Match, MatchDetail, MatchEvent, MatchStats, Team } from "@/types/match";

/**
 * Type guard to check if an unknown value is a Team object
 */
export function isTeam(data: unknown): data is Team {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.shortName === "string"
  );
}

/**
 * Type guard to check if an unknown value is a MatchStats object
 */
export function isMatchStats(data: unknown): data is MatchStats {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  
  const hasValidStat = (stat: unknown): boolean => {
    if (!stat || typeof stat !== "object") return false;
    const s = stat as Record<string, unknown>;
    return typeof s.home === "number" && typeof s.away === "number";
  };

  return (
    hasValidStat(obj.possession) &&
    hasValidStat(obj.shots) &&
    hasValidStat(obj.shotsOnTarget) &&
    hasValidStat(obj.corners) &&
    hasValidStat(obj.fouls) &&
    hasValidStat(obj.yellowCards) &&
    hasValidStat(obj.redCards)
  );
}

/**
 * Type guard to check if an unknown value is a MatchEvent object
 */
export function isMatchEvent(data: unknown): data is MatchEvent {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  
  const validTypes = ["GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION", "FOUL", "SHOT"];
  const validTeams = ["home", "away"];
  
  return (
    typeof obj.id === "string" &&
    typeof obj.type === "string" &&
    validTypes.includes(obj.type) &&
    typeof obj.minute === "number" &&
    typeof obj.team === "string" &&
    validTeams.includes(obj.team) &&
    typeof obj.description === "string" &&
    typeof obj.timestamp === "string" &&
    (obj.player === undefined || typeof obj.player === "string") &&
    (obj.assistPlayer === undefined || typeof obj.assistPlayer === "string")
  );
}

/**
 * Type guard to check if an unknown value is a Match object
 */
export function isMatch(data: unknown): data is Match {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  
  const validStatuses = ["NOT_STARTED", "FIRST_HALF", "HALF_TIME", "SECOND_HALF", "FULL_TIME"];
  
  return (
    typeof obj.id === "string" &&
    isTeam(obj.homeTeam) &&
    isTeam(obj.awayTeam) &&
    typeof obj.homeScore === "number" &&
    typeof obj.awayScore === "number" &&
    typeof obj.minute === "number" &&
    typeof obj.status === "string" &&
    validStatuses.includes(obj.status) &&
    typeof obj.startTime === "string" &&
    (obj.events === undefined || Array.isArray(obj.events)) &&
    (obj.statistics === undefined || isMatchStats(obj.statistics))
  );
}

/**
 * Type guard to check if an unknown value is a MatchDetail object
 * MatchDetail extends Match and requires events and statistics
 */
export function isMatchDetail(data: unknown): data is MatchDetail {
  if (!isMatch(data)) return false;
  const obj = data as Record<string, unknown>;
  
  return (
    Array.isArray(obj.events) &&
    obj.events.every(isMatchEvent) &&
    isMatchStats(obj.statistics)
  );
}
