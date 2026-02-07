import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="relative w-full min-h-[70vh] px-6 py-16 md:px-12 lg:px-20">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-bg.jpg"
          alt="NYC Skyline"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-slate-900/25" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-2xl backdrop-blur-sm">
          <div className="absolute inset-0">
            <Image
              src="/auth-bg.svg"
              alt="City Illustration"
              fill
              className="object-cover object-bottom opacity-20"
            />
          </div>

          <div className="relative grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[220px_1fr] lg:gap-12 lg:px-14 lg:py-12">
            <div className="flex flex-col items-center gap-4 lg:items-start">
              <Link href="/">
                <Image
                  src="/Logo_1.svg"
                  alt="BeforeListed"
                  width={200}
                  height={120}
                  className="h-auto w-[170px]"
                />
              </Link>
            </div>

            <div className="flex flex-col gap-4 text-center lg:text-left">
              <div className="flex flex-col items-center gap-2 lg:items-start">
                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                  About
                </h1>
                <Image
                  src="/title_bottom.svg"
                  alt="Underline"
                  width={120}
                  height={12}
                  className="w-28"
                />
              </div>

              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                BeforeListed™ is an intake-focused marketing website used by
                licensed New York real estate agents to collect renter requests.
                Agents may conduct outreach in an effort to identify potential
                rental opportunities, including opportunities that may not be
                publicly advertised.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                The website does not advertise or display rental listings and
                does not guarantee the availability of any rental property or
                represent that any specific property is currently available for
                rent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
