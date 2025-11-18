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

export default function RenterRequestDetails() {
  const [showModal, setShowModal] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // 🔹 Mock states
  const isAdminApproved = true;
  const isRenterApproved = false;
  const isFree = false;

  const showContact = isRenterApproved;
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

        {/* --- Renter Preferences Section --- */}
        {/* --- Renter Preferences Section --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
          <div
            className="p-6 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("renter")}
          >
            <h3 className="font-semibold text-gray-900">Renter Preference</h3>
            {openSection === "renter" ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>

          {openSection === "renter" && (
            <div className="px-6 pb-6 border-t border-gray-100 animate-fadeIn max-h-[65vh] overflow-y-auto">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-sm">
                {/* Neighborhood */}
                <div>
                  <p className="font-medium text-gray-800 mb-2">Neighborhood</p>
                  <div className="flex gap-4 text-gray-700">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="neighborhood"
                        defaultChecked
                        disabled
                        className="accent-blue-600"
                      />
                      <span>Manhattan</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="neighborhood"
                        disabled
                        className="accent-blue-600"
                      />
                      <span>Brooklyn</span>
                    </label>
                  </div>
                </div>

                {/* Borough */}
                <div>
                  <p className="font-medium text-gray-800 mb-2">Borough</p>
                  <input
                    type="text"
                    value="West Chelsea"
                    readOnly
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-800 mb-2">Address</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value="123 Hudson St"
                      readOnly
                      disabled
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                    />
                    <input
                      type="text"
                      value="5A"
                      readOnly
                      disabled
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="font-medium text-gray-800 mb-2">
                    Pre-Market Price
                  </p>
                  <input
                    type="text"
                    value="$4,250.00"
                    readOnly
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Date */}
                <div>
                  <p className="font-medium text-gray-800 mb-2">
                    Estimate listing end date
                  </p>
                  <input
                    type="text"
                    value="5/21/25 - 6/21/25"
                    readOnly
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Bedrooms */}
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-800 mb-2">Bedrooms</p>
                  <div className="grid grid-cols-5 gap-2 text-gray-700">
                    {["Studio", "1BR", "2BR", "3BR", "4BR+"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        disabled
                        className={`py-2 rounded-lg border text-sm font-medium ${
                          b === "2BR"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        } cursor-default`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-800 mb-2">Bathrooms</p>
                  <div className="grid grid-cols-4 gap-2 text-gray-700">
                    {[1, 2, 3, 4].map((b) => (
                      <button
                        key={b}
                        type="button"
                        disabled
                        className={`py-2 rounded-lg border text-sm font-medium ${
                          b === 1
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        } cursor-default`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-2 gap-4 text-gray-700">
                  <div>
                    <p className="font-medium text-gray-800 mb-2">
                      Unit Features
                    </p>
                    {[
                      "Laundry in unit",
                      "Private outdoor space",
                      "Dishwasher",
                    ].map((f, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled
                          defaultChecked={i !== 1}
                          className="accent-blue-600"
                        />
                        <span>{f}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 mb-2">
                      Building Features
                    </p>
                    {["Doorman", "Elevator", "Laundry in building"].map(
                      (f, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled
                            defaultChecked={i < 2}
                            className="accent-blue-600"
                          />
                          <span>{f}</span>
                        </label>
                      )
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 mb-2">Pet Policy</p>
                    {["Cats allowed", "Dogs allowed"].map((f, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled
                          defaultChecked={i === 0}
                          className="accent-blue-600"
                        />
                        <span>{f}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Guarantor */}
                <div className="md:col-span-2 text-gray-700">
                  <p className="font-medium text-gray-800 mb-2">
                    Accept Guarantor
                  </p>
                  <div className="flex gap-4">
                    {["Personal guarantor", "Third party guarantor"].map(
                      (f, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled
                            defaultChecked={i === 0}
                            className="accent-blue-600"
                          />
                          <span>{f}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </form>
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
