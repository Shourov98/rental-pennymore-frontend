"use client";

import { useSelector } from "react-redux";
import { selectReferrerName } from "@/store/slices/authSlice";

export default function ReferrerNameText() {
  const referrerName = useSelector(selectReferrerName);

  return <>{referrerName || "Tuval Mor"}</>;
}
