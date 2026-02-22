import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import preferenceReducer from "./slices/preferenceSlice";
import authReducer, {
  agentLoginSuccess,
  logout,
  renterLoginSuccess,
  type AuthState,
} from "./slices/authSlice";
import agentProfileReducer, {
  clearAgentProfile,
} from "./slices/agentProfileSlice";
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

const sessionListener = createListenerMiddleware();

sessionListener.startListening({
  actionCreator: logout,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(clearAgentProfile());
    listenerApi.dispatch(api.util.resetApiState());
  },
});

sessionListener.startListening({
  matcher: isAnyOf(agentLoginSuccess, renterLoginSuccess),
  effect: async (_action, listenerApi) => {
    // Prevent previous-user query cache from leaking into a new session.
    listenerApi.dispatch(api.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: {
    preferences: preferenceReducer,
    auth: authReducer,
    agentProfile: agentProfileReducer,
    [api.reducerPath]: api.reducer,
  },
  preloadedState: loadAuthState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(sessionListener.middleware)
      .concat(api.middleware),
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
