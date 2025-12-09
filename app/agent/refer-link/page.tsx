export default function AgentDashboard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Refer Link</h1>

      <div className="bg-gray-50 border rounded-xl p-6 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">Refer Link</h3>
          <p className="text-sm text-gray-600">
            Refer your client to get extra perks like incentives.
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          Copy Link
        </button>
      </div>
    </div>
  );
}
