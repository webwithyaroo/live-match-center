import HomeClient from "@/components/home-client";
import { fetchMatches } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await fetchMatches();
  return <HomeClient initialMatches={data.matches} />;
}
