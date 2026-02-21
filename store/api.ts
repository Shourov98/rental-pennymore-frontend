import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  selectAccessToken,
  logout,
  agentLoginSuccess,
  renterLoginSuccess,
  refreshSuccess,
  type AgentLoginPayload,
  type RenterLoginPayload,
} from "./slices/authSlice";
import { fetchAgentProfile } from "./slices/agentProfileSlice";
import type { RootState } from "./store";
import type { Tokens, UserBase, RenterProfile } from "./slices/authSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = selectAccessToken(getState() as RootState);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

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

const isTokenValid = (token: string | null) => {
  if (!token) return false;
  const expiry = getTokenExpiry(token);
  return Boolean(expiry && expiry > Date.now());
};

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;

  if (result.error?.status === 401 && !url.includes("/auth/refresh-token")) {
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh-token", method: "POST" },
      api,
      extraOptions
    );

    const refreshToken = refreshResult.data as RefreshResponse | undefined;
    const accessToken = refreshToken?.data?.accessToken;

    if (accessToken) {
      api.dispatch(refreshSuccess({ accessToken }));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  } else if (result.error?.status === 401) {
    const token = selectAccessToken(api.getState() as RootState);
    if (!isTokenValid(token)) {
      api.dispatch(logout());
    }
  }

  return result;
};

export interface AgentLoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AgentLoginPayload | RenterLoginPayload;
  timestamp: string;
}

export interface RenterRegisterBody {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  registrationType?: "normal" | "social";
  petFriendly?: boolean;
}

export interface RenterRegisterResponse {
  success: boolean;
  message: string;
  data: RenterLoginPayload;
  timestamp: string;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
  timestamp: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    loginAgent: builder.mutation<LoginResponse, AgentLoginBody>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const payload = data.data;

          const isRenterPayload = (
            value: AgentLoginPayload | RenterLoginPayload
          ): value is RenterLoginPayload => {
            return (value as RenterLoginPayload)?.user?.role === "Renter";
          };

          if (isRenterPayload(payload)) {
            const tokens =
              payload.tokens ??
              (payload.accessToken
                ? {
                    accessToken: payload.accessToken,
                    refreshToken: payload.refreshToken,
                    expiresIn: payload.expiresIn,
                  }
                : undefined);
            dispatch(
              renterLoginSuccess({
                user: payload.user,
                renter: payload.renter ?? null,
                tokens,
                registrationType: payload.registrationType ?? "normal",
                referralInfo: payload.referralInfo ?? null,
              })
            );
          } else {
            dispatch(
              agentLoginSuccess({
                user: payload.user,
                accessToken: payload.accessToken,
                expiresIn: payload.expiresIn ?? "",
                mustChangePassword: !!payload.mustChangePassword,
                title: payload.title ?? null,
                agentProfile: payload.agentProfile ?? null,
              })
            );
            dispatch(fetchAgentProfile());
          }
        } catch {
          // handled by component-level error states
        }
      },
    }),
    registerRenter: builder.mutation<
      RenterRegisterResponse,
      RenterRegisterBody
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(renterLoginSuccess(data.data));
        } catch {
          // handled by component-level error states
        }
      },
    }),
    refreshToken: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            refreshSuccess({
              accessToken: data.data.accessToken,
            })
          );
        } catch {
          dispatch(logout());
        }
      },
    }),
    getProfile: builder.query<UserBase | RenterProfile, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const {
  useLoginAgentMutation,
  useRegisterRenterMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = api;
