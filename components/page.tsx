"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import BrucherLanding from "@/components/BrucherLanding";
import {
  selectAccessToken,
  selectRenter,
  selectSessionReady,
  selectUser,
} from "@/store/slices/authSlice";

export default function BrucherPage() {
  const router = useRouter();
  const accessToken = useSelector(selectAccessToken);
  const user = useSelector(selectUser);
  const renter = useSelector(selectRenter);
  const sessionReady = useSelector(selectSessionReady);

  const hasSession = Boolean(accessToken || user || renter);

  useEffect(() => {
    if (!sessionReady) return;
    if (hasSession) {
      router.replace("/");
    }
  }, [hasSession, router, sessionReady]);

  if (!sessionReady || hasSession) return null;

  return <BrucherLanding />;
}
