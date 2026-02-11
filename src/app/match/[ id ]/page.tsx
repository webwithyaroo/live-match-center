
import MatchDetailClient from "./match-detail-client";
import { fetchMatchById } from "@/lib/api";

import { notFound } from "next/navigation";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await fetchMatchById(params.id);

  if (!match) notFound();

  return <MatchDetailClient initialMatch={match} />;
}

