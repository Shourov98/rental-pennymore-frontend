"use client";

import Image from "next/image";

interface AgentContactCardProps {
  agent: {
    image: string;
    name: string;
    email: string;
    phone: string;
    license: string;
    brokerage: string;
  };
}

export default function AgentContactCard({ agent }: AgentContactCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition flex gap-4 items-start">
      {/* LEFT — IMAGE */}
      <Image
        src={agent.image}
        alt={agent.name}
        width={70}
        height={70}
        className="rounded-full object-cover border border-gray-200"
      />

      {/* RIGHT — INFO */}
      <div className="flex-1">
        {/* Name + Brokerage */}
        <h3 className="text-sm font-semibold text-gray-900 leading-tight">
          {agent.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{agent.brokerage}</p>

        {/* Details */}
        <div className="space-y-1 text-xs">
          <p className="text-gray-500">
            <span className="font-medium text-gray-800">{agent.email}</span>
          </p>

          <p className="text-gray-500">
            <span className="font-medium text-gray-800">{agent.phone}</span>
          </p>

          <p className="text-gray-500">
            License:{" "}
            <span className="font-medium text-gray-800">{agent.license}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
