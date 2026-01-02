export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-500">
          Last updated: December 31, 2025
        </p>
      </header>

      <section className="space-y-10 text-gray-700 leading-relaxed">
        <Section title="1. Introduction">
          <p>
            BeforeListed™ is a real estate marketing and intake website operated
            by Tuval Mor, a licensed real estate agent affiliated with Corcoran.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="font-medium mt-4">Information You Provide</h3>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Rental preferences</li>
          </ul>

          <h3 className="font-medium mt-4">Automatically Collected</h3>
          <p>
            IP address (city-level only), browser type, device type, pages
            viewed, and timestamps.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-2">
            <li>Respond to rental inquiries</li>
            <li>Communicate about rental searches</li>
            <li>Improve website functionality</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Information Sharing">
          <p>
            Information may be shared with licensed real estate professionals,
            service providers, or legal authorities when required.
          </p>
          <p className="mt-2 font-medium">
            BeforeListed™ does not sell personal information.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            Information is retained only as long as necessary and deleted or
            anonymized when no longer needed.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>
            You may request access, correction, deletion, or opt-out by
            contacting:
          </p>
          <p className="mt-2">privacy@beforelisted.com</p>
        </Section>

        <Section title="7. Data Security">
          <p>
            Reasonable administrative and technical safeguards are used, but no
            system is completely secure.
          </p>
        </Section>

        <Section title="8. Children’s Privacy">
          <p>
            The website is not intended for individuals under 18 years of age.
          </p>
        </Section>

        <Section title="9. Third-Party Links">
          <p>
            We are not responsible for the privacy practices of third-party
            websites.
          </p>
        </Section>

        <Section title="10. Changes">
          <p>Updates will be reflected by a revised “Last Updated” date.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>This policy is governed by the laws of the State of New York.</p>
        </Section>

        <Section title="12. Contact">
          <p>privacy@beforelisted.com</p>
          <p>support@beforelisted.com</p>
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
