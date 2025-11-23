"use client";

import { useState } from "react";
import { Eye, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import FilterModal from "@/components/modals/FilterModals";

// ---------------------
// Neighborhood Mapping
// ---------------------
const boroughNeighborhoods: Record<string, string[]> = {
  Manhattan: [
    "Harlem",
    "Upper West Side",
    "Upper East Side",
    "Hell’s Kitchen",
    "Midtown East",
    "Chelsea",
    "SoHo",
    "Tribeca",
    "Financial District",
    "West Village",
    "East Village",
    "Lower East Side",
    "Chinatown",
  ],
  Brooklyn: [
    "Williamsburg",
    "Greenpoint",
    "Bushwick",
    "Bedford-Stuyvesant",
    "Brooklyn Heights",
    "Park Slope",
    "Fort Greene",
    "Clinton Hill",
    "Crown Heights",
    "Flatbush",
    "Kensington",
    "Bay Ridge",
    "Bensonhurst",
    "Brighton Beach",
    "Sheepshead Bay",
    "DUMBO",
  ],
};

// ---------------------
// Types
// ---------------------
interface Request {
  id: number;
  submitDate: string;
  borough: string;
  neighborhood: string;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  requested: boolean;
}

interface FilterParams {
  borough: string | null;
  neighborhoods: string[];
  bedrooms: string[];
  bathrooms: string[];
  maxPrice: number | null;
  // Add other filter properties as needed
}

// ---------------------
// Mock Data
// ---------------------
const allRequests: Request[] = [
  {
    id: 1,
    submitDate: "11/22/2025",
    borough: "Manhattan",
    neighborhood: "Chelsea",
    maxPrice: 7500,
    bedrooms: 5,
    bathrooms: 2,
    requested: false, // ➜ Available
  },
  {
    id: 2,
    submitDate: "11/19/2025",
    borough: "Brooklyn",
    neighborhood: "Williamsburg",
    maxPrice: 6100,
    bedrooms: 3,
    bathrooms: 1,
    requested: true, // ➜ Pending
  },
  {
    id: 3,
    submitDate: "11/13/2025",
    borough: "Manhattan",
    neighborhood: "Harlem",
    maxPrice: 5200,
    bedrooms: 4,
    bathrooms: 2,
    requested: false,
  },
];

export default function RenterRequestsPage() {
  const router = useRouter();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(allRequests);

  // APPLY FILTER
  const handleApplyFilter = (filter: FilterParams) => {
    let results = allRequests;

    // Borough
    if (filter.borough) {
      results = results.filter((item) => item.borough === filter.borough);
    }

    // Neighborhoods (multi)
    if (filter.neighborhoods && filter.neighborhoods.length > 0) {
      results = results.filter((item) =>
        filter.neighborhoods?.includes(item.neighborhood)
      );
    }

    // Bedrooms (multi)
    if (filter.bedrooms?.length > 0) {
      results = results.filter((item) =>
        filter.bedrooms.includes(
          item.bedrooms === 0 ? "Studio" : `${item.bedrooms}BR`
        )
      );
    }

    // Bathrooms (multi)
    if (filter.bathrooms?.length > 0) {
      results = results.filter((item) =>
        filter.bathrooms.includes(String(item.bathrooms))
      );
    }

    // Max Price
    if (typeof filter.maxPrice === "number") {
      results = results.filter((item) => item.maxPrice <= filter.maxPrice!);
    }

    setFilteredData(results);
  };

  return (
    <section className="bg-gray-50 min-h-screen px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-5 rounded-xl shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Renter Requests
        </h1>

        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-2xl font-medium hover:bg-blue-700 transition mt-3 sm:mt-0"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* ----------------------
          TABLE
      ---------------------- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-blue-100 text-gray-800">
              <tr>
                <th className="py-3 px-5 text-left">Submit Date</th>
                <th className="py-3 px-5 text-left">Borough</th>
                <th className="py-3 px-5 text-left">Max Price</th>
                <th className="py-3 px-5 text-left">Bedrooms</th>
                <th className="py-3 px-5 text-left">Bathrooms</th>
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  <td className="py-3 px-5 whitespace-nowrap">
                    {req.submitDate}
                  </td>
                  <td className="py-3 px-5">{req.borough}</td>
                  <td className="py-3 px-5">${req.maxPrice}</td>
                  <td className="py-3 px-5">{req.bedrooms}</td>
                  <td className="py-3 px-5">{req.bathrooms}</td>

                  <td className="py-3 px-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700`}
                    >
                      Matched
                    </span>
                  </td>

                  <td className="py-3 px-5 flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/agent/matches/${req.id}`)}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
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
      </div>

      {/* Pagination (not connected to mock data yet) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 gap-3">
        <p>No of Results: {filteredData.length} out of 100</p>

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

      {/* Filter Drawer */}
      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
      />
    </section>
  );
}
