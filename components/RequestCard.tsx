import { CalendarDays, BedDouble, Bath, Pencil, Trash2 } from "lucide-react";

interface RequestCardProps {
  requestName: string;
  locationEntries?: { borough: string; neighborhoods: string }[];
  dateRange: string;
  priceRange: string;
  bedsLabel: string;
  bathsLabel: string;
  status: "active" | "deactive";
  disableActivate?: boolean;
  isMutating?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export default function RequestCard({
  requestName,
  locationEntries = [],
  dateRange,
  priceRange,
  bedsLabel,
  bathsLabel,
  status,
  disableActivate = false,
  isMutating = false,
  onEdit,
  onDelete,
  onToggleStatus,
}: RequestCardProps) {
  const isActive = status === "active";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between transition hover:shadow-md hover:-translate-y-1 duration-200">
      {/* Request Name + Status */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-[#0B0B2C]">{requestName}</h3>

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Deactive"}
        </span>
      </div>

      {/* Borough + Neighborhood */}
      {locationEntries.length > 0 && (
        <div className="mt-1 flex flex-col gap-2">
          {locationEntries.map((loc, index) => (
            <div
              key={`${loc.borough}-${index}`}
              className="flex flex-col leading-snug"
            >
              <span className="font-semibold text-gray-900">{loc.borough}</span>
              <span className="text-gray-600">{loc.neighborhoods}</span>
            </div>
          ))}
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
        <CalendarDays className="w-4 h-4" />
        <span>{dateRange}</span>
      </div>

      {/* Price */}
      <div className="mt-4">
        <p className="text-gray-500 text-sm">Price Range</p>
        <p className="text-xl font-bold text-[#0B0B2C]">{priceRange}</p>
      </div>

      {/* Beds & Baths */}
      <div className="flex items-center gap-3 mt-3 text-gray-600 text-sm">
        <div className="flex items-center gap-1">
          <BedDouble className="w-4 h-4 text-gray-500" />
          <span>{bedsLabel}</span>
        </div>

        <span className="text-gray-300">|</span>

        <div className="flex items-center gap-1">
          <Bath className="w-4 h-4 text-gray-500" />
          <span>{bathsLabel}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col gap-3">
        {/* First Row: Edit + Delete */}
        <div className="flex gap-3">
          {/* Edit */}
          <button
            onClick={onEdit}
            className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white font-medium text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Pencil size={16} /> Edit
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-medium text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>

        {/* Second Row: Activate / Deactivate */}
        <button
          disabled={isMutating || (!isActive && disableActivate)}
          onClick={onToggleStatus}
          className={`w-full py-2.5 font-medium text-sm rounded-2xl transition-all
          ${
            isActive
              ? "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
              : disableActivate
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-50 text-green-600 hover:bg-green-500 hover:text-white"
          }
          ${isMutating ? "opacity-70 cursor-not-allowed" : ""}
        `}
        >
          {isMutating ? "Please wait..." : isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
