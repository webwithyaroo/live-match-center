import MatchDetailClient from "./match-detail-client";
import { fetchMatchById } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const res = await fetchMatchById(id);

  const match = (() => {
    if (res && typeof res === "object") {
      const r = res as Record<string, unknown>;
      const data = r.data as Record<string, unknown> | undefined;

      if (data && "match" in data) return data.match;
      if ("match" in r) return r.match;
    }
    return res;
  })();

  if (!match) return notFound();

  return <MatchDetailClient initialMatch={match as any} />;
}

