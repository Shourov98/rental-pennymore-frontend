"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";

export default function RenterRequestDetails() {
  const [showModal, setShowModal] = useState(false);

  // 🔹 Mock states (you can replace with backend props)
  const isAdminApproved = true;
  const isRenterApproved = false;
  const isFree = false;

  const showContact = isRenterApproved;
  const showCost = isAdminApproved;

  return (
    <section className="bg-gray-50 min-h-screen px-4 md:px-8 py-6">
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

        {/* ✅ Status Badge */}
        {isAdminApproved ? (
          isRenterApproved ? (
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

      {/* ✅ Contact Details */}
      {showContact && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900">
              Renter Contact Details
            </h2>
            <span className="text-xs border border-blue-400 text-blue-600 px-3 py-1 rounded-full">
              Tuval’s Client
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

      {/* ✅ Collapsible Sections */}
      <div className="space-y-4">
        {isAdminApproved && (
          <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center cursor-pointer">
            <h3 className="font-semibold text-gray-900">Payment</h3>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center cursor-pointer">
          <h3 className="font-semibold text-gray-900">Renter Preference</h3>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* ✅ Request Match Button */}
      {!isAdminApproved && !isRenterApproved && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg"
          >
            Request Match
          </button>
        </div>
      )}

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] sm:w-[500px] p-6 animate-pop">
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              I confirm that I had no prior knowledge of the apartment I am
              introducing to the client before reaching out to my network on the
              client’s behalf and locating this pre-market match that fits the
              renter’s search criteria.
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
      `}</style>
    </section>
  );
}
