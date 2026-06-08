export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NGROK_BYPASS_HEADER = "ngrok-skip-browser-warning";

function getHostname(value?: string | URL | Request | null) {
  if (!value) return null;

  try {
    const rawUrl =
      typeof value === "string"
        ? value
        : value instanceof URL
          ? value.href
          : value.url;

    const base =
      typeof window !== "undefined" ? window.location.origin : undefined;
    return new URL(rawUrl, base).hostname;
  } catch {
    return null;
  }
}

function isNgrokHost(hostname: string | null) {
  return Boolean(
    hostname &&
      (hostname.endsWith(".ngrok-free.dev") ||
        hostname.endsWith(".ngrok.app") ||
        hostname.endsWith(".ngrok.io")),
  );
}

export function shouldUseNgrokBypass(input?: string | URL | Request | null) {
  const requestHost = getHostname(input);
  const apiHost = getHostname(API_BASE_URL);

  return isNgrokHost(requestHost || apiHost);
}

export function applyApiHeaders(headers: Headers) {
  if (shouldUseNgrokBypass(API_BASE_URL)) {
    headers.set(NGROK_BYPASS_HEADER, "true");
  }

  return headers;
}

export function withApiHeaders(headers?: HeadersInit, input?: string | URL | Request) {
  const nextHeaders = new Headers(headers);

  if (shouldUseNgrokBypass(input || API_BASE_URL)) {
    nextHeaders.set(NGROK_BYPASS_HEADER, "true");
  }

  return nextHeaders;
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: withApiHeaders(init.headers, input as string | URL | Request),
  });
}

export function installApiFetchPatch() {
  if (typeof window === "undefined") return;

  const win = window as typeof window & {
    __beforelistedApiFetchPatched?: boolean;
    __beforelistedOriginalFetch?: typeof fetch;
  };

  if (win.__beforelistedApiFetchPatched) return;

  const originalFetch = win.fetch.bind(win);
  win.__beforelistedOriginalFetch = originalFetch;

  win.fetch = ((input: RequestInfo | URL, init: RequestInit = {}) => {
    if (!shouldUseNgrokBypass(input as string | URL | Request)) {
      return originalFetch(input, init);
    }

    const requestHeaders =
      init.headers ||
      (typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined);

    return originalFetch(input, {
      ...init,
      headers: withApiHeaders(requestHeaders, input as string | URL | Request),
    });
  }) as typeof fetch;

  win.__beforelistedApiFetchPatched = true;
}
