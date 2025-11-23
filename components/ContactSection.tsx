"use client";

import Image from "next/image";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section className="md:mx-3 md:my-3 lg:mx-6 lg:my-6">
      <div className="w-full bg-gray-50 rounded-2xl">
        <div className="w-full mx-auto bg-white shadow-sm rounded-2xl p-6 sm:p-10 md:p-12">
          {/* Section Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Contact
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

          {/* Layout */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            {/* Left Side — Brand Info */}
            <div className="w-full md:w-1/3 text-center flex flex-col items-center gap-3 justify-center md:text-left">
              {/* Logo */}
              <Link href="/">
                <Image src="/Logo_1.svg" alt="Logo" width={250} height={200} />
              </Link>
              <p className="text-gray-700 text-sm sm:text-base text-center leading-relaxed">
                Rent your next apartment before it is listed. <br />
                <span className="font-medium text-gray-900">
                  See it first – Rent it first.
                </span>
              </p>
            </div>

            {/* Right Side — Form */}
            <form className="w-full md:w-2/3 flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <textarea
                placeholder="Message"
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              ></textarea>

              <button
                type="submit"
                className="mt-2 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition w-fit self-center md:self-start"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
