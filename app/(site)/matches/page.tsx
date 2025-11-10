"use client";

import Image from "next/image";

export default function MatchesPage() {
  const matches = [
    {
      id: 1,
      name: "Nick",
      request: "BeforeListed-1",
      message: "request is active!",
      time: "5h ago",
      avatar: "/agent1.png", // must be in /public
    },
    {
      id: 2,
      name: "Nick",
      request: "BeforeListed-1",
      message:
        "just matched with a pre-market listing shared by John at Compass!",
      time: "5h ago",
      avatar: "/agent2.png", // must be in /public
    },
  ];

  return (
    <section className="w-full bg-gray-50 min-h-screen py-10 px-4 sm:px-8 md:px-12">
      {/* Page Title */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
          Matches
        </h1>
      </div>

      {/* Matches List */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-4 sm:p-6 overflow-y-auto">
        {matches.map((match) => (
          <div
            key={match.id}
            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-b last:border-none border-gray-200"
          >
            {/* Agent Avatar */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full overflow-hidden">
              <Image
                src={match.avatar}
                alt={match.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Match Info */}
            <div className="flex-1">
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold">{match.name}</span>{" "}
                <span className="font-bold text-gray-900">
                  “{match.request}”
                </span>{" "}
                {match.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">{match.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
