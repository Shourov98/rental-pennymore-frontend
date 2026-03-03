"use client";

import Image from "next/image";
import Link from "next/link";

const HERO_BG_SRC = "/hero-bg.svg";

export default function BrucherLanding() {
  return (
    <div className="relative w-full min-h-screen">
      <section className="relative z-0 flex min-h-screen w-full items-center justify-center px-4 py-8 text-center text-white sm:px-6 md:px-12 lg:px-20">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO_BG_SRC}
            alt="NYC Skyline"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 z-0 " />
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0">
              <Image
                src="/auth-bg.svg"
                alt="City Illustration"
                fill
                className="object-cover object-bottom opacity-20"
              />
            </div>

            <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[280px_1fr] lg:items-center lg:gap-16 lg:px-20 lg:py-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <Link href="/">
                  <Image
                    src="/Logo_1.svg"
                    alt="BeforeListed"
                    width={260}
                    height={160}
                    className="h-auto w-[220px] sm:w-[240px]"
                  />
                </Link>
              </div>

              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                    About
                  </h1>
                  <Image
                    src="/title_bottom.svg"
                    alt="Underline"
                    width={150}
                    height={14}
                    className="w-36"
                  />
                </div>

                <p className="w-full text-base leading-relaxed text-left text-slate-700 sm:text-lg">
                  BeforeListed™ is an intake-focused marketing website used by
                  licensed New York real estate agents to collect renter
                  requests. Agents may conduct outreach in an effort to
                  identify potential rental opportunities, including
                  opportunities that may not be publicly advertised.
                </p>
                <p className="w-full text-base leading-relaxed text-left text-slate-700 sm:text-lg">
                  The website does not advertise or display rental listings and
                  does not guarantee the availability of any rental property or
                  represent that any specific property is currently available
                  for rent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
