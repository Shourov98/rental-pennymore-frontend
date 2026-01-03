import Image from "next/image";

export default function ComplianceStrip() {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-8/10 mx-auto px-4 py-2 flex items-center justify-between text-xs md:text-sm">
        {/* Left side */}
        <div className="flex flex-col items-center text-gray-600">
          <a
            className="text-cyan-500 hover:underline"
            href="https://www.corcoran.com"
            target="blank"
          >
            <Image
              src="/Corcoran_Logo.png"
              alt="Corcoran"
              width={170}
              height={30}
              priority
            />
          </a>
          <span className="hidden font-sm md:font-md sm:inline">
            Website operated by – <br />
            <span className="ml-1">TUVAL MOR AT THE CORCORAN GROUP</span>
          </span>
        </div>

        {/* Middle side */}
        <div className="flex items-center gap-2 text-gray-700">
          <a
            className="flex hover:underline"
            href="https://www.dos.ny.gov/press/2020/docs/FairHousingNotice_new.pdf"
            target="blank"
          >
            <Image
              src="/equal-housing-logo-black.svg"
              alt="Fair Housing"
              width={70}
              height={70}
            />
            <span className="hidden pt-2 pl-2 italic font-semibold md:inline">
              We are committed to upholding the <br />
              principles of all applicable fair housing laws.
            </span>
          </a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 text-gray-700">
          <span className="hidden text-white pt-2 pl-2 italic font-semibold md:inline">
            text yguyfguyfguyf
          </span>
        </div>
      </div>
    </div>
  );
}
