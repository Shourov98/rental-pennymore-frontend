const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthEndpoint = (path: string) =>
  API_BASE_URL ? `${API_BASE_URL}${path}` : path;

export const clearServerAuthSession = async (
  accessToken?: string | null,
): Promise<void> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    await fetch(getAuthEndpoint("/auth/logout"), {
      method: "POST",
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    // Clearing client auth state should still proceed if server cleanup is unreachable.
  }
};
