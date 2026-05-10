import type { Metadata } from "next"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { EMAIL_HREF } from "@/lib/contact"

export const metadata: Metadata = {
  title: "Privacy | RelayDesk",
  description: "How RelayDesk handles your customer data and call information.",
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="bg-white pt-28 pb-28">
        <div className="max-w-[720px] mx-auto px-6 policy-body">

          <h1 className="text-[34px] font-bold text-slate-900 tracking-[-0.025em] mb-2">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-slate-500 mb-10">
            Effective date: 6 May 2026
          </p>

          <p className="text-[16px] text-slate-700 leading-[1.75]">
            RelayDesk respects your privacy and takes the protection of personal information seriously. We collect information to operate our phone agent service, support our customers, process payments securely, improve our systems, and communicate with users. If you are a RelayDesk customer, we collect information needed to manage your account and configure your phone agent. If you are calling a business that uses RelayDesk, we may record and transcribe your call so the agent can respond and the business owner can receive a summary of the interaction. We only collect information that is reasonably necessary for our services and handle it in line with the Australian Privacy Act 1988 and the Australian Privacy Principles (APPs).
          </p>

          <Section title="Who we are">
            <p>RelayDesk is operated by:</p>
            <ul>
              <li><strong>Entity name:</strong> Jon Lee Taylor</li>
              <li><strong>ABN:</strong> 50 154 134 393</li>
              <li><strong>Website:</strong> relaydesk.com.au</li>
              <li><strong>Email:</strong> <a href={EMAIL_HREF}>hello@relaydesk.com.au</a></li>
              <li><strong>Registered address:</strong> 10 Cutts Street, Barden Ridge, NSW 2234</li>
              <li><strong>Country:</strong> Australia</li>
            </ul>
            <p>This Privacy Policy explains how we collect, use, disclose and store personal information.</p>
          </Section>

          <Section title="Who this policy applies to">
            <p>This policy applies to three groups:</p>
            <ol>
              <li><strong>RelayDesk customers</strong> - Small business owners and organisations who sign up to use RelayDesk services.</li>
              <li><strong>End callers</strong> - Members of the public who call a phone number managed by RelayDesk on behalf of one of our customers.</li>
              <li><strong>Website visitors</strong> - People visiting relaydesk.com.au or submitting forms through our website.</li>
            </ol>
          </Section>

          <Section title="Personal information we collect">
            <SubSection title="Information collected from RelayDesk customers">
              <p>When you sign up or use RelayDesk, we may collect:</p>
              <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Business name</li>
                <li>Business address</li>
                <li>ABN, if provided</li>
                <li>Account login and activity information</li>
                <li>Phone agent configuration details, including business hours, services offered, FAQs, call transfer preferences, and order workflows</li>
                <li>Customer support communications</li>
                <li>Billing and subscription information</li>
              </ul>
              <p>We do not store full payment card details. Payments are handled by our payment processor.</p>
            </SubSection>

            <SubSection title="Information collected from end callers">
              <p>When someone calls a RelayDesk-managed phone number, we may collect:</p>
              <ul>
                <li>Voice recordings of calls</li>
                <li>Real-time call transcripts</li>
                <li>Caller phone number (CLI)</li>
                <li>Information voluntarily provided during the call, including name, address, booking details, order details, delivery information, and messages for the business owner</li>
                <li>Payment-related metadata if a payment link is used, including transaction ID, amount paid, and payment status</li>
              </ul>
              <p>Payment card details are processed directly by the payment processor and do not pass through RelayDesk systems.</p>
            </SubSection>

            <SubSection title="Information collected from website visitors">
              <p>When visiting relaydesk.com.au, we may collect:</p>
              <ul>
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device type</li>
                <li>Approximate location</li>
                <li>Website usage information</li>
                <li>Referral source</li>
                <li>Cookies and similar technologies</li>
                <li>Information submitted through forms, including name, email address, and phone number</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="How we collect information">
            <p>We collect information when:</p>
            <ul>
              <li>A customer signs up for RelayDesk</li>
              <li>Someone calls a RelayDesk-managed phone number</li>
              <li>A user submits a form on our website</li>
              <li>A payment is made through a payment link</li>
              <li>Someone contacts our support team</li>
              <li>A user interacts with our website or cookies</li>
            </ul>
          </Section>

          <Section title="How we use personal information">
            <p>We use personal information to:</p>
            <ul>
              <li>Operate AI phone agents</li>
              <li>Answer and route inbound calls</li>
              <li>Generate call summaries and transcripts</li>
              <li>Process orders and service requests</li>
              <li>Send payment links</li>
              <li>Process subscriptions and billing</li>
              <li>Provide customer support</li>
              <li>Improve service quality and AI performance</li>
              <li>Monitor system reliability and security</li>
              <li>Prevent fraud or misuse</li>
              <li>Meet legal and regulatory obligations</li>
              <li>Communicate service updates and important notices</li>
            </ul>
            <p>We do not sell personal information to third parties.</p>
          </Section>

          <Section title="Call recordings and AI processing">
            <p>
              RelayDesk uses AI systems to process calls in real time. This allows the phone agent to understand requests, respond naturally, generate summaries, and route enquiries appropriately.
            </p>
            <p>
              Calls may be recorded and transcribed for service delivery, quality assurance, customer support, and training and improvement of our systems.
            </p>
            <p>
              Our customers are responsible for ensuring they comply with any notification obligations that apply to their own callers under Australian law.
            </p>
          </Section>

          <Section title="Cookies and website analytics">
            <p>
              We use cookies and similar technologies to keep the website functioning correctly, understand website usage, improve website performance, and measure marketing effectiveness.
            </p>
            <p>
              You can manage cookie preferences through your browser settings and through our cookie banner. For more information, see the Cookie Policy section below.
            </p>
          </Section>

          <Section title="How we share information">
            <p>We share information only where reasonably necessary to provide our services.</p>

            <SubSection title="Service providers and processors">
              <Provider name="Twilio">
                <li><strong>Purpose:</strong> Telephony and call routing</li>
                <li><strong>Data processed:</strong> Caller phone numbers, call metadata, audio streams</li>
                <li><strong>Location:</strong> United States</li>
              </Provider>
              <Provider name="ElevenLabs">
                <li><strong>Purpose:</strong> Voice synthesis and speech-to-text</li>
                <li><strong>Data processed:</strong> Call audio, voice interactions, transcripts</li>
                <li><strong>Location:</strong> United States</li>
              </Provider>
              <Provider name="Anthropic">
                <li><strong>Purpose:</strong> AI processing through the Claude API</li>
                <li><strong>Data processed:</strong> Call transcripts, customer configuration data, AI prompts and responses</li>
                <li><strong>Location:</strong> United States</li>
              </Provider>
              <Provider name="Stripe">
                <li><strong>Purpose:</strong> Payment processing and SMS payment links</li>
                <li><strong>Data processed:</strong> Payment metadata, transaction status, billing information</li>
                <li><strong>Location:</strong> United States</li>
              </Provider>
              <p className="text-[15px] text-slate-600 leading-[1.7] mt-3 mb-4">
                Payment card details are processed directly by Stripe and are not stored by RelayDesk.
              </p>
              <Provider name="Vercel">
                <li><strong>Purpose:</strong> Website hosting and infrastructure</li>
                <li><strong>Data processed:</strong> Website analytics, technical logs, website traffic information</li>
                <li><strong>Location:</strong> United States</li>
              </Provider>
              <Provider name="Zoho or Google Workspace">
                <li><strong>Purpose:</strong> Business email and communication systems</li>
                <li><strong>Data processed:</strong> Emails, support enquiries, customer communications</li>
                <li><strong>Location:</strong> Varies depending on provider configuration</li>
              </Provider>
            </SubSection>

            <p>
              We may also disclose information where required by law, to protect our legal rights, during a business sale, merger or restructure, or to prevent fraud, abuse or security threats.
            </p>
          </Section>

          <Section title="Cross-border disclosure of personal information">
            <p>
              Some of our service providers are located outside Australia, including in the United States.
            </p>
            <p>
              As a result, personal information may be transferred, processed or stored overseas. While we take reasonable steps to work with reputable providers that maintain appropriate security standards, overseas recipients may be subject to foreign laws.
            </p>
            <p>
              By using our services, you acknowledge that your information may be disclosed to overseas providers in accordance with this policy and APP 8.
            </p>
          </Section>

          <Section title="How we protect personal information">
            <p>
              We use reasonable technical and organisational safeguards to protect personal information, including:
            </p>
            <ul>
              <li>Encryption in transit</li>
              <li>Encryption at rest where supported</li>
              <li>Access controls and authentication</li>
              <li>Secure cloud infrastructure</li>
              <li>Logging and monitoring</li>
              <li>Role-based access restrictions</li>
              <li>Secure payment authentication measures, including 3D Secure where supported by the payment provider</li>
            </ul>
            <p>
              No online system can guarantee absolute security. However, we take reasonable steps to reduce security risks and protect the information we hold.
            </p>
          </Section>

          <Section title="Data retention">
            <p>We retain information only for as long as reasonably necessary.</p>
            <p>Typical retention periods include:</p>
            <ul>
              <li>Call recordings: 90 days</li>
              <li>Call transcripts: 12 months</li>
              <li>Customer account information: For the life of the account and up to 7 years afterwards where required for tax, accounting or legal purposes</li>
              <li>Website analytics data: Varies depending on the analytics provider</li>
              <li>Support communications: As reasonably required for support and operational purposes</li>
            </ul>
            <p>We may retain information longer where required by law or to resolve disputes.</p>
          </Section>

          <Section title="Access and correction rights">
            <p>
              Under the Australian Privacy Act, you may request access to personal information we hold about you.
            </p>
            <p>
              You may also request corrections if you believe information is inaccurate, incomplete or out of date.
            </p>
            <p>To make a request, contact:</p>
            <p>
              <a href={EMAIL_HREF} className="font-semibold">hello@relaydesk.com.au</a>
            </p>
            <p>We may need to verify your identity before processing requests.</p>
          </Section>

          <Section title="Complaints">
            <p>
              If you believe we have breached your privacy rights, please contact us first so we can investigate and attempt to resolve the issue.
            </p>
            <p>
              Email: <a href={EMAIL_HREF} className="font-semibold">hello@relaydesk.com.au</a>
            </p>
            <p>
              Please include your contact details, a description of the issue, and any relevant supporting information. We will aim to respond within a reasonable timeframe.
            </p>
            <p>
              If you are not satisfied with our response, you may contact the Office of the Australian Information Commissioner (OAIC):
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.oaic.gov.au"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.oaic.gov.au
              </a>
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>RelayDesk services are not intended for individuals under 18 years of age.</p>
            <p>We do not knowingly collect personal information from children.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes to our services, technology, legal obligations or business practices.
            </p>
            <p>When updates are made, the updated version will be published on our website, the effective date will be revised, and significant changes may be communicated directly to customers by email or platform notification.</p>
          </Section>

          <Section title="Contact us">
            <p>If you have questions about this Privacy Policy or our privacy practices, contact us at:</p>
            <p>
              <a href={EMAIL_HREF} className="font-semibold">hello@relaydesk.com.au</a>
            </p>
          </Section>

          {/* Cookie Policy */}
          <div className="mt-16 pt-12 border-t-2 border-slate-200">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">
              Appended policy
            </p>
            <h2 className="text-[28px] font-bold text-slate-900 tracking-[-0.02em] mb-1">
              Cookie Policy
            </h2>
          </div>

          <Section title="What are cookies?">
            <p>
              Cookies are small text files stored on your device when you visit a website. They help websites function properly, remember preferences and understand how users interact with the site.
            </p>
            <p>We may also use similar technologies such as pixels, tags and local storage.</p>
          </Section>

          <Section title="How RelayDesk uses cookies">
            <p>
              We use cookies to keep the website functioning correctly, remember user preferences, analyse website traffic and performance, improve user experience, measure marketing effectiveness, and protect website security.
            </p>
          </Section>

          <Section title="Types of cookies we use">
            <SubSection title="Strictly necessary cookies">
              <p>
                These cookies are essential for the operation of the website and cannot be switched off through our cookie settings.
              </p>
              <p>
                They may include cookies used for security, session management, form handling, and consent preferences.
              </p>
            </SubSection>

            <SubSection title="Analytics cookies">
              <p>
                Analytics cookies help us understand which pages are visited most often, how users navigate the site, what devices and browsers are used, and where website traffic comes from.
              </p>
              <p>This information helps us improve website performance and usability.</p>
            </SubSection>

            <SubSection title="Marketing cookies">
              <p>
                Marketing cookies may be used to measure advertising campaigns, track conversions, deliver more relevant advertising, and limit repeated advertisements.
              </p>
              <p>These cookies may involve third-party providers.</p>
            </SubSection>
          </Section>

          <Section title="Third-party cookies">
            <p>
              Some cookies may be placed by third-party services we use, including website analytics providers, advertising platforms, and embedded services.
            </p>
            <p>These providers may process data outside Australia.</p>
          </Section>

          <Section title="Managing cookie preferences">
            <p>
              You can manage cookie preferences by using the cookie banner settings, changing your browser settings, or clearing cookies from your device.
            </p>
            <p>
              Most browsers allow you to block cookies, delete stored cookies, and receive alerts before cookies are stored.
            </p>
            <p>Please note that disabling certain cookies may affect website functionality.</p>
          </Section>

          <Section title="Updates to this cookie policy">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation or our services.
            </p>
            <p>Updated versions will be published on relaydesk.com.au.</p>
          </Section>

          <Section title="Contact us">
            <p>If you have questions about our use of cookies or privacy practices, contact:</p>
            <p>
              <a href={EMAIL_HREF} className="font-semibold">hello@relaydesk.com.au</a>
            </p>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-[22px] font-bold text-slate-900 tracking-[-0.015em] mb-4 pb-3 border-b border-slate-100">
        {title}
      </h2>
      <div className="space-y-4 text-[16px] text-slate-700 leading-[1.75]">
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-7">
      <h3 className="text-[17px] font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-3 text-[16px] text-slate-700 leading-[1.75]">
        {children}
      </div>
    </div>
  )
}

function Provider({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h4 className="text-[15px] font-semibold text-slate-900 mb-1.5">{name}</h4>
      <ul className="list-disc ml-5 space-y-1 text-[15px] text-slate-600 leading-[1.7]">
        {children}
      </ul>
    </div>
  )
}
