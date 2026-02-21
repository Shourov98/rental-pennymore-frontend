import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A1A1A] text-white py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* --- Left: Logo & Text --- */}
        <div>
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-black">
            <Image src="/Logo_2.svg" alt="Logo" width={200} height={150} />
          </Link>
          <div className="mt-5 ml-10">
            <Image
              src="/equal-house-logo.png"
              alt="Logo"
              width={80}
              height={150}
            />
          </div>
        </div>

        {/* --- Middle: Quick Links --- */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
          <ul className="space-y-2 text-gray-300">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/terms-conditions"
                className="hover:text-white transition"
              >
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-white transition"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Right: Contact Info --- */}
        <div>
          <div className="flex flex-col gap-3 mb-4 text-gray-300">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400" />
              <Link
                href="mailto:support@BeforeListed.com"
                className="hover:text-white transition"
              >
                Support@BeforeListed.com
              </Link>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-3">
            <Link
              href="https://www.tiktok.com/@beforelisted"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/tiktok-white-icon.svg"
                alt="TikTok"
                width={30}
                height={30}
              />
            </Link>
            <Link
              href="https://www.instagram.com/beforelisted/"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                width={30}
                height={30}
              />
            </Link>
            <Link
              href="#"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/facebook.png"
                alt="TikTok"
                width={30}
                height={30}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* --- Bottom Copyright --- */}
      <div className="mt-5 pt-3 text-center text-gray-100 text-sm">
        <span>
          This website is not the official website of The Corcoran Group or its
          affiliated companies, and neither
        </span>
        <br />{" "}
        <span>
          {" "}
          The Corcoran Group nor its affiliated companies in any way warrant the
          accuracy of any information contained herein.{" "}
        </span>
        <br />{" "}
        <span>
          Operated by Tuval Mor, Licensed Real Estate Salesperson with The
          Corcoran Group.{" "}
        </span>
        <br />{" "}
        <span>
          157 Columbus Avenue, Suite 2W, New York, NY 10023 | Office:
          212-957-4100 x2001 <br />
          tmor@corcoran.com |{" "}
          <a
            className="text-cyan-500 hover:underline"
            href="https://www.corcoran.com"
            target="blank"
          >
            www.corcoran.com
          </a>
        </span>
        <br /> <br />{" "}
        <span>
          <a
            className="text-cyan-500 hover:underline"
            href="https://beforelisted.com/legal/nys-housing-and-anti-discrimination-notice_02.2025.pdf"
            target="blank"
          >
            Fair Housing Notice
          </a>{" "}
          |{" "}
          <a
            className="text-cyan-500 hover:underline"
            href="https://beforelisted.com/legal/Standardized-Operating-Procedure.pdf"
            target="blank"
          >
            Standardized Operating Procedures
          </a>{" "}
          |{" "}
          <a
            className="text-cyan-500 hover:underline"
            href="https://beforelisted.com/legal/Reasonable-Accomodations.pdf"
            target="blank"
          >
            Reasonable Accommodations
          </a>
        </span>
      </div>

      <div className="mt-5 pt-3 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Happy Click Shop, LLC. All rights reserved.
        <br />
        <span className="font-medium text-white">BeforeListed™ (TM)</span>
      </div>
    </footer>
  );
}
