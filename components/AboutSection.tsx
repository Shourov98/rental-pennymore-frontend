"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="md:mx-3 md:mt-3 lg:mx-6 lg:mt-6">
      <div className="relative w-full py-16 px-6 rounded-2xl md:px-16 lg:px-24 bg-white">
        {/* Background Illustration fills entire section */}
        <div className="absolute p-10 inset-0 z-0">
          <Image
            src="/auth-bg.svg"
            alt="City Background"
            fill
            priority
            className="object-cover object-bottom opacity-90"
          />
        </div>

        {/* Semi-transparent white background for content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-8 lg:px-16 flex flex-col items-center gap-5 md:gap-5 bg-white/60 backdrop-blur-[2px] rounded-2xl py-5">
          {/* Title */}
          <div className="flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
              About
            </h2>
            <Image
              src="/title_bottom.svg"
              alt="Underline"
              width={120}
              height={12}
              className="w-28 md:w-32"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Left Side — Logo */}
            <div className="shrink-0 w-full md:w-1/3 text-center md:text-left">
              {/* Logo */}
              <Link href="/">
                <Image src="/Logo_1.svg" alt="Logo" width={250} height={200} />
              </Link>
            </div>

            {/* Right Side — About Content */}
            <div className="w-full md:w-2/3 text-center md:text-left">
              {/* Description */}
              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                Our platform connects renters with licensed agents who know and
                can provide access to pre-market listings — apartments not yet
                listed or published on major platforms like StreetEasy or
                Zillow. By leveraging agent networks and insider knowledge, we
                give renters a head start to discover and secure apartments
                before they hit the open market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
