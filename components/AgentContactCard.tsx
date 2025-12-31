"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface AgentContactCardProps {
  agent: {
    image?: string | null;
    name?: string;
    email?: string;
    phone?: string;
    license?: string;
    brokerage?: string;
    hasGrantAccess?: boolean;
  };
}

export default function AgentContactCard({ agent }: AgentContactCardProps) {
  const safeName = agent.name || "Agent";

  let imageSrc = agent.image || null;

  if (imageSrc) {
    try {
      const url = new URL(imageSrc);
      const allowedHosts = new Set(["randomuser.me"]);

      if (url.hostname && !allowedHosts.has(url.hostname)) {
        imageSrc = null;
      }
    } catch {
      imageSrc = null;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm mt-4 p-4 border border-gray-100 hover:shadow-md transition flex gap-4 items-start">
      {/* LEFT — IMAGE */}
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={safeName}
          width={70}
          height={70}
          className="rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="w-[70px] h-[70px] rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
          <User className="w-8 h-8 text-gray-500" />
        </div>
      )}

      {/* RIGHT — INFO */}
      <div className="flex-1">
        {/* Name + Brokerage */}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {safeName}
          </h3>
          {agent.hasGrantAccess != null && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                agent.hasGrantAccess
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {agent.hasGrantAccess ? "Access granted" : "Awaiting access"}
            </span>
          )}
        </div>
        {agent.brokerage && (
          <p className="text-xs text-gray-500 mb-2">{agent.brokerage}</p>
        )}

        {/* Details */}
        <div className="space-y-1 text-xs">
          <p className="text-gray-500">
            <span className="font-medium text-gray-800">
              {agent.email || "Email not provided"}
            </span>
          </p>

          <p className="text-gray-500">
            <span className="font-medium text-gray-800">
              {agent.phone || "Phone not provided"}
            </span>
          </p>

          {agent.license && imageSrc && (
            <p className="text-gray-500">
              License:{" "}
              <span className="font-medium text-gray-800">{agent.license}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
