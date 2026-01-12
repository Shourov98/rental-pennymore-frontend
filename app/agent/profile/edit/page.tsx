"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Save, Phone, IdCard, User, Building2 } from "lucide-react";
import { updateAgentProfile } from "@/store/slices/agentProfileSlice";
import { updateUser, type AgentProfile } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function EditAgentProfile() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [brokerageName, setBrokerageName] = useState("");
  const [image, setImage] = useState("/agent-avatar.jpg");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

        const response = await fetch(`${API_BASE_URL}/agent/profile`, {
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

        const profile = data.data as AgentProfile;
        const userInfo = profile.userInfo ?? profile.userId;

        setFullName(userInfo?.fullName || "");
        setPhoneNumber(userInfo?.phoneNumber || "");
        setLicenseNumber(profile.licenseNumber || "");
        setBrokerageName(profile.brokerageName || "");
        setImage(userInfo?.profileImageUrl || "/agent-avatar.jpg");
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    const previousImage = image;
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(`${API_BASE_URL}/file/upload-profile-image`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't upload the image right now. Please try again."
        );
      }

      const uploadedUrl =
        data?.data?.profileImageUrl ||
        data?.data?.profileImage ||
        data?.data?.url ||
        data?.data?.imageUrl ||
        data?.data?.fileUrl ||
        data?.url ||
        data?.imageUrl;

      if (uploadedUrl) {
        setImage(uploadedUrl);
        setSuccess("Profile image updated.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't upload the image right now. Please try again.";
      setError(message);
      setImage(previousImage);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(previewUrl);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const payload = {
        phoneNumber,
        licenseNumber,
        brokerageName,
      };

      const response = await fetch(`${API_BASE_URL}/agent/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false || !data?.data) {
        throw new Error(
          data?.message ||
            "We couldn't update your profile right now. Please try again."
        );
      }

      const updatedProfile = data.data as AgentProfile;
      dispatch(updateAgentProfile(updatedProfile));

      const userInfo = updatedProfile.userInfo ?? updatedProfile.userId;
      dispatch(
        updateUser({
          referralCode: userInfo?.referralCode ?? null,
          referralLink: userInfo?.referralLink ?? null,
        })
      );

      setSuccess("Profile updated successfully.");
      router.push("/agent/profile");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't update your profile right now. Please try again.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white shadow-sm rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft
            className="w-4 h-4 text-gray-600 cursor-pointer"
            onClick={() => router.push("/agent/profile")}
          />
          <span>Profile</span>
          <span>›</span>
          <span className="font-medium text-gray-800">Edit Profile</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/agent/profile")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-agent-profile"
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-70"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col sm:flex-row gap-8">
        {/* Profile Image Upload */}
        <div className="relative flex-shrink-0">
          <Image
            src={image}
            alt="Profile"
            width={150}
            height={150}
            className="rounded-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-50 transition"
          >
            {isUploading ? "..." : "✏️"}
          </button>
        </div>

        {/* Input Fields */}
        <form
          id="edit-agent-profile"
          onSubmit={handleSubmit}
          className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {error && (
            <div className="sm:col-span-2 bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="sm:col-span-2 bg-green-50 text-green-700 border border-green-100 rounded-xl p-3 text-sm">
              {success}
            </div>
          )}

          {/* Full Name */}
          <div className="col-span-2">
            <label className="text-gray-600 text-sm mb-1 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="pl-9 w-full border border-gray-200 rounded-lg p-2.5 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Phone No */}
          <div>
            <label className="text-gray-600 text-sm mb-1 block">
              Phone no.
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                placeholder="Phone no"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="pl-9 w-full border border-gray-200 rounded-lg p-2.5 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* License */}
          <div>
            <label className="text-gray-600 text-sm mb-1 block">
              License No.
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Enter number"
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
                className="pl-9 w-full border border-gray-200 rounded-lg p-2.5 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Brokerage Name */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-gray-600 text-sm mb-1 block">
              Brokerage Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Name"
                value={brokerageName}
                onChange={(event) => setBrokerageName(event.target.value)}
                className="pl-9 w-full border border-gray-200 rounded-lg p-2.5 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
