"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLazyGetProfileQuery, useRefreshTokenMutation } from "@/store/api";
import { selectAccessToken, setAuthFromProfile } from "@/store/slices/authSlice";

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const [refreshToken] = useRefreshTokenMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const didRun = useRef(false);

  const isTokenValid = (token: string | null) => {
    if (!token) return false;
    try {
      const payload = token.split(".")[1];
      if (!payload) return false;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded =
        normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const json = atob(padded);
      const data = JSON.parse(json) as { exp?: number };
      return Boolean(data.exp && data.exp * 1000 > Date.now());
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const bootstrap = async () => {
      try {
        if (isTokenValid(accessToken)) {
          return;
        }

        await refreshToken().unwrap();
        const profile = await getProfile().unwrap();
        if (profile) {
          dispatch(setAuthFromProfile(profile));
        }
      } catch {
        // No active session; keep user logged out.
      }
    };

    void bootstrap();
  }, [accessToken, dispatch, getProfile, refreshToken]);

  return null;
}
