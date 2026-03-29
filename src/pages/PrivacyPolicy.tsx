import React, { useEffect } from 'react';
import { Footer } from '../components/blocks/footer';

export function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="flex-grow">
        <div className="container mx-auto px-6 max-w-4xl py-32 md:py-48">
          <a href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-blue transition-colors mb-12 text-sm font-medium uppercase tracking-widest">
            <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
            Back to Home
          </a>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tighter text-brand-blue mb-8">Privacy Policy</h1>
          <p className="text-zinc-500 font-light mb-16">Last updated: {new Date().toLocaleDateString('en-AU')}</p>

          <div className="prose prose-zinc max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-p:font-light prose-p:leading-relaxed prose-p:text-zinc-600">
            <h2>1. Introduction</h2>
            <p>
              Commuter Transit ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our transport and logistics services. We are bound by the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website, or otherwise when you contact us.
            </p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, phone number, and billing information.</li>
              <li><strong>Service Data:</strong> Pick-up and drop-off locations, travel itineraries, and specific transport requirements (e.g., accessibility needs).</li>
              <li><strong>Usage Data:</strong> Information automatically collected when you use our website, such as IP addresses, browser types, and interaction metrics.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect or receive to:
            </p>
            <ul>
              <li>Facilitate account creation and logon process.</li>
              <li>Provide and manage our transport, vehicle hire, and logistics services.</li>
              <li>Fulfill and manage your bookings, payments, and requests.</li>
              <li>Respond to customer service inquiries and offer support.</li>
              <li>Send administrative information, such as updates to our terms, conditions, and policies.</li>
              <li>Ensure compliance with Australian transport and safety regulations.</li>
            </ul>

            <h2>4. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul>
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, and customer service.</li>
              <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2>6. Your Privacy Rights</h2>
            <p>
              Under the Privacy Act 1988 (Cth), you have the right to request access to the personal information we hold about you and to request corrections to that information. If you wish to exercise these rights, please contact us using the details provided below.
            </p>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by updating the "Last updated" date of this Privacy Policy.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Commuter Transit</strong><br />
              Melbourne, Australia<br />
              Email: info@commutertransit.com.au
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
