"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lock, ArrowRight, Edit2, Phone, Mail, User, Eye, EyeOff } from "lucide-react";
import { logout, updateRenter, updateUser } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

interface RenterProfile {
  _id?: string;
  userId?: string;
  emailSubscriptionEnabled?: boolean;
  userInfo?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    profileImageUrl?: string | null;
  };
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  registrationType?: string;
  petFriendly?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [profile, setProfile] = useState<RenterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const controller = new AbortController();

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const response = await fetch(`${API_BASE_URL}/renter/profile`, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data?.success === false || !data?.data) {
          throw new Error(
            data?.message ||
              "We couldn't load your profile right now. Please try again."
          );
        }

        const renterProfile = data.data as RenterProfile;
        setProfile(renterProfile);
        if (renterProfile) {
          dispatch(
            updateRenter({
              _id: renterProfile._id || "",
              userId: renterProfile.userId || "",
              email:
                renterProfile.userInfo?.email ||
                renterProfile.email ||
                "",
              fullName:
                renterProfile.userInfo?.fullName ||
                renterProfile.fullName ||
                "",
              phoneNumber:
                renterProfile.userInfo?.phoneNumber ||
                renterProfile.phoneNumber ||
                "",
              registrationType:
                (renterProfile.registrationType as "normal" | "social") ||
                "normal",
              petFriendly: renterProfile.petFriendly ?? false,
              emailSubscriptionEnabled:
                renterProfile.emailSubscriptionEnabled ?? false,
              createdAt: renterProfile.createdAt || "",
              updatedAt: renterProfile.updatedAt || "",
            })
          );
          dispatch(
            updateUser({
              fullName: renterProfile.userInfo?.fullName || "",
              email: renterProfile.userInfo?.email || "",
              phone:
                renterProfile.userInfo?.phoneNumber ||
                renterProfile.phoneNumber ||
                "",
            })
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load your profile right now. Please try again.";
        setError(message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, [accessToken, dispatch]);

  const profileFullName = profile?.userInfo?.fullName || profile?.fullName;
  const profilePhone = profile?.userInfo?.phoneNumber || profile?.phoneNumber;
  const profileEmail = profile?.userInfo?.email || profile?.email;
  const profileImageUrl = profile?.userInfo?.profileImageUrl || null;

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

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers,
      });

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
    <section className="w-full bg-gray-50 py-8 px-4 sm:px-8 md:px-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Profile
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-600 py-10">
            Loading your profile...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
            {error}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12">
            {/* Profile Picture */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt="User"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-500" />
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/renter/profile/edit")}
                  className="flex items-center gap-2 bg-blue-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-2 sm:col-span-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Full name</p>
                    <p className="text-gray-900 font-medium">
                      {profileFullName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-200 pb-2 sm:col-span-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">
                      {profileEmail || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-200 pb-2 sm:col-span-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">
                      {profilePhone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div
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
                className="mt-5 flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700 w-fit"
              >
                <Lock size={16} />
                <span className="text-sm font-medium">Change Password</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        )}
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
