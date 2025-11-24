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
              <Link href="/terms" className="hover:text-white transition">
                Terms &amp; Conditions
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
            <Link href="#" className="hover:opacity-80 transition">
              <Image
                src="/icons/facebook.svg"
                alt="Facebook"
                width={20}
                height={20}
              />
            </Link>
            <Link
              href="https://www.instagram.com/beforelisted/"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                width={20}
                height={20}
              />
            </Link>
            <Link href="#" className="hover:opacity-80 transition">
              <Image
                src="/icons/youtube.svg"
                alt="YouTube"
                width={20}
                height={20}
              />
            </Link>
            <Link
              href="https://www.tiktok.com/@beforelisted"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/icons/tiktok.svg"
                alt="TikTok"
                width={20}
                height={20}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* --- Bottom Copyright --- */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()}{" "}
        <span className="font-medium text-white">MOR NY HOMES INC.</span> All
        rights reserved.
      </div>
    </footer>
  );
}
