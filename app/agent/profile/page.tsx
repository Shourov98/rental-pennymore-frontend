"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit3, Lock } from "lucide-react";

export default function AgentProfile() {
  const router = useRouter();

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

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col sm:flex-row gap-8">
        {/* Profile Picture */}
        <div className="shrink-0">
          <Image
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Profile"
            width={150}
            height={150}
            className="rounded-full object-cover"
          />
        </div>

        {/* Information */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                John Doe
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone no</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                +1 9592626
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">License No.</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                561616
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Brokerage name</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                Alice
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                john@gmail.com
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
