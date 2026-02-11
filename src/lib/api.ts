import { MatchesListResponse, MatchDetail } from "@/types/match";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://profootball.srv883830.hstgr.cloud";

const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Delays execution for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches a URL with timeout support
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    // Type guard: check if error is an abort error
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timeout - server took too long to respond");
    }
    throw error;
  }
}

/**
 * Handles API response parsing and error handling
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const errorMessage = text || `HTTP ${res.status}: ${res.statusText}`;
    throw Object.assign(
      new Error(`API error: ${errorMessage}`),
      { status: res.status }
    );
  }

  let json: { success: boolean; data: T };
  
  try {
    json = await res.json() as { success: boolean; data: T };
  } catch (error) {
    throw new Error("Invalid JSON response from server");
  }

  if (!json.success) {
    throw new Error("API returned success: false");
  }

  return json.data;
}

/**
 * Fetches data with automatic retry on failure
 * Uses exponential backoff for retries
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options);
      return await handleResponse<T>(res);
    } catch (err) {
      lastError = err as Error;
      
      // Don't retry on 4xx errors (client errors)
      if ((err as { status?: number }).status && 
          (err as { status?: number }).status! >= 400 && 
          (err as { status?: number }).status! < 500) {
        throw err;
      }

      // Don't retry if we've exhausted our attempts
      if (attempt === retries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delayMs = RETRY_DELAY * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }

  throw new Error(
    `Failed after ${retries + 1} attempts: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Fetches all matches from the API
 */
export async function fetchMatches(): Promise<MatchesListResponse> {
  return fetchWithRetry<MatchesListResponse>(
    `${API_BASE}/api/matches`,
    { cache: "no-store" }
  );
}

/**
 * Fetches only live matches from the API
 */
export async function fetchLiveMatches(): Promise<MatchesListResponse> {
  return fetchWithRetry<MatchesListResponse>(
    `${API_BASE}/api/matches/live`,
    { cache: "no-store" }
  );
}

/**
 * Fetches detailed match information by ID
 * @throws Error if id is empty or match is not found
 */
export async function fetchMatchById(id: string): Promise<MatchDetail> {
  if (!id) {
    throw new Error("Match ID is required");
  }

  return fetchWithRetry<MatchDetail>(
    `${API_BASE}/api/matches/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
}
