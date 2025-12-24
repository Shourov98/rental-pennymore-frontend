"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLazyGetProfileQuery, useRefreshTokenMutation } from "@/store/api";
import { setAuthFromProfile } from "@/store/slices/authSlice";

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const [refreshToken] = useRefreshTokenMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const bootstrap = async () => {
      try {
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
  }, [dispatch, getProfile, refreshToken]);

  return null;
}
