"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLazyGetProfileQuery, useRefreshTokenMutation } from "@/store/api";
import {
  logout,
  selectAuth,
  setAuthFromProfile,
} from "@/store/slices/authSlice";

const SESSION_VERIFY_INTERVAL_MS = 15000;

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [refreshToken] = useRefreshTokenMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const didRun = useRef(false);
  const isVerifyingSession = useRef(false);

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

  const shouldForceLogout = (error: unknown) => {
    const value = error as {
      status?: number | string;
      data?: { errorCode?: string };
    };

    return (
      value?.status === 401 ||
      value?.status === 403 ||
      value?.data?.errorCode === "EMAIL_BLOCKED"
    );
  };

  const verifyActiveSession = useCallback(async () => {
    if (!auth.accessToken || isVerifyingSession.current) return;

    const role = auth.role ?? auth.user?.role;
    const isRenterSession = role === "Renter" || Boolean(auth.renter);
    if (!isRenterSession) return;

    try {
      isVerifyingSession.current = true;
      const profile = await getProfile().unwrap();
      if (profile) {
        dispatch(setAuthFromProfile(profile));
      }
    } catch (error) {
      if (shouldForceLogout(error)) {
        dispatch(logout());
      }
    } finally {
      isVerifyingSession.current = false;
    }
  }, [
    auth.accessToken,
    auth.renter,
    auth.role,
    auth.user?.role,
    dispatch,
    getProfile,
  ]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const bootstrap = async () => {
      const hasProfile = Boolean(auth.user || auth.renter);

      if (isTokenValid(auth.accessToken)) {
        try {
          const profile = await getProfile().unwrap();
          if (profile) {
            dispatch(setAuthFromProfile(profile));
            return;
          }

          if (hasProfile) {
            return;
          }

          dispatch(logout());
          return;
        } catch (error) {
          if (shouldForceLogout(error) || !hasProfile) {
            dispatch(logout());
          }
          return;
        }
      }

      try {
        await refreshToken().unwrap();
        const profile = await getProfile().unwrap();
        if (profile) {
          dispatch(setAuthFromProfile(profile));
          return;
        }

        dispatch(logout());
      } catch {
        dispatch(logout());
      }
    };

    void bootstrap();
  }, [auth.accessToken, auth.renter, auth.user, dispatch, getProfile, refreshToken]);

  useEffect(() => {
    if (!auth.accessToken) return;

    void verifyActiveSession();

    const intervalId = window.setInterval(() => {
      void verifyActiveSession();
    }, SESSION_VERIFY_INTERVAL_MS);

    const handleFocus = () => {
      void verifyActiveSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void verifyActiveSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [auth.accessToken, verifyActiveSession]);

  return null;
}
