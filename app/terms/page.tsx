import type { Metadata } from "next"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { EMAIL_HREF } from "@/lib/contact"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of RelayDesk phone agent services, including subscription, cancellation, acceptable use, and liability.",
  alternates: {
    canonical: "https://www.relaydesk.com.au/terms",
  },
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="bg-white pt-28 pb-28">
        <div className="max-w-[720px] mx-auto px-6 policy-body">

          <h1 className="text-[34px] font-bold text-slate-900 tracking-[-0.025em] mb-2">
            Terms of Service
          </h1>
          <p className="text-[14px] text-slate-500 mb-10">
            Effective date: 21 May 2026
          </p>

          <p className="text-[16px] text-slate-700 leading-[1.75]">
            These Terms of Service govern your use of RelayDesk services. By signing up or using RelayDesk, you agree to these terms. If you do not agree, do not use the service. RelayDesk is operated by Jon Lee Taylor (ABN 50 154 134 393), based in New South Wales, Australia.
          </p>

          <Section title="What RelayDesk provides">
            <p>
              RelayDesk provides an AI-powered phone answering service. When activated, RelayDesk answers inbound calls on your behalf, handles enquiries according to your configured settings, captures order and contact details, and sends you a summary of each call.
            </p>
            <p>
              Your subscription includes access to the RelayDesk platform, a managed phone agent, call logging, a customer dashboard, and email summaries for each call handled.
            </p>
            <p>
              RelayDesk does not provide a human receptionist, a guaranteed sales outcome, a legal or compliance advisory service, or any service not described in your plan. The service is designed to handle routine inbound calls, not complex, sensitive, or emergency situations.
            </p>
          </Section>

          <Section title="Free trials and pilot access">
            <p>
              We may offer free trial or pilot access to RelayDesk at our discretion. Free trial access is provided for evaluation purposes only and may be limited in duration, call volume, or features.
            </p>
            <p>
              All other terms in this agreement apply during a free trial or pilot period, including acceptable use, limitations of liability, and your responsibilities. We reserve the right to end a free trial or pilot at any time.
            </p>
            <p>
              Unless otherwise agreed in writing, free trial or pilot access does not convert automatically to a paid subscription.
            </p>
          </Section>

          <Section title="Subscription and billing">
            <p>
              RelayDesk subscriptions are billed monthly in advance. Your billing cycle begins on the date you first subscribe and renews automatically each month on the same date.
            </p>
            <p>
              Each plan includes a set number of calls per month. Calls beyond that limit are charged at $1 per call, billed at the end of each billing period. Call counts reset at the start of each billing cycle.
            </p>
            <p>
              Where your plan includes payment link functionality, a transaction fee of 1.2% + $0.30 AUD applies to each payment processed through a RelayDesk-generated payment link. This fee is charged at the time of transaction and is separate from your subscription fee.
            </p>
            <p>
              Prices are in Australian dollars and inclusive of GST where applicable. We may change pricing with 30 days notice by email.
            </p>
          </Section>

          <Section title="Cancellation">
            <p>
              You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. You will retain access to the service until that date.
            </p>
            <p>
              We do not offer refunds for unused portions of a billing period, except where required by Australian Consumer Law.
            </p>
            <SubSection title="What happens to your data on cancellation">
              <p>
                Following cancellation, your account will be deactivated. You may request an export of your call history and summaries at any time before or within 30 days of cancellation by contacting us at <a href={EMAIL_HREF} className="font-semibold">hello@relaydesk.com.au</a>.
              </p>
              <p>
                Data is retained and deleted in accordance with the retention schedule in our <a href="/privacy" className="font-semibold">Privacy Policy</a> — for example, call recordings are retained for 90 days and transcripts for 12 months from the date of each call. Account information may be retained longer where required for legal or accounting purposes.
              </p>
            </SubSection>
          </Section>

          <Section title="Acceptable use">
            <p>You agree to use RelayDesk only for lawful purposes and in accordance with these terms. You must not use RelayDesk to:</p>
            <ul>
              <li>Handle calls in a way that misleads callers about the nature of the service they are receiving, beyond the intended product experience</li>
              <li>Capture, store or process personal information in breach of applicable privacy laws</li>
              <li>Conduct unlawful telemarketing or automated dialling campaigns</li>
              <li>Violate any applicable law or regulation in Australia or the jurisdiction of your callers</li>
              <li>Attempt to reverse-engineer, copy or misuse the RelayDesk platform or its underlying systems</li>
              <li>Resell or sublicense access to RelayDesk without our written consent</li>
            </ul>
            <p>
              You are responsible for ensuring your use of RelayDesk complies with all laws applicable to your business, including any obligations to inform callers that their call may be recorded or handled by an AI system.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that breach these terms without notice.
            </p>
          </Section>

          <Section title="Service availability">
            <p>
              We aim to keep RelayDesk available at all times, but we do not guarantee uninterrupted or error-free operation. The service depends on third-party infrastructure including telephony providers, AI processing services, and cloud hosting. Outages or degraded performance may occur due to factors outside our control.
            </p>
            <p>
              We will make reasonable efforts to restore service in the event of an outage and to communicate planned maintenance in advance where practicable.
            </p>
            <p>
              No service level agreement (SLA) is provided under these terms unless separately agreed in writing.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the maximum extent permitted by law, RelayDesk is not liable for:
            </p>
            <ul>
              <li>Missed calls, unanswered calls or calls handled incorrectly due to service outages, AI errors, misconfiguration, or telephony failures</li>
              <li>Lost orders, lost revenue, or lost customers resulting from any failure or limitation of the service</li>
              <li>Any indirect, consequential, incidental, special or punitive loss or damage arising from your use of, or inability to use, RelayDesk</li>
              <li>Actions taken or not taken by callers following an interaction with the RelayDesk phone agent</li>
              <li>Errors in call summaries, transcripts or captured data</li>
            </ul>
            <p>
              Where liability cannot be excluded under Australian Consumer Law, our liability is limited to, at our option, resupplying the relevant service or refunding the fees paid for the affected billing period.
            </p>
            <p>
              RelayDesk is a best-efforts answering service. It is not a substitute for your own business operations, customer relationship management, or emergency response procedures.
            </p>
          </Section>

          <Section title="Your responsibilities">
            <p>You are responsible for:</p>
            <ul>
              <li>Providing accurate configuration information so the phone agent can respond correctly to your callers</li>
              <li>Keeping your account credentials secure</li>
              <li>Reviewing call summaries and following up on any outstanding actions in a timely manner</li>
              <li>Ensuring callers are appropriately notified that their call may be recorded or handled by an AI system, where required by law</li>
              <li>Notifying us promptly of any errors in agent behaviour that could affect your customers</li>
            </ul>
          </Section>

          <Section title="Intellectual property">
            <p>
              RelayDesk and its underlying technology, platform, and branding remain the property of RelayDesk. These terms do not grant you any licence to reproduce, modify, or distribute any part of the RelayDesk platform.
            </p>
            <p>
              Content you provide to configure the service, including business information, FAQs and instructions, remains your property. You grant RelayDesk a licence to use that content to operate and improve the service.
            </p>
          </Section>

          <Section title="Privacy">
            <p>
              Your use of RelayDesk is also subject to our <a href="/privacy" className="font-semibold">Privacy Policy</a>, which describes how we collect, use, store and disclose personal information, including call recordings and transcripts. The Privacy Policy forms part of these terms.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms from time to time. When we do, we will publish the updated version on our website and revise the effective date. For material changes, we will notify you by email with at least 14 days notice before the changes take effect.
            </p>
            <p>
              Continued use of RelayDesk after the effective date of any changes constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These terms are governed by the laws of New South Wales, Australia. Any disputes arising from these terms or your use of RelayDesk will be subject to the exclusive jurisdiction of the courts of New South Wales.
            </p>
          </Section>

          <Section title="Contact us">
            <p>If you have questions about these terms, contact us at:</p>
            <p>
              <a href={EMAIL_HREF} className="font-semibold">hello@relaydesk.com.au</a>
            </p>
            <p>RelayDesk is operated by Jon Lee Taylor (ABN 50 154 134 393), New South Wales, Australia.</p>
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
