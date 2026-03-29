import React, { useEffect } from 'react';
import { Footer } from '../components/blocks/footer';

export function TermsOfService() {
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
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tighter text-brand-blue mb-8">Terms of Service</h1>
          <p className="text-zinc-500 font-light mb-16">Last updated: {new Date().toLocaleDateString('en-AU')}</p>

          <div className="prose prose-zinc max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-p:font-light prose-p:leading-relaxed prose-p:text-zinc-600">
            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Commuter Transit ("we," "us," or "our"), concerning your access to and use of the commutertransit.com.au website as well as any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
            </p>
            <p>
              By accessing the Site and utilizing our transport and logistics services, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and our services and you must discontinue use immediately.
            </p>

            <h2>2. Services Provided</h2>
            <p>
              Commuter Transit provides a range of transport and logistics services in Melbourne, Victoria, and interstate, including but not limited to:
            </p>
            <ul>
              <li>Vehicle Hire (Short and long-term)</li>
              <li>Accessible Transport</li>
              <li>Corporate and Event Transport</li>
              <li>Tour and Charter Services</li>
              <li>School and Group Transport</li>
              <li>Transport Disruption Support</li>
              <li>Removal and Logistics Services</li>
              <li>Civil Project Crew Transport</li>
            </ul>
            <p>
              All services are subject to availability and specific terms and conditions provided at the time of booking.
            </p>

            <h2>3. Booking and Cancellation Policy</h2>
            <p>
              <strong>Bookings:</strong> All bookings must be confirmed by Commuter Transit. A booking is not considered final until you receive a confirmation email or written agreement.
            </p>
            <p>
              <strong>Cancellations:</strong> Cancellation policies vary depending on the service booked (e.g., vehicle hire vs. civil project crew transport). Specific cancellation terms will be provided in your booking agreement. Generally, cancellations made within 24 hours of the scheduled service may incur a cancellation fee.
            </p>

            <h2>4. User Representations</h2>
            <p>
              By using the Site and our services, you represent and warrant that:
            </p>
            <ul>
              <li>All registration and booking information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You are not a minor in the jurisdiction in which you reside.</li>
              <li>You will not use the Site or our services for any illegal or unauthorized purpose.</li>
            </ul>

            <h2>5. Australian Consumer Law</h2>
            <p>
              Our services come with guarantees that cannot be excluded under the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010 (Cth)). For major failures with the service, you are entitled:
            </p>
            <ul>
              <li>to cancel your service contract with us; and</li>
              <li>to a refund for the unused portion, or to compensation for its reduced value.</li>
            </ul>
            <p>
              You are also entitled to be compensated for any other reasonably foreseeable loss or damage. If the failure does not amount to a major failure, you are entitled to have problems with the service rectified in a reasonable time and, if this is not done, to cancel your contract and obtain a refund for the unused portion of the contract.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, including the Australian Consumer Law, in no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Site or our services.
            </p>

            <h2>7. Governing Law</h2>
            <p>
              These Terms of Service and your use of the Site and our services are governed by and construed in accordance with the laws of the State of Victoria, Australia, applicable to agreements made and to be entirely performed within the State of Victoria, without regard to its conflict of law principles.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the Site or our services or to receive further information regarding use of the Site, please contact us at:
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
