"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import BrucherLanding from "@/components/BrucherLanding";
import {
  selectAccessToken,
  selectRenter,
  selectUser,
} from "@/store/slices/authSlice";

export default function BrucherPage() {
  const router = useRouter();
  const accessToken = useSelector(selectAccessToken);
  const user = useSelector(selectUser);
  const renter = useSelector(selectRenter);

  const hasSession = Boolean(accessToken || user || renter);

  useEffect(() => {
    if (hasSession) {
      router.replace("/");
    }
  }, [hasSession, router]);

  if (hasSession) return null;

  return <BrucherLanding />;
}
