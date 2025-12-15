import { configureStore } from "@reduxjs/toolkit";
import preferenceReducer from "./slices/preferenceSlice";
import authReducer from "./slices/authSlice";
import agentProfileReducer from "./slices/agentProfileSlice";
import { api } from "./api";

export const store = configureStore({
  reducer: {
    preferences: preferenceReducer,
    auth: authReducer,
    agentProfile: agentProfileReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
