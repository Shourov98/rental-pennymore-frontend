export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
        <p className="mt-3 text-sm text-gray-500">
          Last updated: December 31, 2025
        </p>
      </header>

      <section className="space-y-10 text-gray-700 leading-relaxed">
        <Section title="1. About BeforeListed™">
          <p>
            BeforeListed™ is a real estate marketing and intake website operated
            by Tuval Mor, a licensed real estate agent affiliated with Corcoran,
            to collect renter inquiries and support proactive rental outreach
            beyond publicly advertised listing platforms.
          </p>
          <p className="mt-3">
            BeforeListed™ does not own, manage, or operate any real property.
          </p>
        </Section>

        <Section title="2. Role of the Website">
          <ul className="list-disc pl-5 space-y-2">
            <li>Collect renter inquiries</li>
            <li>
              Facilitate initial contact between renters and a licensed real
              estate agent
            </li>
          </ul>
          <p className="mt-3">
            The website does not create an agency relationship. Agency
            representation is established only upon execution of required
            disclosures and fee agreements.
          </p>
        </Section>

        <Section title="3. Brokerage Services">
          <p>
            All brokerage services — including representation, disclosures,
            negotiations, and fees — are provided solely by the licensed real
            estate agent and their sponsoring brokerage.
          </p>
        </Section>

        <Section title="4. Referrals and Collaboration">
          <p>
            If appropriate, another licensed real estate agent may be
            introduced. Any such involvement will be disclosed in accordance
            with applicable law.
          </p>
        </Section>

        <Section title="5. No Guarantees">
          <p>
            Submitting a request does not guarantee contact, availability,
            access to properties, or approval by owners or management companies.
          </p>
        </Section>

        <Section title="6. Fees">
          <p>
            BeforeListed™ does not charge renters. Any broker fee is determined
            solely by the licensed agent or brokerage and payable only if a
            lease is executed.
          </p>
        </Section>

        <Section title="7. User Responsibilities">
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide accurate information</li>
            <li>Comply with fair housing laws</li>
            <li>Use the website for legitimate rental inquiries only</li>
          </ul>
        </Section>

        <Section title="8. Fair Housing Compliance">
          <p>
            All services comply with the Federal Fair Housing Act, New York
            State Human Rights Law, and NYC Human Rights Law.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, BeforeListed™ is not liable
            for indirect or consequential damages.
          </p>
        </Section>

        <Section title="10. Indemnification">
          <p>
            Users agree to indemnify and hold BeforeListed™ harmless from claims
            arising from misuse of the website or violations of these Terms.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>These Terms are governed by the laws of the State of New York.</p>
        </Section>

        <Section title="12. Modifications">
          <p>
            Continued use of the website constitutes acceptance of updated
            Terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>Email: support@beforelisted.com</p>
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
