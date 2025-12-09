"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const user = {
    name: "John Doe",
    phone: "+1 9592626",
    email: "john@gmail.com",
    image: "/profile-image.png", // make sure this exists in /public
  };

  return (
    <section className="w-full bg-gray-50 py-8 px-4 sm:px-8 md:px-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">
        {/* Page Title */}
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Profile
        </h1>

        {/* Profile Content */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12">
          {/* Profile Picture */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-gray-200">
            <Image src={user.image} alt="User" fill className="object-cover" />
          </div>

          {/* Info Section */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
              </h2>

              {/* Edit Button */}
              <button
                onClick={() => router.push("/renter/profile/edit")}
                className="flex items-center gap-2 bg-blue-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                <Edit2 size={16} />
                Edit
              </button>
            </div>

            {/* Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="border-b border-gray-300 pb-1 text-gray-800">
                  {user.name}
                </p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone no</p>
                <p className="border-b border-gray-300 pb-1 text-gray-800">
                  {user.phone}
                </p>
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="border-b border-gray-300 pb-1 text-gray-800">
                  {user.email}
                </p>
              </div>
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
      </div>
    </section>
  );
}
