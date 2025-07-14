import React from 'react';

export const ClientPrivacyPolicyPage = () => (
  <div className="container mx-auto p-8 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20">
    <h1 className="text-3xl font-bold mb-6">Client Privacy Policy</h1>
    <p className="text-sm mb-6">Last updated: July 14, 2025</p>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
      <p>This Client Privacy Policy describes how Andishi MVP collects, uses, and shares personal and business information from our clients, in accordance with the Kenya Data Protection Act, 2019 and Legal Notice 263/2021.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
      <p>We collect only necessary information for the delivery of contracted services:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Contact details (name, email, phone, address)</li>
        <li>Business information (company name, industry, project scope)</li>
        <li>Billing information (payment details, invoices, purchase orders)</li>
        <li>Service-related communication (emails, calls, signed documents)</li>
      </ul>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">3. Purpose of Processing</h2>
      <p>Your information is processed for the following purposes:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Fulfilling contractual obligations</li>
        <li>Project tracking, support, and delivery</li>
        <li>Accounting, invoicing, and audit compliance</li>
        <li>Internal analysis for service improvement</li>
        <li>Legal compliance and risk mitigation</li>
      </ul>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">4. Data Sharing</h2>
      <p>We may share your data with:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Internal staff under non-disclosure obligations</li>
        <li>Service providers (e.g., hosting, payment processors) with proper data processing agreements</li>
        <li>Regulatory or legal authorities when required</li>
      </ul>
      <p>We do not sell your data. All third-party sharing is governed under Regulation 21 of Kenya’s Data Protection Regulations (LN263/2021).</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">5. Data Retention & Security</h2>
      <p>We retain client data only as long as necessary for service and legal reasons. Retention schedules are documented, and expired data is anonymised or deleted. Encryption and access control policies are in place to prevent misuse.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">6. Your Rights</h2>
      <p>Clients have the right to access, correct, or request deletion of their personal information. Requests will be fulfilled in accordance with Kenyan data law within statutory timelines.</p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
      <p>
        If you have any questions or requests, reach us at:<br />
        Email: info@andishi.dev<br />
        Address: Ruiru, Kiambu, Kenya
      </p>
    </section>
  </div>
);