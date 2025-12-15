"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit3, Lock, RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAgentProfile,
  selectAgentProfileState,
} from "@/store/slices/agentProfileSlice";
import type { AppDispatch, RootState } from "@/store/store";

export default function AgentProfile() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, status, error } = useSelector(selectAgentProfileState);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!profile && status === "idle" && accessToken) {
      dispatch(fetchAgentProfile());
    }
  }, [accessToken, dispatch, profile, status]);

  const formattedDates = useMemo(() => {
    const format = (value?: string) =>
      value
        ? new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Not available";

    return {
      created: format(profile?.createdAt),
      updated: format(profile?.updatedAt),
    };
  }, [profile?.createdAt, profile?.updatedAt]);

  const avatar =
    profile?.userId?.fullName === "Vondo taheri"
      ? "https://randomuser.me/api/portraits/men/32.jpg"
      : "/agent-avatar.jpg";

  const isLoading = status === "loading" && !profile;

  return (
    <section className="bg-gray-50 min-h-screen px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white shadow-sm rounded-xl p-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => router.push("/agent/profile/edit")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          <Edit3 className="w-4 h-4" /> Edit
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 mb-4 text-sm flex justify-between items-start gap-4">
          <div>
            <p className="font-semibold">Unable to load profile</p>
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

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col sm:flex-row gap-8">
        {/* Profile Picture */}
        <div className="shrink-0">
          <Image
            src={avatar}
            alt="Profile"
            width={150}
            height={150}
            className="rounded-full object-cover"
          />
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 bg-gray-50">
            {profile?.userId?.accountStatus
              ? profile.userId.accountStatus.toUpperCase()
              : "STATUS UNKNOWN"}
          </div>
        </div>

        {/* Information */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing profile...
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Updated {formattedDates.updated} • Member since{" "}
            {formattedDates.created}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {profile?.userId?.fullName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone no</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {profile?.userId?.phoneNumber || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">License No.</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {profile?.licenseNumber || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Brokerage name</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {profile?.brokerageName || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Referral Code</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {profile?.userId?.referralCode || "Not available"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Referral Link</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1 break-all">
                {profile?.userId?.referralLink || "Not available"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {profile?.userId?.email || "Not provided"}
              </p>
            </div>
          </div>

          {/* Change Password */}
          <button className="flex items-center gap-2 text-blue-600 font-medium mt-6 hover:text-blue-700 transition">
            <Lock className="w-4 h-4" />
            Change Password →
          </button>
        </div>
      </div>
    </section>
  );
}
