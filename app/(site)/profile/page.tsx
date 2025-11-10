"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Lock, ArrowRight } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+1 9592626",
    email: "john@gmail.com",
    image: "/profile-image.png", // Place your image in public/
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  return (
    <section className="w-full bg-gray-50 py-8 px-4 sm:px-8 md:px-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Profile
        </h1>

        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12">
          {/* Profile Image */}
          <div className="shrink-0">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-gray-200">
              <Image
                src={profile.image}
                alt="User"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
              </h2>
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 bg-blue-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                <Edit size={16} />
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-sm text-gray-500">Name</label>
                {isEditing ? (
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full border-b border-gray-300 py-1 text-gray-800 outline-none focus:border-blue-600"
                  />
                ) : (
                  <p className="border-b border-gray-300 py-1 text-gray-800">
                    {profile.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-gray-500">Phone no</label>
                {isEditing ? (
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full border-b border-gray-300 py-1 text-gray-800 outline-none focus:border-blue-600"
                  />
                ) : (
                  <p className="border-b border-gray-300 py-1 text-gray-800">
                    {profile.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-500">Email</label>
                {isEditing ? (
                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full border-b border-gray-300 py-1 text-gray-800 outline-none focus:border-blue-600"
                  />
                ) : (
                  <p className="border-b border-gray-300 py-1 text-gray-800">
                    {profile.email}
                  </p>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="mt-5 flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700 w-fit">
              <Lock size={16} />
              <span className="text-sm font-medium">Change Password</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
