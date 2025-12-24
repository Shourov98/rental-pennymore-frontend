"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Edit2, User, Phone } from "lucide-react";
import { updateRenter, updateUser } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

interface RenterProfile {
  _id?: string;
  userId?: string;
  registrationType?: "normal" | "social";
  petFriendly?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userInfo?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    profileImageUrl?: string | null;
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState("/profile-image.png");
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

        const profile = data.data as RenterProfile;
        setFullName(profile.userInfo?.fullName || "");
        setPhoneNumber(profile.userInfo?.phoneNumber || "");
        setImage(profile.userInfo?.profileImageUrl || "/profile-image.png");

        dispatch(
          updateRenter({
            _id: profile._id || "",
            userId: profile.userId || "",
            email: profile.userInfo?.email || "",
            fullName: profile.userInfo?.fullName || "",
            phoneNumber: profile.userInfo?.phoneNumber || "",
            registrationType: profile.registrationType || "normal",
            petFriendly: profile.petFriendly ?? false,
            createdAt: profile.createdAt || "",
            updatedAt: profile.updatedAt || "",
          })
        );
        dispatch(
          updateUser({
            fullName: profile.userInfo?.fullName || "",
            email: profile.userInfo?.email || "",
            phone: profile.userInfo?.phoneNumber || "",
          })
        );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsSaving(true);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const payload = {
        fullName,
        phoneNumber,
      };

      const response = await fetch(`${API_BASE_URL}/renter/profile`, {
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

      const updatedProfile = data.data as RenterProfile;
      setImage(
        updatedProfile.userInfo?.profileImageUrl || "/profile-image.png"
      );
      dispatch(
        updateRenter({
          _id: updatedProfile._id || "",
          userId: updatedProfile.userId || "",
          email: updatedProfile.userInfo?.email || "",
          fullName: updatedProfile.userInfo?.fullName || "",
          phoneNumber: updatedProfile.userInfo?.phoneNumber || "",
          registrationType: updatedProfile.registrationType || "normal",
          petFriendly: updatedProfile.petFriendly ?? false,
          createdAt: updatedProfile.createdAt || "",
          updatedAt: updatedProfile.updatedAt || "",
        })
      );
      dispatch(
        updateUser({
          fullName: updatedProfile.userInfo?.fullName || "",
          email: updatedProfile.userInfo?.email || "",
          phone: updatedProfile.userInfo?.phoneNumber || "",
        })
      );

      setSuccess("Profile updated successfully.");
      router.push("/renter/profile");
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
    <section className="w-full bg-gray-50 py-8 px-4 sm:px-8 md:px-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <ArrowLeft
          className="w-4 h-4 cursor-pointer hover:text-blue-600"
          onClick={() => router.back()}
        />
        <span
          onClick={() => router.push("/renter/profile")}
          className="cursor-pointer hover:text-blue-600 transition"
        >
          Profile
        </span>
        <span className="text-gray-400">›</span>
        <span className="font-medium text-gray-700">Edit Profile</span>
      </div>

      {/* Page title */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Profile
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-600 py-10">
            Loading your profile...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12"
          >
            {/* Profile Picture */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-visible border-4 border-gray-200">
              <Image
                src={image}
                alt="User"
                fill
                className="object-cover rounded-full"
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
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition"
              >
                <Edit2 className="w-4 h-4 text-blue-500" />
              </button>
            </div>

            {/* Editable Fields */}
            <div className="flex-1 w-full">
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 bg-green-50 text-green-700 border border-green-100 rounded-xl p-3 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Full Name
                  </label>
                  <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 mt-1">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-transparent outline-none text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Phone no.
                  </label>
                  <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 mt-1">
                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone no"
                      className="w-full bg-transparent outline-none text-gray-800"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end items-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => router.push("/renter/profile")}
                  className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
