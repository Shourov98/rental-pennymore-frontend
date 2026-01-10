export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-500">
          Last Updated: January 9, 2026
        </p>
      </header>

      <section className="space-y-10 text-gray-700 leading-relaxed">
        <Section title="1. Introduction">
          <p>
            BeforeListed™ (“BeforeListed,” “we,” “us,” or “our”) is a real
            estate marketing and intake website operated by Tuval Mor, a
            licensed real estate agent affiliated with Corcoran, to collect
            renter inquiries and support proactive rental outreach beyond
            publicly advertised listing platforms.
          </p>
          <p className="mt-3">
            This Privacy Policy explains how we collect, use, disclose, and
            protect personal information when you use the BeforeListed™ website.
          </p>
          <p className="mt-3">
            By using the website, you consent to the practices described in this
            Privacy Policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="font-medium mt-4">2.1 Information You Provide</h3>
          <p className="mt-2">
            When you submit an inquiry or register a profile through the
            website, we may collect:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>
              Rental preferences (budget, neighborhoods, move-in timing,
              features, etc.)
            </li>
          </ul>

          <p className="mt-4">We do not collect:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>government-issued identification</li>
            <li>Social Security numbers</li>
            <li>financial account information</li>
            <li>income documentation</li>
          </ul>

          <h3 className="font-medium mt-6">
            2.2 Information Collected Automatically
          </h3>
          <p className="mt-2">
            We may automatically collect limited technical information,
            including:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>IP address (city-level only)</li>
            <li>Browser type</li>
            <li>Device type</li>
            <li>Pages viewed</li>
            <li>Date and time of access</li>
          </ul>
          <p className="mt-3">We do not collect precise GPS location data.</p>

          <h3 className="font-medium mt-6">2.3 Cookies and Analytics</h3>
          <p className="mt-2">
            BeforeListed™ may use cookies and standard analytics tools (such as
            Google Analytics) to understand website usage and improve
            performance.
          </p>
          <p className="mt-3">
            You may disable cookies in your browser settings, though some
            functionality may be limited.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Allow the representing agent to respond to inquiries</li>
            <li>
              Allow the representing agent to communicate regarding rental
              searches
            </li>
            <li>
              Allow the representing agent to contact property owners or
              managers at your request
            </li>
            <li>
              Allow the representing agent to contact other licensed real estate
              agents to assist with your search, with any such involvement
              subject to required disclosures
            </li>
            <li>Improve website functionality</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>
          <p className="mt-3">
            We may use your contact information to send transactional or
            service-related emails related to your use of the website.
          </p>
        </Section>

        <Section title="4. How Information Is Shared">
          <h3 className="font-medium mt-4">
            4.1 Licensed Real Estate Professionals
          </h3>
          <p className="mt-2">
            Information related to your rental search (such as budget range,
            location preferences, and timing) may be shared with licensed real
            estate professionals on a non-identifying basis for the purpose of
            evaluating whether another agent may be able to assist with your
            search.
          </p>
          <p className="mt-3">
            If another agent is introduced to actively assist with your search
            or to contact you, any such involvement will be disclosed to you and
            required agency disclosures will be provided.
          </p>
          <p className="mt-3">
            Personally identifiable information (such as name, email address, or
            phone number) is not shared unless required for representation and
            disclosed accordingly.
          </p>
          <p className="mt-3">We do not publicly post renter information.</p>

          <h3 className="font-medium mt-6">4.2 Service Providers</h3>
          <p className="mt-2">
            We may share information with trusted service providers who assist
            with:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>website hosting</li>
            <li>email delivery</li>
            <li>analytics and security</li>
          </ul>
          <p className="mt-3">
            These providers may use information only to perform services on our
            behalf.
          </p>

          <h3 className="font-medium mt-6">4.3 Legal Requirements</h3>
          <p className="mt-2">
            We may disclose information if required to comply with applicable
            law, court orders, or lawful governmental requests.
          </p>

          <h3 className="font-medium mt-6">
            4.4 No Sale of Personal Information
          </h3>
          <p className="mt-2 font-medium">
            BeforeListed™ does not sell personal information.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain personal information only as long as reasonably necessary
            to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>respond to inquiries</li>
            <li>provide requested services</li>
            <li>maintain records</li>
            <li>comply with legal obligations</li>
          </ul>
          <p className="mt-3">
            Information is deleted or anonymized when no longer needed; deletion
            timelines may vary depending on legal and record-keeping
            requirements.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>access your personal information</li>
            <li>request correction</li>
            <li>request deletion</li>
            <li>opt out of non-essential communications</li>
          </ul>
          <p className="mt-3">Requests may be submitted to:</p>
          <a
            href="mailto:privacy@beforelisted.com"
            className="inline-block mt-2 text-blue-600 underline hover:text-blue-800"
          >
            privacy@beforelisted.com
          </a>
          <p className="mt-3">
            BeforeListed™ operates in compliance with applicable fair housing
            and anti-discrimination laws.
          </p>
        </Section>

        <Section title="7. Data Security">
          <p>
            We implement reasonable administrative and technical safeguards to
            protect personal information, including access controls and secure
            authentication measures.
          </p>
          <p className="mt-3">
            However, no online system is completely secure, and use of the
            website is at your own risk.
          </p>
        </Section>

        <Section title="8. Children’s Privacy">
          <p>
            BeforeListed™ is not intended for individuals under 18 years of age.
          </p>
          <p className="mt-3">
            We do not knowingly collect personal information from minors.
          </p>
        </Section>

        <Section title="9. Third-Party Links">
          <p>The website may contain links to third-party websites.</p>
          <p className="mt-3">
            We are not responsible for the privacy practices of those sites.
          </p>
        </Section>

        <Section title="10. Changes to This Privacy Policy">
          <p>We may update this Privacy Policy from time to time.</p>
          <p className="mt-3">
            Updates will be reflected by a revised “Last Updated” date.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            This Privacy Policy is governed by the laws of the State of New
            York.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>For privacy-related questions:</p>

          <a
            href="mailto:privacy@beforelisted.com"
            className="inline-block mt-2 text-blue-600 underline hover:text-blue-800"
          >
            privacy@beforelisted.com
          </a>

          <br />

          <a
            href="mailto:support@beforelisted.com"
            className="inline-block mt-2 text-blue-600 underline hover:text-blue-800"
          >
            support@beforelisted.com
          </a>
        </Section>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}
