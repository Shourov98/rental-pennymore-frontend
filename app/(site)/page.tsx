"use client";
import AboutSection from "@/components/AboutSection";
import BrucherLanding from "@/components/BrucherLanding";
import ContactSection from "@/components/ContactSection";
import FaqSection from "@/components/FaqSection";
import HeroSection from "@/components/HeroSection";
import MonthlyReportSection from "@/components/MonthlyReportSection";
import {
  selectAuth,
  selectIsAuthed,
  selectReferrerBrokerageName,
  selectReferrerName,
} from "@/store/slices/authSlice";
import { useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const isAuthed = useSelector(selectIsAuthed);
  const auth = useSelector(selectAuth);
  const referrerName = useSelector(selectReferrerName);
  const referrerBrokerageName = useSelector(selectReferrerBrokerageName);
  const role = auth.role ?? auth.user?.role ?? null;
  const isAgent = role === "Agent";
  const displayName = isAgent
    ? auth.agentProfile?.userInfo?.fullName ?? auth.user?.fullName ?? "Tuval Mor"
    : referrerName || "Tuval Mor";
  const displayBrokerageName = isAgent
    ? auth.agentProfile?.brokerageName ?? "The Corcoran Group"
    : referrerBrokerageName || "The Corcoran Group";
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isHydrated) return null;
  if (!isAuthed) return <BrucherLanding />;

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-100 text-gray-900">
      <HeroSection />

      {/* --- How It Works Section --- */}
      <section
        id="how-it-works"
        className="py-16 px-6 md:mx-3 md:mt-3 lg:mx-6 lg:mt-6 rounded-2xl md:px-16 lg:px-24 bg-white"
      >
        <h2 className="text-3xl font-semibold items-center justify-center flex text-center mb-10">
          {/* Logo */}
          <Link href="/">
            <Image src="/Logo_1.svg" alt="Logo" width={250} height={200} />
          </Link>
        </h2>

        <p className="w-full max-w-2xl mx-auto text-base font-semibold text-center mb-10">
          Once your request is accepted and required agency disclosures and agreements are completed,
          your agent may initiate outreach for rental opportunities that may not be publicly advertised.
        </p>

        <p className="w-full max-w-2xl mx-auto text-base font-semibold text-center mb-10">
          For any resulting transaction, you will be represented by 
          the agent identified in the applicable agency disclosure.
          <br /> {displayName}, {displayBrokerageName}.
        </p>

        {/* Steps with arrows */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-12 relative">
          <Step
            icon="/icons/steps/submit.svg"
            title="Step 1"
            subtitle="Submit Preferences"
            description="Submit your rental request preferences for a licensed agent to search on your behalf."
          />

          {/* Arrow between step 1 and 2 */}
          <div className="hidden sm:block mx-2 lg:mx-4 shrink-0 sm:mt-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Mobile arrow - downward */}
          <div className="sm:hidden my-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M12 5V19M12 19L5 12M12 19L19 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <Step
            icon="/icons/steps/connect.svg"
            title="Step 2"
            subtitle="Opportunity Updates"
            description="If a rental opportunity matching your criteria is identified prior to public advertising, your agent may then contact you."
          />

          {/* Arrow between step 2 and 3 */}
          <div className="hidden sm:block mx-2 lg:mx-4 sm:mt-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Mobile arrow - downward */}
          <div className="sm:hidden my-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M12 5V19M12 19L5 12M12 19L19 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <Step
            icon="/icons/steps/decide.svg"
            title="Step 3"
            subtitle="View & Decide"
            description="View the rental, apply if you choose, pay a broker fee only if a lease is signed."
          />
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="scroll-mt-20">
        <AboutSection />
      </section>

      {/* --- Monthly Report Section --- */}
      <section id="monthly-report" className="scroll-mt-20">
        <MonthlyReportSection />
      </section>

      {/* --- FAQ Section --- */}
      <section id="faq" className="scroll-mt-20">
        <FaqSection />
      </section>

      {/* --- Contact Section --- */}
      <section id="contact" className="scroll-mt-20">
        <ContactSection />
      </section>
    </main>
  );
}

function Step({
  icon,
  title,
  subtitle,
  description,
}: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-2 sm:px-4 flex-1">
      <Image
        src={icon}
        alt={title}
        width={80}
        height={80}
        className="mb-4 w-14 sm:w-16 h-auto"
      />
      <h3 className="font-semibold text-lg lg:text-2xl text-text-primary mb-1">
        {title}
      </h3>
      <p className="font-semibold text-base text-text-primary mb-2">
        {subtitle}
      </p>
      <p className="text-gray-600 text-sm sm:text-base">{description}</p>
    </div>
  );
}
