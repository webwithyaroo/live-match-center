import MatchDetailClient from "./match-detail-client";
import { fetchMatchById } from "@/lib/api";
import { notFound } from "next/navigation";
import { MatchDetail } from "@/types/match";

function isMatchDetail(data: unknown): data is MatchDetail {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.homeTeam === "object" &&
    typeof obj.awayTeam === "object" &&
    typeof obj.homeScore === "number" &&
    typeof obj.awayScore === "number" &&
    typeof obj.status === "string" &&
    Array.isArray(obj.events) &&
    typeof obj.statistics === "object"
  );
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

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
}

