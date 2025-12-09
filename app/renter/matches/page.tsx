"use client";

import { useState } from "react";
import AgentContactCard from "@/components/AgentContactCard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Agent {
  id: number;
  image: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  brokerage: string;
}

interface Request {
  id: number;
  requestName: string;
  borough: string;
  neighborhood: string;
  dateRange: string;
  price: string;
  beds: number;
  baths: number;
  status: "active" | "deactive";
  matchedAgents: Agent[];
}

export default function MatchedAgentsPage() {
  const [openRequestId, setOpenRequestId] = useState<number | null>(null);

  // ---------------------------
  // Mock Data
  // ---------------------------
  const requests: Request[] = [
    {
      id: 1,
      requestName: "BeforeListed-1",
      borough: "Manhattan",
      neighborhood: "West Chelsea",
      dateRange: "5/21/25 - 6/21/30",
      price: "$4,250.00",
      beds: 2,
      baths: 1,
      status: "active",
      matchedAgents: [
        {
          id: 101,
          image: "https://randomuser.me/api/portraits/men/31.jpg",
          name: "John Doe",
          email: "example@gmail.com",
          phone: "+8801XXXXXXXXX",
          license: "ABCD1234",
          brokerage: "Alice Realty",
        },
        {
          id: 102,
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          name: "Sarah Miller",
          email: "sarah@example.com",
          phone: "+8801YYYYYYYYY",
          license: "LMNO5678",
          brokerage: "Prime Estates",
        },
      ],
    },

    {
      id: 2,
      requestName: "BeforeListed-2",
      borough: "Brooklyn",
      neighborhood: "Williamsburg",
      dateRange: "5/25/25 - 1/01/24",
      price: "$4,100.00",
      beds: 3,
      baths: 2,
      status: "active",
      matchedAgents: [
        {
          id: 103,
          image: "https://randomuser.me/api/portraits/men/28.jpg",
          name: "Michael Ross",
          email: "ross@example.com",
          phone: "+8801ZZZZZZZZZ",
          license: "XQWE9264",
          brokerage: "Urban Homes",
        },
      ],
    },
  ];

  // Toggle Accordion
  const toggleAccordion = (id: number) => {
    setOpenRequestId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full min-h-screen bg-[#F8F9FB] px-4 md:px-8 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#0A093D]">
          Agents Matched With Requests
        </h1>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {requests.map((req) => {
          const isOpen = openRequestId === req.id;

          return (
            <div
              key={req.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
                onClick={() => toggleAccordion(req.id)}
              >
                <div>
                  <h2 className="text-lg font-semibold text-[#0A093D]">
                    {req.requestName}
                  </h2>

                  <p className="text-sm text-gray-600">
                    {req.borough} • {req.neighborhood}
                  </p>

                  <p className="text-sm text-gray-400">
                    {req.dateRange} • Min {req.price}
                  </p>

                  {/* Agent Count */}
                  <p className="mt-1 text-sm font-medium text-blue-600">
                    {req.matchedAgents.length} Agent
                    {req.matchedAgents.length > 1 ? "s" : ""} Matched
                  </p>
                </div>

                <div className="text-gray-500">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {req.matchedAgents.map((agent) => (
                    <AgentContactCard key={agent.id} agent={agent} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fade-in Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
