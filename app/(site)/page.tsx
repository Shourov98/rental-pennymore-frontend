import HeroSection from "@/components/HeroSection";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-100 text-gray-900">
      <HeroSection />

      {/* --- How It Works Section --- */}
      <section className="py-16 px-6 md:m-3 lg:m-6 rounded-2xl md:px-16 lg:px-24 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-10">LOGO</h2>

        <p className="w-full max-w-2xl mx-auto text-base font-semibold text-center mb-10">
          BeforeListed agents get early access to no listed yet rentals through
          their network of trusted owners and supers. Find apartments below
          market value and rent-stabilized before they’re listed.
        </p>

        {/* Steps with arrows */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 relative">
          <Step
            icon="/icons/steps/submit.svg"
            title="Step 1"
            subtitle="Submit Preferences"
            description="Submit your pre-market search preferences to start seeing apartments before they're listed."
          />

          {/* Arrow between step 1 and 2 */}
          <div className="hidden sm:block mx-2 lg:mx-4 shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Mobile arrow - downward */}
          <div className="sm:hidden my-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M12 5V19M12 19L5 12M12 19L19 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <Step
            icon="/icons/steps/connect.svg"
            title="Step 2"
            subtitle="Get Matched"
            description="Your request will be sent to our agents, who will reach out once a pre-market match is found."
          />

          {/* Arrow between step 2 and 3 */}
          <div className="hidden sm:block mx-2 lg:mx-4 flex-shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Mobile arrow - downward */}
          <div className="sm:hidden my-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M12 5V19M12 19L5 12M12 19L19 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <Step
            icon="/icons/steps/decide.svg"
            title="Step 3"
            subtitle="View & Decide"
            description="Register with the agent, view the apartment, apply if you choose, and only pay at lease signing."
          />
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-6">Get In Touch</h2>
        <p className="max-w-2xl mx-auto text-gray-600 mb-10">
          Whether you’re a renter or an agent, we’d love to hear from you.
        </p>

        <form className="max-w-lg mx-auto flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            className="px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            rows={4}
            placeholder="Message"
            className="px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
}

function Step({
  icon,
  title,
  subtitle,
  description,
}: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-2 sm:px-4 flex-1">
      <Image
        src={icon}
        alt={title}
        width={80}
        height={80}
        className="mb-4 w-14 sm:w-16 h-auto"
      />
      <h3 className="font-semibold text-lg lg:text-2xl text-text-primary mb-1">
        {title}
      </h3>
      <p className="font-semibold text-base text-text-primary mb-2">
        {subtitle}
      </p>
      <p className="text-gray-600 text-sm sm:text-base">{description}</p>
    </div>
  );
}
