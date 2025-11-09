import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A1A1A] text-white py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* --- Left: Logo & Text --- */}
        <div>
          <p className="text-gray-300 mb-6 max-w-xs leading-relaxed">
            Find your next apartment before it hits the market, no middlemen, no
            hassle.
          </p>
          <h2 className="text-2xl font-bold">Logo</h2>
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
              <Phone size={18} className="text-gray-400" />
              <span>689296744</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400" />
              <span>admin@rentersedge.com</span>
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
            <Link href="#" className="hover:opacity-80 transition">
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
            <Link href="#" className="hover:opacity-80 transition">
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
        © {new Date().getFullYear()} All rights reserved to{" "}
        <span className="font-medium text-white">RentersEdge</span>
      </div>
    </footer>
  );
}
