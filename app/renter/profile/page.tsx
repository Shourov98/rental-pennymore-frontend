"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Lock, ArrowRight, Edit2, Phone, Mail, User } from "lucide-react";
import { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

interface RenterProfile {
  _id?: string;
  userId?: string;
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
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [profile, setProfile] = useState<RenterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setProfile(data.data as RenterProfile);
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
  }, [accessToken]);

  const formattedDates = useMemo(() => {
    const format = (value?: string) =>
      value
        ? new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null;

    return {
      created: format(profile?.createdAt),
      updated: format(profile?.updatedAt),
    };
  }, [profile?.createdAt, profile?.updatedAt]);

  const petFriendlyLabel =
    profile?.petFriendly === true
      ? "Yes, pets allowed"
      : profile?.petFriendly === false
      ? "No pets"
      : "Not specified";

  const avatar = "/profile-image.png";

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
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-gray-200">
              <Image src={avatar} alt="User" fill className="object-cover" />
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  {formattedDates.updated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Updated {formattedDates.updated}
                    </p>
                  )}
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
                <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">
                      {profile?.fullName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">
                      {profile?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-200 pb-2 sm:col-span-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">
                      {profile?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                  <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-200" />
                  <div>
                    <p className="text-xs text-gray-500">Registration Type</p>
                    <p className="text-gray-900 font-medium capitalize">
                      {profile?.registrationType || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                  <div className="w-4 h-4 rounded-full bg-green-50 border border-green-200" />
                  <div>
                    <p className="text-xs text-gray-500">Pet Friendly</p>
                    <p className="text-gray-900 font-medium">
                      {petFriendlyLabel}
                    </p>
                  </div>
                </div>

                {formattedDates.created && (
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-2 sm:col-span-2">
                    <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                    <div>
                      <p className="text-xs text-gray-500">Member since</p>
                      <p className="text-gray-900 font-medium">
                        {formattedDates.created}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password */}
              <div
                onClick={() => router.push("/set-new-password")}
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
    </section>
  );
}
