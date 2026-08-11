/**
 * Single source of truth for pre-market scope semantics on the agent side.
 *
 * Three values appear in the UI / API responses:
 * - "Upcoming"        — raw stored scope (beforelisted-api: pre-market.type.ts)
 * - "All Market"      — raw stored scope
 * - "Upcoming (M)"    — derived display scope produced by
 *                        PreMarketService.resolveAgentVisibleScope when the
 *                        stored scope is "All Market" AND matched agents exist
 *
 * For match-state UI we treat both "Upcoming" and "Upcoming (M)" as
 * "upcoming-like": a single agent may know of multiple owners / upcoming
 * opportunities that could help the request, so the match button must stay
 * active. Only "All Market" (or anything else) means one match per agent.
 */

export type AgentVisibleScope = "Upcoming" | "All Market" | "Upcoming (M)";

export function isUpcomingScope(
  scope: string | undefined | null,
): boolean {
  if (!scope) return false;
  const normalized = scope.trim().toLowerCase();
  return normalized.startsWith("upcoming");
}

export function isAllMarketScope(
  scope: string | undefined | null,
): boolean {
  if (!scope) return false;
  return scope.trim() === "All Market";
}
