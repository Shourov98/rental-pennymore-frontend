"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type MonthlyReport = {
  _id: string;
  link: string;
  month: number;
  year: number;
  isActive?: boolean;
  updatedAt?: string;
};

export default function MonthlyReportSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    // Delay setting state until Embla has initialized
    const snaps = emblaApi.scrollSnapList();
    queueMicrotask(() => setScrollSnaps(snaps));

    emblaApi.on("select", onSelect);

    // Cleanup
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/monthly-reports`, {
          method: "GET",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.success === false) {
          throw new Error(data?.message || "Unable to load monthly reports.");
        }
        const availableReports = (data?.data || [])
          .filter((report: MonthlyReport) => report?.isActive !== false)
          .sort((a: MonthlyReport, b: MonthlyReport) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          });
        setReports(availableReports);
      } catch (error) {
        if (!controller.signal.aborted) {
          setReports([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchReports();

    return () => controller.abort();
  }, []);

  const monthLabel = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    [],
  );

  return (
    <section className="relative w-full bg-gray-100 py-10 px-4 md:mt-3 lg:mt-6 rounded-2xl sm:px-8 md:px-12 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Monthly Report
        </h2>
        <div className="flex justify-center mt-2">
          <Image
            src="/title_bottom.svg"
            alt="Underline"
            width={120}
            height={12}
            className="w-28 md:w-32"
          />
        </div>
      </div>

      {/* Carousel */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-500">
          No monthly reports available.
        </p>
      ) : (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full overflow-x-hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 py-2">
              {reports.map((report) => {
                const monthName = monthLabel[report.month - 1] || "Unknown";
                const updatedLabel = report.updatedAt
                  ? new Date(report.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A";
                return (
                  <div
                    key={report._id}
                    className="min-w-[90%] sm:min-w-[45%] md:min-w-[30%] bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {monthName}, {report.year}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                      Exclusive 15-Second NYC Rental Report <br />
                      This Month’s Renter News, Market Signals & Trends
                    </p>
                    <a
                      href={report.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Link2 size={16} />
                      View Report
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-[-10px] top-1/2 -translate-y-1/2 p-2 hidden sm:flex"
          >
            <ChevronLeft size={30} className="text-gray-600" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-[-10px] top-1/2 -translate-y-1/2  p-2 hidden sm:flex"
          >
            <ChevronRight size={30} className="text-gray-600" />
          </button>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-6 gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === selectedIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
