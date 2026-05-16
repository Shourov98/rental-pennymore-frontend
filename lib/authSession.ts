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

  await fetch(getAuthEndpoint("/auth/logout"), {
    method: "POST",
    headers,
    credentials: "include",
    cache: "no-store",
  });
};
