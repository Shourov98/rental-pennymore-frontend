import { configureStore } from "@reduxjs/toolkit";
import preferenceReducer from "./slices/preferenceSlice";
import authReducer, { type AuthState } from "./slices/authSlice";
import agentProfileReducer from "./slices/agentProfileSlice";
import { api } from "./api";

const AUTH_STORAGE_KEY = "auth_state_v1";

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    const data = JSON.parse(json) as { exp?: number };
    return data.exp ? data.exp * 1000 : null;
  } catch {
    return null;
  }
};

const loadAuthState = (): { auth: AuthState } | undefined => {
  if (typeof window === "undefined") return undefined;
  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return undefined;

  try {
    const auth = JSON.parse(stored) as AuthState;
    const expiry = auth.accessToken ? getTokenExpiry(auth.accessToken) : null;
    if (expiry && expiry <= Date.now()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return undefined;
    }
    return { auth };
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    preferences: preferenceReducer,
    auth: authReducer,
    agentProfile: agentProfileReducer,
    [api.reducerPath]: api.reducer,
  },
  preloadedState: loadAuthState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();
    const auth = state.auth;
    const shouldPersist = Boolean(auth.accessToken || auth.user || auth.renter);
    if (!shouldPersist) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    const nextAuth: AuthState = {
      ...auth,
      status: auth.accessToken ? "authenticated" : "idle",
      error: null,
    };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
  });
}
