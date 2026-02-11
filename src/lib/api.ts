const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function fetchMatches() {
  const res = await fetch(`${API_BASE}/api/matches`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function fetchLiveMatches() {
  const res = await fetch(`${API_BASE}/api/matches/live`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch live matches");
  return res.json();
}
export async function fetchMatchById(id: string) {
  const res = await fetch(`${API_BASE}/api/matches/${id}`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Match fetch failed:", data);
    return null; 
  }

  return data.data ?? null;
}
