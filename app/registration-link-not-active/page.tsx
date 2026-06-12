import Link from "next/link";

export default function RegistrationLinkNotActivePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      {" "}
      {/* Container for the content, centered and with a max width */}
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Registration Link Not Active
        </h1>
        <p className="mt-6 text-sm leading-6 text-gray-700">
          This registration link is not currently active on BeforeListed™.
          <br />
          You may contact the agent directly.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
