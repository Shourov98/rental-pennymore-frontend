"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Phone, IdCard } from "lucide-react";

export default function EditAgentProfile() {
  const router = useRouter();

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
            onClick={() => router.push("/agent/profile")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col sm:flex-row gap-8">
        {/* Profile Image Upload */}
        <div className="relative flex-shrink-0">
          <Image
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Profile"
            width={150}
            height={150}
            className="rounded-full object-cover"
          />
          <button className="absolute bottom-2 right-2 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-50 transition">
            ✏️
          </button>
        </div>

        {/* Input Fields */}
        <form className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="text-gray-600 text-sm mb-1 block">
              Full Name
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Name"
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
              <Phone className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Name"
                className="pl-9 w-full border border-gray-200 rounded-lg p-2.5 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
