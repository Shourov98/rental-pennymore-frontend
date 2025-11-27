"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import RenterPreferenceView from "@/components/RenterPreferenceView";

export default function RenterRequestDetails() {
  const [showModal, setShowModal] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("renter");

  // 🔹 Mock states
  const isAdminApproved = true;
  const isPaid = true;
  const isFree = false;

  const showContact = isPaid;
  const showCost = isAdminApproved;

  // 🔹 Toggle collapsible section
  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  return (
    <section className="flex-1 bg-gray-50 overflow-y-auto max-h-[calc(100vh-72px)] px-4 md:px-8 py-6">
      {/* ✅ Breadcrumb Header */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4 text-gray-600 cursor-pointer" />
          <span>Renter Requests</span>
          <span>›</span>
          <span>View</span>
          <span>›</span>
          <span className="font-medium text-gray-800">View Agent Listing</span>
        </div>

        <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
          Matched
        </span>
      </div>

      {/* ✅ Contact Details */}
      {showContact && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900">
              Renter Contact Details
            </h2>
            <span className="text-xs border border-blue-400 text-blue-600 px-3 py-1 rounded-full">
              T. Mor
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mt-4 items-center sm:items-start">
            <Image
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User"
              width={80}
              height={80}
              className="rounded-full object-cover"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div>
                <p className="text-gray-500 text-sm">Name</p>
                <p className="font-medium text-gray-900">John Doe</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium text-gray-900">example@gmail.com</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone Number</p>
                <p className="font-medium text-gray-900">+8801XXXXXXX</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Collapsible Sections */}
      <div className="space-y-4 mb-4">
        {/* --- Renter Preferences Section --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
          {/* Header */}
          <div
            className="px-6 py-4 flex justify-between items-center cursor-pointer border-b border-gray-100"
            onClick={() => toggleSection("renter")}
          >
            <h3 className="text-lg font-semibold text-[#0A093D]">
              Renter Preference
            </h3>
            {openSection === "renter" ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>

          {/* Dropdown Content */}
          {openSection === "renter" && (
            <div className="px-6 py-6 border-t border-gray-200 animate-fadeIn overflow-y-auto">
              <RenterPreferenceView
                data={{
                  borough: "Brooklyn",
                  neighborhoods: ["West Chelsea"],
                  minPrice: "4250",
                  maxPrice: "5000",
                  earliestDate: "05/21/2025",
                  latestDate: "06/21/2025",
                  bedrooms: "Studio",
                  bathrooms: 1,
                  unitFeatures: ["Laundry in unit", "Dishwasher"],
                  buildingFeatures: ["Doorman", "Elevator"],
                  petPolicy: ["Cats allowed"],
                  guarantor: ["Personal guarantor"],
                  note: "I want the room clean.",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] sm:w-[500px] p-6 animate-pop">
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              I confirm that I had no prior knowledge of the apartment before
              finding this pre-market match for the client.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Not Yet
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Match Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes pop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pop {
          animation: pop 0.25s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </section>
  );
}
