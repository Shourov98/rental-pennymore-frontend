const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Returns `true` when the signed-in renter has at least one currently
 * active pre-market request. Used by the sign-in page and the marketing
 * homepage so renters with an active search land on their dashboard
 * (`/renter/saved-requests`) instead of the public landing page.
 *
 * Calls `GET /pre-market/has-active-request`. Returns `false` on any
 * failure (network error, non-2xx, malformed body) so the caller falls
 * back to the marketing homepage rather than getting stuck on a login
 * redirect.
 */
export const renterHasActiveRequest = async (): Promise<boolean> => {
  if (!API_BASE_URL) return false;

  try {
    const response = await fetch(
      `${API_BASE_URL}/pre-market/has-active-request`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );
    if (!response.ok) return false;
    const body = (await response.json().catch(() => null)) as {
      data?: { hasActiveRequest?: unknown };
    } | null;
    return body?.data?.hasActiveRequest === true;
  } catch {
    return false;
  }
};

export const RENTER_DASHBOARD_PATH = "/renter/saved-requests";

/**
 * Post-login landing path for agents. Agents always land here after
 * authentication — there is no equivalent of the renter "no active
 * request → homepage" fallback, because the agent dashboard is the
 * natural home regardless of whether the agent currently has any
 * matches, conversations, or requests.
 */
export const AGENT_DASHBOARD_PATH = "/agent/dashboard";
