import React from 'react';

const PrivacyPolicyPage = () => (
  <div className="container mx-auto p-8 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="text-sm mb-6">Last updated: July 14, 2025</p>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
      <p>Andishi MVP (“we”, “us”) is committed to protecting your personal data in compliance with the Data Protection Act, 2019 and its General Regulations, 2021. We emphasise transparency, fairness, and accountability in how we collect, process, store, and share your data.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">2. Personal Data We Collect</h2>
      <p>We collect only necessary personal data, in line with the principles of data minimisation and purpose limitation. Examples include:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Name, email address, phone number</li>
        <li>Professional data such as skills, experience, portfolio</li>
      </ul>
      <p>Where data is provided indirectly (e.g., via third parties), we will notify you within 14 days.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">3. Purpose and Legal Basis for Processing</h2>
      <p>Processing is conducted based on lawful legal grounds such as:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Performance of contractual obligations</li>
        <li>Legitimate business interests (e.g., customer support)</li>
        <li>Your consent, where required</li>
      </ul>
      <p>Personal data is processed only for specified, explicit, and legitimate purposes and not used further in a way incompatible with those purposes.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">4. Disclosure & Sharing of Your Data</h2>
      <p>We may share your data under legally permitted circumstances, or when:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Working with service providers (e.g., hosting, email, analytics)</li>
        <li>Complying with legal obligations</li>
      </ul>
      <p>Where sharing occurs, we require written requests specifying purpose, retention period, and safeguards in compliance with Regulation 21 of LN 263_2021.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">5. Data Retention & Security</h2>
      <p>We retain personal data only as long as necessary, in line with a documented retention schedule, and securely delete or anonymise it thereafter. We implement organisational, administrative, and technical safeguards to protect data integrity, confidentiality, and availability.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">6. Your Rights as a Data Subject</h2>
      <p>Under Kenyan law, you have the right to:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Access and receive a copy of your data</li>
        <li>Request correction or deletion of inaccurate data</li>
        <li>Restrict or object to processing</li>
        <li>Request portability of your data</li>
      </ul>
      <p>Requests must be fulfilled within statutory timeframes free of charge.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">7. Automated Decision‑Making</h2>
      <p>If we use automated profiling or decision‑making, you’ll be informed of the logic involved and have the right to human review and objection under the Act.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">8. Data Protection Officer & Complaints</h2>
      <p>We are registered with the ODPC and may appoint a Data Protection Officer. You may lodge complaints with the Data Commissioner or through our internal complaints process.</p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-2">9. Contact Us</h2>
      <p>If you have any questions or requests, reach us at:</p>
      <p>
        Andishi LTD<br />
        Ruiru, Kiambu, Kenya<br />
        Email: info@andishi.dev<br />
        Phone: +254 759 912 373
      </p>
    </section>
  </div>
);

export default PrivacyPolicyPage;
