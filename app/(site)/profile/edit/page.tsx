"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, User, Phone } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+1 9592626",
    image: "/profile-image.png", // default image in /public
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 handle image selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile((prev) => ({
          ...prev,
          image: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect API endpoint to update user profile
    router.push("/profile");
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
          onClick={() => router.push("/profile")}
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12"
        >
          {/* Profile Picture */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-visible border-4 border-gray-200">
            <Image
              src={profile.image}
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
              className="absolute -bottom-2 -right-2 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Edit2 className="w-4 h-4 text-blue-500" />
            </button>
          </div>

          {/* Editable Fields */}
          <div className="flex-1 w-full">
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="text-sm text-gray-600 font-medium">
                  Full Name
                </label>
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 mt-1">
                  <User className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="w-full bg-transparent outline-none text-gray-800"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-sm text-gray-600 font-medium">
                  Phone no.
                </label>
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 mt-1">
                  <Phone className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Phone no"
                    className="w-full bg-transparent outline-none text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
