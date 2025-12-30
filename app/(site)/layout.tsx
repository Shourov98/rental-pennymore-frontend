import React from "react";
import AdvertiseBar from "@/components/navbar/AdvertiseBar";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import ComplianceStrip from "@/components/navbar/ComplienceStrip";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* --- Top Advertising Text Bar --- */}

      {/* --- Navbar --- */}
      <ComplianceStrip />
      <Navbar />
      <AdvertiseBar />

      {/* --- Main Content Area --- */}
      <main className="flex-1">{children}</main>

      {/* --- Footer --- */}
      <Footer />
    </div>
  );
}
