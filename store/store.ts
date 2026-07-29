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
} from "./slices/authSlice";
import agentProfileReducer, {
  clearAgentProfile,
} from "./slices/agentProfileSlice";
import { api } from "./api";

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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          "api.subscriptions",
          "api.internalActions",
          // RTK Query stores subscribe-sentinel Symbols (e.g. for arg-less
          // queries like `useGetProfileQuery`) in `originalArgs`. These are
          // framework-internal and not user data.
          /^api\.queries\..*\.originalArgs$/,
          /^api\.mutations\..*\.originalArgs$/,
          /^api\.provided\..*\.originalArgs$/,
        ],
        ignoredActionPaths: [
          "meta.arg",
          "payload.timestamp",
          "meta.baseQueryMeta.request",
          "meta.baseQueryMeta.response",
          "meta.request",
          /^api\/subscriptions\//,
          /^api\/internalActions\//,
        ],
      },
    })
      .prepend(sessionListener.middleware)
      .concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
