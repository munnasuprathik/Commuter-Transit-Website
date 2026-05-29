export interface ServiceContent {
  slug: string;
  title: string;
  headline: string;
  hero: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  highlights: { title: string; desc: string; icon: string }[];
  image: string;
}

export const SERVICES: Record<string, ServiceContent> = {
  chauffeur: {
    slug: 'chauffeur',
    title: 'Chauffeur Services | Commuter Transit',
    headline: 'Executive Chauffeur Services for Business & Private Travel',
    hero: 'Premium chauffeur transport for executives, VIP guests and private clients across Australia.',
    metaDescription:
      'Premium executive chauffeur services for business leaders, VIP guests, private clients, weddings and professional travel. Experienced chauffeurs, luxury vehicles, nationwide service.',
    content:
      'Experience professional chauffeur-driven transport designed for executives, VIP guests, private clients and premium travel requirements. Our luxury fleet and experienced drivers deliver comfort, punctuality and professionalism for airport pickups, business meetings, events, weddings and private journeys.',
    keywords: [
      'executive chauffeur services',
      'luxury chauffeur hire',
      'business chauffeur Australia',
      'private chauffeur transport',
      'VIP transport services',
    ],
    highlights: [
      { title: 'Luxury Fleet', desc: 'Premium sedans and executive SUVs maintained to showroom standard.', icon: 'solar:medal-star-linear' },
      { title: 'Trained Chauffeurs', desc: 'Professional, accredited drivers with discretion and protocol training.', icon: 'solar:user-id-linear' },
      { title: 'Punctuality Guarantee', desc: 'On-time, every time — for business meetings, weddings, VIP transfers.', icon: 'solar:clock-circle-linear' },
    ],
    image:
      '/images/service-chauffeur.jpeg',
  },
  'wheelchair-accessible': {
    slug: 'wheelchair-accessible',
    title: 'Wheelchair Accessible Transport | Commuter Transit',
    headline: 'Safe & Dignified Wheelchair Accessible Transport',
    hero: 'Inclusive, mobility-first transport with wheelchair-accessible vehicles and trained drivers.',
    metaDescription:
      'Safe, dignity-first wheelchair-accessible transport for NDIS, healthcare, aged care and assisted mobility. Trained drivers, ramps, restraints, inclusive travel support.',
    content:
      'Inclusive mobility solutions designed around comfort, safety and independence. Our wheelchair-accessible vehicles and trained drivers support healthcare transport, aged care mobility, hospital appointments, assisted travel and specialist passenger movement with dignity-first service.',
    keywords: [
      'wheelchair transport Australia',
      'accessible transport services',
      'disability transport',
      'assisted passenger transport',
      'mobility transport services',
    ],
    highlights: [
      { title: 'Accessible Fleet', desc: 'Fully equipped WAVs with ramps, restraints and dedicated mobility seating.', icon: 'solar:hand-heart-linear' },
      { title: 'NDIS & Healthcare', desc: 'Trusted by NDIS participants, aged care providers and healthcare partners.', icon: 'solar:medical-kit-linear' },
      { title: 'Dignity-First', desc: 'Trained drivers, inclusive support, respectful service on every journey.', icon: 'solar:shield-user-linear' },
    ],
    image:
      '/images/service-wheelchair.jpeg',
  },
  'airport-transfers': {
    slug: 'airport-transfers',
    title: 'Airport Transfers | Commuter Transit',
    headline: 'Reliable Airport Transfers with Professional Drivers',
    hero: 'Stress-free airport transport — flight monitoring, meet & greet, fixed-fare transfers.',
    metaDescription:
      'Reliable airport transfer services across Australia. Flight monitoring, meet & greet, luggage support, fixed-fare private transfers for individuals, families and groups.',
    content:
      'Stress-free airport transport with fixed pricing, flight monitoring, luggage support and meet & greet services. Whether travelling for business or leisure, we provide dependable airport transfers for individuals, families and groups.',
    keywords: [
      'airport transfer services',
      'airport chauffeur',
      'Melbourne airport transfer',
      'private airport transport',
      'airport pickup service',
    ],
    highlights: [
      { title: 'Flight Monitoring', desc: 'Real-time tracking — pickup adjusts to delays automatically.', icon: 'solar:plane-linear' },
      { title: 'Fixed Pricing', desc: 'Transparent fares quoted upfront. No surge, no surprises.', icon: 'solar:tag-price-linear' },
      { title: 'Meet & Greet', desc: 'Driver waits at arrivals with name board, helps with luggage.', icon: 'solar:user-check-linear' },
    ],
    image:
      '/images/service-airport.jpeg',
  },
  'event-corporate': {
    slug: 'event-corporate',
    title: 'Event & Corporate Transport | Commuter Transit',
    headline: 'Corporate Transport Solutions for Business Mobility',
    hero: 'Scalable transport for executives, employees, conferences and event logistics.',
    metaDescription:
      'Corporate and event transport solutions — conference shuttles, workforce movement, executive travel, event logistics and guest transport coordination across Australia.',
    content:
      'Professional transport support for executives, employees, conferences, events and workforce mobility. From recurring employee shuttles to VIP executive transfers, our scalable transport solutions help businesses move efficiently and professionally.',
    keywords: [
      'corporate transport services',
      'employee shuttle transport',
      'executive business transport',
      'conference transport',
      'workforce mobility solutions',
    ],
    highlights: [
      { title: 'Scalable Fleet', desc: 'Sedans to coaches — one provider for every group size.', icon: 'solar:users-group-rounded-linear' },
      { title: 'Event Coordination', desc: 'End-to-end logistics planning for conferences and corporate events.', icon: 'solar:calendar-linear' },
      { title: 'Account-Managed', desc: 'Dedicated account manager for recurring corporate bookings.', icon: 'solar:case-linear' },
    ],
    image:
      '/images/service-event.jpeg',
  },
  logistics: {
    slug: 'logistics',
    title: 'Logistics Transport | Commuter Transit',
    headline: 'Logistics Transport',
    hero: 'Flexible commercial transport for documents, parcels and time-sensitive business deliveries.',
    metaDescription:
      'Flexible commercial transport for documents, parcels, scheduled business deliveries and time-sensitive logistics support.',
    content:
      'Flexible commercial transport for documents, parcels, scheduled business deliveries and time-sensitive logistics support.',
    keywords: [
      'Logistics Transport Australia',
      'commercial passenger transport',
    ],
    highlights: [],
    image:
      '/images/service-logistics.jpeg',
  },
  'rail-replacement': {
    slug: 'rail-replacement',
    title: 'Rail Replacement & Public Disruption Transport | Commuter Transit',
    headline: 'Rail Replacement & Public Disruption Transport Solutions',
    hero: 'Rapid-response transport for rail replacement and public network disruption support.',
    metaDescription:
      'Rapid-response rail replacement and public disruption transport — for transport authorities, contractors and government agencies. Scalable fleet, trained operators.',
    content:
      'Rapid-response transport services for rail replacement, planned maintenance works, emergency passenger movement, infrastructure projects and public transport disruptions. Our scalable fleet solutions support transport operators, contractors and public infrastructure teams during planned or unexpected network interruptions.',
    keywords: [
      'rail replacement transport',
      'emergency transport services',
      'disruption transport contractor',
      'infrastructure transport services',
      'public transport replacement buses',
      'contract transport Australia',
    ],
    highlights: [
      { title: 'Rapid Deployment', desc: 'Scalable response for planned and unplanned network disruptions.', icon: 'solar:rocket-linear' },
      { title: 'Government Ready', desc: 'Compliance, insurance and accreditation for public contracts.', icon: 'solar:shield-check-linear' },
      { title: 'Trained Operators', desc: 'Drivers and coordinators experienced in public transport workflows.', icon: 'solar:tram-linear' },
    ],
    image:
      '/images/service-public.jpeg',
  },
  'vehicle-hire': {
    slug: 'vehicle-hire',
    title: 'Vehicle Hire | Commuter Transit',
    headline: 'Flexible Vehicle Hire for Passenger & Commercial Transport',
    hero: 'Sedans, SUVs, accessible vans, minibuses and specialist transport fleet — for hire.',
    metaDescription:
      'Flexible vehicle hire — executive sedans, SUVs, wheelchair-accessible vans, minibuses and specialist transport fleet for private, business and contract use.',
    content:
      'Access professionally maintained sedans, SUVs, vans, minibuses and specialist transport vehicles for private travel, business operations, event logistics and transport contracts.',
    keywords: [
      'vehicle hire Australia',
      'minibus hire',
      'transport fleet hire',
      'commercial vehicle hire',
      'passenger transport vehicle hire',
    ],
    highlights: [
      { title: 'Diverse Fleet', desc: 'Six vehicle classes — from executive sedans to specialist transport.', icon: 'solar:bus-linear' },
      { title: 'Short & Long Term', desc: 'Hourly, daily, weekly or contract-length hire arrangements.', icon: 'solar:calendar-linear' },
      { title: 'Driver Optional', desc: 'Chauffeur-driven or self-drive — flexible to your needs.', icon: 'solar:user-id-linear' },
    ],
    image:
      '/images/hero-van.jpeg',
  },
};

export const SERVICE_ORDER: string[] = [
  'chauffeur',
  'wheelchair-accessible',
  'airport-transfers',
  'event-corporate',
  'logistics',
  'rail-replacement',
  'vehicle-hire',
];
