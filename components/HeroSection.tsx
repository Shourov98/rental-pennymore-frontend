"use client";

import Image from "next/image";
import { MapPin, DollarSign } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Redux
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { setPriceRange } from "@/store/slices/preferenceSlice";
import {
  selectAuth,
  selectIsAuthed,
  selectReferrerName,
} from "@/store/slices/authSlice";

import LocationModal from "./LocationModal";
import boroughNeighborhoods from "@/data/neighborhoods.manhattan-brooklyn";

const HERO_BG_SRC = "/hero-bg.svg";

export default function HeroSection() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showAgentNotice, setShowAgentNotice] = useState(false);
  const agentNoticeTimeoutRef = useRef<number | null>(null);

  const priceRange = useSelector(
    (state: RootState) => state.preferences.priceRange,
  );
  const referrerName = useSelector(selectReferrerName);
  const auth = useSelector(selectAuth);
  const isAuthed = useSelector(selectIsAuthed);
  const locations = useSelector(
    (state: RootState) => state.preferences.locations,
  );
  const authReferrerTitle =
    (auth as { referrerTitle?: string | null }).referrerTitle ?? null;
  const agentName =
    auth.agentProfile?.userInfo?.fullName ?? auth.user?.fullName ?? null;
  const agentTitle = auth.agentProfile?.title ?? auth.user?.title ?? null;
  const role = auth.role ?? auth.user?.role ?? null;
  const isRenter = role === "Renter";
  const isAgent = role === "Agent";
  const headingName = isAgent
    ? (agentName ?? "Tuval Mor")
    : referrerName || "Tuval Mor";
  const headingTitle = isAgent ? agentTitle : authReferrerTitle;
  const neighborhoodLabelByKey = useMemo(() => {
    const map = new globalThis.Map<string, string>();
    (
      Object.keys(boroughNeighborhoods) as Array<"Manhattan" | "Brooklyn">
    ).forEach((borough) => {
      boroughNeighborhoods[borough].sections.forEach((section) => {
        section.items.forEach((item) => {
          map.set(`${borough}:${item.key}`, item.label);
        });
      });
    });
    return map;
  }, []);
  const handleMinPrice = (value: string) => {
    dispatch(
      setPriceRange({
        min: Number(value),
        max: priceRange.max,
      }),
    );
  };

  const handleMaxPrice = (value: string) => {
    dispatch(
      setPriceRange({
        min: priceRange.min,
        max: Number(value),
      }),
    );
  };

  useEffect(() => {
    return () => {
      if (agentNoticeTimeoutRef.current) {
        window.clearTimeout(agentNoticeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center text-center text-white">
      {/* Background */}
      <div className="absolute inset-0 z-10">
        <Image
          src={HERO_BG_SRC}
          alt="NYC Skyline"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Text */}
      <div className="px-4 sm:px-8 max-w-4xl mx-auto z-10">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
          style={{ textShadow: "0px 2px 3px rgba(255,255,255,0.4)" }}
        >
          Submit a request
        </h1>
      </div>

      {/* Form */}
      <div className="mt-10 bg-white text-gray-900 rounded-2xl shadow-md w-[90%] sm:w-[85%] md:w-[80%] lg:w-[70%] xl:w-[60%] px-4 sm:px-6 md:px-8 py-6 z-10">
        <span className="text-sm text-gray-600 sm:text-base md:text-md  mb-4 text-center block">
          Your request will be submitted to: <br />
        </span>
        <h3 className="text-sm text-gray-600 sm:text-base md:text-lg font-semibold mb-4 text-center">
          {headingName}
          <br />
          {headingTitle}
        </h3>

        <form className="flex flex-col sm:flex-row items-center gap-4 w-full">
          {/* Location */}
          <div className="flex flex-col w-full sm:w-2/5">
            <label className="text-xs text-left font-medium pl-2 mb-1 text-gray-600">
              Location
            </label>

            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="flex max-h-20 overflow-y-auto items-start bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-500 transition"
            >
              <MapPin size={20} className="text-blue-600 mr-2 shrink-0" />
              <span className="text-gray-500 text-xs leading-5">
                {locations.length === 0
                  ? "Choose Borough and neighborhoods"
                  : locations.map(
                      (loc: RootState["preferences"]["locations"][number]) => {
                        const labels = (loc.neighborhoods || []).map(
                          (key: string) =>
                            neighborhoodLabelByKey.get(
                              `${loc.borough}:${key}`,
                            ) ?? key,
                        );

                        return (
                          <span key={loc.borough} className="block">
                            <span className="font-semibold">{loc.borough}</span>
                            <span className="block">{labels.join(", ")}</span>
                          </span>
                        );
                      },
                    )}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col w-full sm:w-[20%]">
            <label className="text-xs text-left font-medium pl-2 mb-1 text-gray-600">
              Price
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <DollarSign size={20} className="text-blue-600 mr-2" />
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min === 0 ? "" : priceRange.min}
                step={25}
                onChange={(e) => handleMinPrice(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col w-full sm:w-[20%]">
            <label className="text-xs font-medium mb-1 text-gray-600 invisible sm:visible">
              &nbsp;
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <DollarSign size={20} className="text-blue-600 mr-2" />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max === 0 ? "" : priceRange.max}
                step={25}
                onChange={(e) => handleMaxPrice(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => {
              if (isAuthed && isRenter) {
                router.push("/pre-market-listing");
                return;
              }

              if (isAuthed && isAgent) {
                setShowAgentNotice(true);
                if (agentNoticeTimeoutRef.current) {
                  window.clearTimeout(agentNoticeTimeoutRef.current);
                }
                agentNoticeTimeoutRef.current = window.setTimeout(() => {
                  setShowAgentNotice(false);
                }, 2000);
                return;
              }

              router.push("/signin?redirect=pre-market-listing");
            }}
            className="w-full sm:w-[20%] bg-blue-500 text-white text-sm font-semibold rounded-xl mt-5 px-6 py-2 hover:bg-blue-700"
          >
            Next
          </button>
        </form>
      </div>

      {showAgentNotice ? (
        <div className="fixed bottom-6 right-6 -translate-x-1/2 bg-red-400 text-white shadow-lg rounded-xl px-4 py-3 text-sm z-50">
          Request form is only for renters, not for agents.
        </div>
      ) : null}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </section>
  );
}
