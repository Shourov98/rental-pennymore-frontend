"use client";

import { Calendar, DollarSign, MapPin } from "lucide-react";

export default function RenterPreferenceView({
  data,
}: {
  data: {
    borough: string;
    neighborhoods: string[];
    locationEntries?: { borough: string; neighborhoods: string }[];
    minPrice: string;
    maxPrice: string;
    earliestDate: string;
    latestDate: string;
    bedrooms: string[];
    bathrooms: string[];
    unitFeatures: string[];
    buildingFeatures: string[];
    petPolicy: string[];
    guarantor: string[];
    preferences?: string[];
    note?: string;
  };
}) {
  const bedroomOptions = ["Studio", "1BR", "2BR", "3BR", "4BR+"];
  const bathroomOptions = ["1", "2", "3", "4+"];

  const renderBadgeRow = (items: string[]) =>
    items.length ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">Not specified</p>
    );

  const renderCheckboxList = (items: string[]) =>
    items.length ? (
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked
              readOnly
              className="w-4 h-4 text-blue-600 cursor-not-allowed"
              onClick={(e) => e.preventDefault()}
            />
            <span className="text-gray-800">{item}</span>
          </label>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">Not specified</p>
    );

  const renderPreferencesList = (items: string[]) => {
    if (!items.length) {
      return <p className="text-sm text-gray-500">Not specified</p>;
    }

    const mid = Math.ceil(items.length / 2);
    const left = items.slice(0, mid);
    const right = items.slice(mid);

    const renderColumn = (column: string[], offset: number) => (
      <div className="space-y-2">
        {column.map((item, idx) => (
          <div
            key={item}
            className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
          >
            <span className="w-6 text-sm font-semibold text-gray-700">
              {offset + idx + 1}.
            </span>
            <span className="text-sm text-gray-800">{item}</span>
          </div>
        ))}
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderColumn(left, 0)}
        {renderColumn(right, left.length)}
      </div>
    );
  };

  const locationEntries = data.locationEntries ?? [];
  const fallbackBorough = data.borough || "Not specified";
  const fallbackNeighborhoods =
    data.neighborhoods.length > 0
      ? data.neighborhoods.join(" • ")
      : "Not specified";

  return (
    <div className="space-y-6 text-sm text-gray-700">
      {/* Moving Date */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Moving Date</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <Calendar size={16} className="text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Earliest</p>
              <p className="font-medium text-gray-900">{data.earliestDate}</p>
            </div>
          </div>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <Calendar size={16} className="text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Latest</p>
              <p className="font-medium text-gray-900">{data.latestDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Price Range</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <DollarSign size={16} className="text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Minimum Price</p>
              <p className="font-medium text-gray-900">{data.minPrice}</p>
            </div>
          </div>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <DollarSign size={16} className="text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Maximum Price</p>
              <p className="font-medium text-gray-900">{data.maxPrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Location</p>
        <div className="flex items-start bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <MapPin size={16} className="text-blue-600 mr-2 mt-0.5 shrink-0" />
          {locationEntries.length > 0 ? (
            <div className="flex flex-col gap-2">
              {locationEntries.map((loc, index) => (
                <div
                  key={`${loc.borough}-${index}`}
                  className="flex flex-col leading-snug"
                >
                  <span className="font-semibold text-gray-900">
                    {loc.borough}
                  </span>
                  <span className="text-gray-700">{loc.neighborhoods}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-900">{fallbackBorough}</p>
              <p className="text-gray-700">{fallbackNeighborhoods}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Bedrooms</p>
        <div className="grid grid-cols-5 gap-2">
          {bedroomOptions.map((b) => (
            <div
              key={b}
              className={`py-2 text-center rounded-lg border text-sm font-medium ${
                data.bedrooms.includes(b)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Bathrooms</p>
        <div className="grid grid-cols-4 gap-2">
          {bathroomOptions.map((b) => (
            <div
              key={b}
              className={`py-2 text-center rounded-lg border text-sm font-medium ${
                data.bathrooms.includes(b)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Unit Features
          </p>
          {renderCheckboxList(data.unitFeatures)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Building Features
          </p>
          {renderCheckboxList(data.buildingFeatures)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Pet Policy
          </p>
          {renderCheckboxList(data.petPolicy)}
        </div>
      </div>

      {/* Guarantor */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">
          Guarantor Required
        </p>
        {renderCheckboxList(data.guarantor)}
      </div>

      {/* Preferences */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Preferences</p>
        {renderPreferencesList(data.preferences ?? [])}
      </div>

      {/* Note */}
      {data.note && (
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">Note</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-gray-700 whitespace-pre-line">{data.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
