"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MonthlyReportSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
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

  const reports = [
    {
      month: "January, 2025",
      description:
        "Stay up to date with the latest insights on premarket listings, agent activity, and renter engagement in NYC.",
      updated: "October 10, 2025",
    },
    {
      month: "February, 2025",
      description:
        "Exclusive updates on rental trends, agent engagement, and insights from NYC pre-market listings.",
      updated: "October 10, 2025",
    },
    {
      month: "March, 2025",
      description:
        "Discover in-depth monthly analytics on premarket listings and NYC rental engagement activity.",
      updated: "October 10, 2025",
    },
  ];

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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full overflow-x-hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6 py-2">
            {reports.map((report, index) => (
              <div
                key={index}
                className="min-w-[90%] sm:min-w-[45%] md:min-w-[30%] bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {report.month}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                  {report.description}
                </p>
                <button className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">
                  <Link2 size={16} />
                  View Report
                </button>
                <p className="text-gray-400 text-xs mt-4">
                  Latest updated: {report.updated}
                </p>
              </div>
            ))}
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
    </section>
  );
}
