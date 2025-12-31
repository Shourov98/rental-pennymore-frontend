import Image from "next/image";

export default function ComplianceStrip() {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 py-2 flex items-center justify-evenly text-xs md:text-sm">
        {/* Left side */}
        <div className="flex items-center gap-3 text-gray-600">
          <a
            className="text-cyan-500 hover:underline"
            href="https://www.corcoran.com"
            target="blank"
          >
            <Image
              src="/Corcoran_Logo.png"
              alt="Corcoran"
              width={130}
              height={30}
              priority
            />
          </a>
          <span className="hidden sm:inline">
            Website operated by – <br />
            <span className="font-medium ml-1">
              TUVAL MOR AT THE CORCORAN GROUP
            </span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 text-gray-700">
          <a
            className="flex hover:underline"
            href="https://www.dos.ny.gov/press/2020/docs/FairHousingNotice_new.pdf"
            target="blank"
          >
            <Image
              src="/equal-housing-logo-black.svg"
              alt="Fair Housing"
              width={50}
              height={50}
            />
            <span className="hidden pt-2 pl-2 italic font-semibold md:inline">
              We are committed to upholding the <br />
              principles of all applicable fair housing laws.
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
