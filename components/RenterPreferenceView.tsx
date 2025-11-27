"use client";

export default function RenterPreferenceView({
  data,
}: {
  data: {
    borough: string;
    neighborhoods: string[];
    minPrice: string;
    maxPrice: string;
    earliestDate: string;
    latestDate: string;
    bedrooms: string;
    bathrooms: number;
    unitFeatures: string[];
    buildingFeatures: string[];
    petPolicy: string[];
    guarantor: string[];
    note: string;
  };
}) {
  return (
    <form className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-700">
      {/* Borough */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900 mb-2">Borough</p>
        <div className="flex gap-6">
          {["Manhattan", "Brooklyn"].map((city, idx) => (
            <label key={idx} className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                checked={data.borough === city}
                readOnly
                className="accent-blue-600 cursor-not-allowed"
                onClick={(e) => e.preventDefault()}
              />
              <span>{city}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Neighborhoods */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900 mb-2">Neighborhoods</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-blue-500">📍</span>
          <input
            type="text"
            value={data.neighborhoods.join(", ")}
            readOnly
            disabled
            className="w-full bg-transparent text-gray-700 outline-none"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-5">
        <div>
          <p className="font-semibold text-gray-900 mb-2">Price Range</p>
          <div className="flex gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Minimum Price</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-blue-500">$</span>
                <input
                  type="text"
                  value={data.minPrice}
                  readOnly
                  disabled
                  className="w-full bg-transparent text-gray-700 outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Maximum Price</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-blue-500">$</span>
                <input
                  type="text"
                  value={data.maxPrice}
                  readOnly
                  disabled
                  className="w-full bg-transparent text-gray-700 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <p className="font-semibold text-gray-900 mb-2">Moving Date</p>
          <div className="flex gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Earliest Date</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-blue-500">📅</span>
                <input
                  type="text"
                  value={data.earliestDate}
                  readOnly
                  disabled
                  className="w-full bg-transparent text-gray-700 outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Latest Date</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-blue-500">📅</span>
                <input
                  type="text"
                  value={data.latestDate}
                  readOnly
                  disabled
                  className="w-full bg-transparent text-gray-700 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900 mb-2">Bedrooms</p>
        <div className="grid grid-cols-6 gap-2">
          {["Studio", "1BR", "2BR", "3BR", "4BR+"].map((b) => (
            <button
              key={b}
              type="button"
              disabled
              className={`py-2 rounded-lg border text-sm font-medium ${
                data.bedrooms === b
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200"
              } cursor-default`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900 mb-2">Bathrooms</p>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((b) => (
            <button
              key={b}
              type="button"
              disabled
              className={`py-2 rounded-lg border text-sm font-medium ${
                data.bathrooms === b
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200"
              } cursor-default`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Unit Features */}
      <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="font-medium text-gray-900 mb-2">Unit Features</p>
          {data.unitFeatures.map((f) => (
            <label key={f} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-blue-600 cursor-not-allowed"
                onClick={(e) => e.preventDefault()}
              />
              <span>{f}</span>
            </label>
          ))}
        </div>

        {/* Building Features */}
        <div>
          <p className="font-medium text-gray-900 mb-2">Building Features</p>
          {data.buildingFeatures.map((f) => (
            <label key={f} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-blue-600 cursor-not-allowed"
                onClick={(e) => e.preventDefault()}
              />
              <span>{f}</span>
            </label>
          ))}
        </div>

        {/* Pet Policy */}
        <div>
          <p className="font-medium text-gray-900 mb-2">Pet Policy</p>
          {data.petPolicy.map((f) => (
            <label key={f} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-blue-600 cursor-not-allowed"
                onClick={(e) => e.preventDefault()}
              />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Guarantor */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900 mb-2">
          Guarantor Type Required
        </p>
        <div className="flex gap-4 text-gray-700">
          {data.guarantor.map((g) => (
            <label key={g} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-blue-600 cursor-not-allowed"
                onClick={(e) => e.preventDefault()}
              />
              <span>{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900 mb-2">Note</p>
        <textarea
          value={data.note}
          readOnly
          disabled
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 resize-none"
        />
      </div>
    </form>
  );
}
