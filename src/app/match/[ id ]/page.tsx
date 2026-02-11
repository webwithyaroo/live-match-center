import { fetchMatchById } from "@/lib/api";
import { MatchDetail } from "@/types/match";
import MatchDetailClient from "./match-detail-client";
import { notFound } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function MatchDetailPage({ params }: PageProps) {
  const response = await fetchMatchById(params.id);

  if (!response || !response.data) {
    notFound();
  }

  const match: MatchDetail = response.data;

  return <MatchDetailClient initialMatch={match} />;
}
