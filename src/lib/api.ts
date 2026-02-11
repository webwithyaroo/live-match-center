import { MatchesListResponse, MatchDetail } from "@/types/match";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://profootball.srv883830.hstgr.cloud";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`API error ${res.status}: ${text}`),
      { status: res.status }
    );
  }

  const json = (await res.json()) as { success: boolean; data: T };

  if (!json.success) {
    throw new Error("API returned success: false");
  }

  return json.data;
}

export async function fetchMatches(): Promise<MatchesListResponse> {
  const res = await fetch(`${API_BASE}/api/matches`, {
    cache: "no-store",
  });

  return handleResponse<MatchesListResponse>(res);
}

export async function fetchLiveMatches(): Promise<MatchesListResponse> {
  const res = await fetch(`${API_BASE}/api/matches/live`, {
    cache: "no-store",
  });

  return handleResponse<MatchesListResponse>(res);
}

export async function fetchMatchById(id: string): Promise<MatchDetail> {
  if (!id) throw new Error("fetchMatchById called with empty id");

  const res = await fetch(
    `${API_BASE}/api/matches/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  return handleResponse<MatchDetail>(res);
}
