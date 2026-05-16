"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit3, Eye, EyeOff, Lock, RefreshCw, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearServerAuthSession } from "@/lib/authSession";
import {
  fetchAgentProfile,
  selectAgentProfileState,
} from "@/store/slices/agentProfileSlice";
import { logout } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AgentProfile() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, status, error } = useSelector(selectAgentProfileState);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const userInfo = profile?.userInfo ?? profile?.userId;
  const avatar = userInfo?.profileImageUrl || null;

  const isLoading = status === "loading" && !profile;

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setChangeError(null);

    if (!currentPassword || !newPassword) {
      setChangeError("Please enter your current and new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError("New password and confirmation do not match.");
      return;
    }

    setIsChanging(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "Unable to change your password right now. Please try again."
        );
      }

      await clearServerAuthSession(accessToken);

      dispatch(logout());
      router.replace("/signin");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to change your password right now. Please try again.";
      setChangeError(message);
    } finally {
      setIsChanging(false);
    }
  };

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
          {avatar ? (
            <Image
              src={avatar}
              alt="Profile"
              width={150}
              height={150}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-[150px] h-[150px] rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-500" />
            </div>
          )}
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
                {userInfo?.fullName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone no</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {userInfo?.phoneNumber || "Not provided"}
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
              <p className="text-gray-500 text-sm">Referral Link</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1 break-all">
                {userInfo?.referralLink || "Not available"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                {userInfo?.email || "Not provided"}
              </p>
            </div>
          </div>

          {/* Change Password */}
          <button
            onClick={() => {
              setChangeError(null);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setShowCurrentPassword(false);
              setShowNewPassword(false);
              setShowConfirmPassword(false);
              setIsChangeOpen(true);
            }}
            className="flex items-center gap-2 text-blue-600 font-medium mt-6 hover:text-blue-700 transition"
          >
            <Lock className="w-4 h-4" />
            Change Password →
          </button>
        </div>
      </div>

      {isChangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setIsChangeOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm text-gray-800">Current Password</label>
                <div className="relative mt-1">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-800">New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-800">
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {changeError && (
                <p className="text-sm text-red-600">{changeError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangeOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChanging}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isChanging ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
