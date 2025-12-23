"use client";

import { useEffect, useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchAgentProfile,
  selectAgentProfileState,
  selectAgentReferral,
} from "@/store/slices/agentProfileSlice";

export default function AgentReferLink() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, status, error } = useSelector(selectAgentProfileState);
  const { referralLink, referralCode } = useSelector(selectAgentReferral);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  useEffect(() => {
    if (!profile && status === "idle" && accessToken) {
      dispatch(fetchAgentProfile());
    }
  }, [accessToken, dispatch, profile, status]);

  const handleCopy = async (value?: string, type?: "link" | "code") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type ?? null);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard not available, silently ignore
    }
  };

  const isLoading = status === "loading" && !profile;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refer Link</h1>
          <p className="text-sm text-gray-600">
            Share your unique code and link to refer new renters.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 mb-4 text-sm flex justify-between items-start gap-4">
          <div>
            <p className="font-semibold">Unable to load referral info</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => dispatch(fetchAgentProfile())}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-50 border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">Referral Link</h3>
              <p className="text-sm text-gray-600">
                Send this link to renters to start the process.
              </p>
            </div>
            <button
              disabled={!referralLink}
              onClick={() => handleCopy(referralLink || undefined, "link")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied === "link" ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-900 break-all">
            {referralLink || "No referral link available yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
