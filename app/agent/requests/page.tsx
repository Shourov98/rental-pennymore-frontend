"use client";

import { useState } from "react";
import { Eye, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function RenterRequestsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  // Mock data
  const requests = [
    {
      id: 1,
      neighborhood: "Manhattan",
      price: 7500.55,
      bedrooms: 5,
      bathrooms: 2,
      status: "Pending",
    },
    {
      id: 2,
      neighborhood: "Brooklyn",
      price: 6100.25,
      bedrooms: 3,
      bathrooms: 1,
      status: "Pending",
    },
    {
      id: 3,
      neighborhood: "Queens",
      price: 5200.0,
      bedrooms: 4,
      bathrooms: 2,
      status: "Pending",
    },
  ];

  return (
    <section className="bg-gray-50 min-h-screen px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white shadow-sm rounded-xl p-5">
        <h1 className="text-2xl font-bold text-gray-900">Renter Requests</h1>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-2xl font-medium hover:bg-blue-700 transition"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-100 text-gray-800">
            <tr>
              <th className="py-3 px-5 font-semibold">No</th>
              <th className="py-3 px-5 font-semibold">Neighborhood</th>
              <th className="py-3 px-5 font-semibold">Price Range</th>
              <th className="py-3 px-5 font-semibold">No. Bed Rooms</th>
              <th className="py-3 px-5 font-semibold">No. of Bath</th>
              <th className="py-3 px-5 font-semibold">Status</th>
              <th className="py-3 px-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr
                key={req.id}
                className="border-t border-gray-300 hover:bg-gray-50 transition text-gray-700"
              >
                <td className="py-3 px-5">
                  {String(index + 1).padStart(2, "0")}
                </td>
                <td className="py-3 px-5">{req.neighborhood}</td>
                <td className="py-3 px-5">${req.price.toFixed(2)}</td>
                <td className="py-3 px-5">{req.bedrooms}</td>
                <td className="py-3 px-5">{req.bathrooms}</td>
                <td className="py-3 px-5">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Pending
                  </span>
                </td>
                <td className="py-3 px-5 flex justify-end gap-3">
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <p>No of Results: 8 out of 100</p>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full border hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-2 w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white">
            1
          </button>
          <button className="p-2 w-8 h-8 flex items-center justify-center rounded-md border hover:bg-gray-100">
            2
          </button>
          <button className="p-2 rounded-full border hover:bg-gray-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
          <div className="bg-white w-80 sm:w-96 h-full p-6 shadow-xl animate-slideIn relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-gray-900 font-semibold">Filter</h2>
              <button
                onClick={() => setFilterOpen(false)}
                className="text-gray-800 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Filter options */}
            <div className="space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
              {/* Bedrooms */}
              <div>
                <p className="font-medium text-gray-700 mb-2">Bedrooms</p>
                <div className="grid grid-cols-5 gap-2">
                  {["Studio", "1BR", "2BR", "3BR", "4BR+"].map((b) => (
                    <button
                      key={b}
                      className={`py-2 rounded-2xl border border-gray-300 text-sm font-medium ${
                        b === "Studio"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <p className="font-medium text-gray-700 mb-2">Bathrooms</p>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4+"].map((b) => (
                    <button
                      key={b}
                      className={`py-2 rounded-2xl border border-gray-300 text-sm font-medium ${
                        b === "1"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pets Allowed */}
              <div>
                <p className="font-medium text-gray-700 mb-2">Pets Allowed</p>
                <div className="flex gap-2">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      className={`flex-1 py-2 rounded-2xl border border-gray-300 text-sm font-medium ${
                        opt === "Yes"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="font-medium text-gray-700 mb-2">Price</p>
                <select className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-700 bg-gray-50 focus:ring-1focus:ring-blue-300 focus:border-blue-500">
                  <option>Amount</option>
                  <option>Below $3000</option>
                  <option>$3000 - $7000</option>
                  <option>Above $7000</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between gap-3">
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}
