import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  selectAccessToken,
  setAgentProfile,
  updateUser,
  type AgentProfile,
  type AgentProfileUser,
} from "./authSlice";

export type { AgentProfile, AgentProfileUser } from "./authSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AgentProfileResponse {
  success?: boolean;
  message?: string;
  data?: AgentProfile;
}

interface AgentProfileState {
  profile: AgentProfile | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AgentProfileState = {
  profile: null,
  status: "idle",
  error: null,
};

export const fetchAgentProfile = createAsyncThunk<
  AgentProfile,
  void,
  { state: RootState; rejectValue: string }
>("agentProfile/fetch", async (_arg, { getState, rejectWithValue, dispatch }) => {
  const state = getState();
  const accessToken = selectAccessToken(state);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    const response = await fetch(`${API_BASE_URL}/agent/profile`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    const data: AgentProfileResponse = await response
      .json()
      .catch(() => ({} as AgentProfileResponse));

    if (!response.ok || data?.success === false || !data?.data) {
      const message =
        data?.message ||
        "We couldn't load your profile right now. Please try again.";
      return rejectWithValue(message);
    }

    const normalizedUserInfo =
      data.data.userInfo ?? data.data.userId ?? ({} as AgentProfileUser);
    if (normalizedUserInfo?.referralCode || normalizedUserInfo?.referralLink) {
      dispatch(
        updateUser({
          referralCode: normalizedUserInfo?.referralCode ?? null,
          referralLink: normalizedUserInfo?.referralLink ?? null,
        })
      );
    }

    const normalizedProfile = {
      ...data.data,
      userInfo: normalizedUserInfo,
    };
    dispatch(setAgentProfile(normalizedProfile));
    return normalizedProfile;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't load your profile right now. Please try again.";
    return rejectWithValue(message);
  }
});

const agentProfileSlice = createSlice({
  name: "agentProfile",
  initialState,
  reducers: {
    clearAgentProfile(state) {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
    updateAgentProfile(state, action: PayloadAction<Partial<AgentProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAgentProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchAgentProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          "We couldn't load your profile right now. Please try again.";
      });
  },
});

export const { clearAgentProfile, updateAgentProfile } =
  agentProfileSlice.actions;

export default agentProfileSlice.reducer;

export const selectAgentProfileState = (state: RootState) =>
  state.agentProfile;
export const selectAgentProfile = (state: RootState) =>
  state.agentProfile.profile;
export const selectAgentReferral = (state: RootState) => ({
  referralCode: state.auth.user?.referralCode ?? null,
  referralLink: state.auth.user?.referralLink ?? null,
});
