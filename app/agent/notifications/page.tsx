"use client";

import { Bell, Handshake, CreditCard, Home } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "renter",
      icon: Home,
      title: "New Renter Request",
      message:
        "A new renter has submitted a request for a 2BR apartment in Manhattan.",
      time: "2 hours ago",
      status: "New",
    },
    {
      id: 2,
      type: "agent",
      icon: Handshake,
      title: "Agent Connection Request",
      message:
        "Agent John Wick has requested to connect with renter request #102.",
      time: "Yesterday at 5:12 PM",
      status: "Pending",
    },
    {
      id: 3,
      type: "payment",
      icon: CreditCard,
      title: "Payment Completed",
      message:
        "Agent Alice’s payment for renter connection #205 has been received and marked as Paid.",
      time: "Nov 12, 2025",
      status: "Paid",
    },
  ];

  return (
    <section className="w-full min-h-screen bg-[#F8F9FB] px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0A093D]">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {notifications.map((n) => {
          const Icon = n.icon;
          let badgeColor = "";
          if (n.status === "New") badgeColor = "bg-blue-100 text-blue-600";
          if (n.status === "Pending")
            badgeColor = "bg-yellow-100 text-yellow-700";
          if (n.status === "Paid") badgeColor = "bg-green-100 text-green-700";

          return (
            <div
              key={n.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-gray-50 transition"
            >
              {/* Left: Icon + Info */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0A093D] mb-1">
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>

              {/* Right: Time + Status */}
              <div className="flex flex-col sm:items-end gap-2">
                <span className="text-xs text-gray-400">{n.time}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}
                >
                  {n.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (optional) */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
          <Bell size={36} className="mx-auto mb-3 text-gray-400" />
          <p>No notifications yet.</p>
        </div>
      )}
    </section>
  );
}
