"use client";

import Image from "next/image";
import Link from "next/link";

const HERO_BG_SRC = "/hero-bg.png";

export default function BrucherLanding() {
  return (
    <div className="relative w-full min-h-[85vh]">
      <section className="relative z-0 w-full min-h-[85vh] flex flex-col justify-center items-center text-center text-white">
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
        <section className="relative z-10 w-full min-h-[70vh] px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-6xl">
            <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0">
                <Image
                  src="/auth-bg.svg"
                  alt="City Illustration"
                  fill
                  className="object-cover object-bottom opacity-20"
                />
              </div>

              <div className="relative grid gap-12 px-10 py-14 sm:px-14 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-20 lg:py-16">
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

                  <p className="text-base leading-relaxed text-slate-700 text-left sm:text-lg">
                    BeforeListed™ is an intake-focused marketing website used by
                    licensed New York real estate agents to collect renter
                    requests. Agents may conduct outreach in an effort to
                    identify potential rental opportunities, including
                    opportunities that may not be publicly advertised.
                  </p>
                  <p className="text-base leading-relaxed text-slate-700 text-left sm:text-lg">
                    The website does not advertise or display rental listings
                    and does not guarantee the availability of any rental
                    property or represent that any specific property is
                    currently available for rent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
