"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearServerAuthSession } from "@/lib/authSession";
import { useLazyGetProfileQuery, useRefreshTokenMutation } from "@/store/api";
import {
  adminSessionDetected,
  agentLoginSuccess,
  logout,
  selectAuth,
  sessionChecked,
  setAuthFromProfile,
} from "@/store/slices/authSlice";

const SESSION_VERIFY_INTERVAL_MS = 15000;
const MATCH_DEMO_STORAGE_KEY = "beforelisted-match-demo";

const isLocalMatchDemoEnabled = () => {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("matchDemo") === "1") {
    sessionStorage.setItem(MATCH_DEMO_STORAGE_KEY, "1");
    return true;
  }

  return sessionStorage.getItem(MATCH_DEMO_STORAGE_KEY) === "1";
};

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [refreshToken] = useRefreshTokenMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const pathname = usePathname();
  const didBootstrap = useRef(false);
  const didClearAnonymousSession = useRef(false);
  const isVerifyingSession = useRef(false);
  const shouldForceAnonymousSession = pathname === "/signup/renter";

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
        if ("role" in profile && profile.role === "Admin") {
          await clearServerAuthSession(auth.accessToken);
          dispatch(adminSessionDetected());
          return;
        }
        dispatch(setAuthFromProfile(profile));
      }
    } catch (error) {
      if (shouldForceLogout(error)) {
        await clearServerAuthSession(auth.accessToken);
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
    if (!shouldForceAnonymousSession) {
      didClearAnonymousSession.current = false;
      return;
    }

    if (didClearAnonymousSession.current) return;
    didClearAnonymousSession.current = true;

    const clearAnonymousSession = async () => {
      try {
        await clearServerAuthSession(auth.accessToken);
      } catch {
        // The client state still needs to be anonymous even if the network call fails.
      } finally {
        dispatch(logout());
        dispatch(sessionChecked());
      }
    };

    void clearAnonymousSession();
  }, [auth.accessToken, dispatch, shouldForceAnonymousSession]);

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;

    const bootstrap = async () => {
      try {
        if (shouldForceAnonymousSession) {
          dispatch(logout());
          return;
        }

        if (isLocalMatchDemoEnabled()) {
          const now = new Date().toISOString();
          dispatch(
            agentLoginSuccess({
              user: {
                _id: "local-match-demo-agent",
                email: "agent.demo@beforelisted.local",
                fullName: "Local Match Demo",
                title: "Agent",
                phone: "000-000-0000",
                role: "Agent",
                accountStatus: "active",
                emailVerified: true,
                createdAt: now,
                updatedAt: now,
              },
              accessToken: "local-match-demo-token",
              expiresIn: "1h",
              mustChangePassword: false,
              agentProfile: {
                _id: "local-match-demo-profile",
                userInfo: {
                  _id: "local-match-demo-agent",
                  email: "agent.demo@beforelisted.local",
                  phoneNumber: "000-000-0000",
                  fullName: "Local Match Demo",
                  role: "Agent",
                  accountStatus: "active",
                  emailVerified: true,
                },
                title: "Agent",
                brokerageName: "BeforeListed Local",
                isActive: true,
                hasGrantAccess: true,
              },
            }),
          );
          dispatch(sessionChecked());
          return;
        }

        if (!auth.accessToken) {
          await refreshToken().unwrap();
        }

        const profile = await getProfile().unwrap();
        if (profile) {
          if ("role" in profile && profile.role === "Admin") {
            await clearServerAuthSession(auth.accessToken);
            dispatch(adminSessionDetected());
            return;
          }
          dispatch(setAuthFromProfile(profile));
        } else {
          dispatch(logout());
        }
      } catch {
        await clearServerAuthSession(auth.accessToken);
        dispatch(logout());
      } finally {
        dispatch(sessionChecked());
      }
    };

    void bootstrap();
  }, [
    auth.accessToken,
    dispatch,
    getProfile,
    refreshToken,
    shouldForceAnonymousSession,
  ]);

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
