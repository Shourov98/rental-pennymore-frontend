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
    getDefaultMiddleware()
      .prepend(sessionListener.middleware)
      .concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
