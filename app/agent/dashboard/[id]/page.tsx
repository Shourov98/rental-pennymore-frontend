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
import { useRouter } from "next/navigation";

export default function RenterRequestDetails() {
  const [showModal, setShowModal] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("renter");

  // 🔹 Mock states
  const isAdminApproved = true;
  const isPaid = true;
  const isFree = false;

  const showContact = isPaid;
  const showCost = isAdminApproved;

  const router = useRouter();

  // 🔹 Toggle collapsible section
  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  return (
    <section className="flex-1 bg-gray-50 overflow-y-auto max-h-[calc(100vh-72px)] px-4 md:px-8 py-6">
      {/* ✅ Breadcrumb Header */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 hover:cursor-pointer">
          <ArrowLeft
            onClick={() => router.back()}
            className="w-4 h-4 text-gray-600 cursor-pointer"
          />
          <span onClick={() => router.push("/agent/dashboard")}>
            Renter Requests
          </span>
          <span>›</span>
          <span>View</span>
          <span>›</span>
          <span className="font-medium text-gray-800">View Agent Listing</span>
        </div>

        {/* ✅ Status Badge */}
        {isAdminApproved ? (
          isPaid ? (
            <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
              Paid & Approved
            </span>
          ) : (
            <span className="text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
              Pending
            </span>
          )
        ) : (
          <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
            Waiting Approval
          </span>
        )}
      </div>

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

        {/* --- Payment Section --- */}
        {isAdminApproved && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
            <div
              className="p-6 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("payment")}
            >
              <h3 className="font-semibold text-gray-900">Payment</h3>
              {openSection === "payment" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {openSection === "payment" && (
              <div className="px-6 pb-6 border-t border-gray-100 animate-fadeIn">
                <div className="flex justify-between items-center py-3">
                  <p className="text-gray-700 font-medium">Amount:</p>
                  <p className="font-semibold text-gray-900">$171.50</p>
                </div>
                <div className="flex justify-end mt-3">
                  <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Confirm Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Cost Section */}
      {showCost && (
        <div
          className={`bg-white rounded-xl shadow-sm p-6 mb-6 ${
            !isFree ? "border border-purple-400" : ""
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cost</h2>

          <div className="border rounded-lg bg-gray-50 p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Amount</p>
              <p className="font-semibold text-gray-900">
                {isFree ? "Free" : "$171.50"}
              </p>
            </div>

            {isFree ? (
              <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                Approved
              </span>
            ) : isAdminApproved ? (
              <CheckCircle className="text-green-500 w-5 h-5" />
            ) : (
              <AlertCircle className="text-yellow-500 w-5 h-5" />
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end mt-6">
        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Match Request
        </button>
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
