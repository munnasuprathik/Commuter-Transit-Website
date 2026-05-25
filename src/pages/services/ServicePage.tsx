import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Footer } from '../../components/blocks/footer';
import { SERVICES, SERVICE_ORDER, ServiceContent } from './service-data';

const SITE = 'https://commutertransit.com.au';

function injectHead(service: ServiceContent) {
  document.title = service.title;

  const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', service.metaDescription);
  setMeta('keywords', service.keywords.join(', '));
  setMeta('og:title', service.title, 'property');
  setMeta('og:description', service.metaDescription, 'property');
  setMeta('og:url', `${SITE}/services/${service.slug}`, 'property');
  setMeta('twitter:title', service.title, 'property');
  setMeta('twitter:description', service.metaDescription, 'property');

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `${SITE}/services/${service.slug}`);

  // Service JSON-LD
  const existing = document.getElementById('jsonld-service');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'jsonld-service';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.headline,
    name: service.title,
    description: service.metaDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Commuter Transit',
      url: SITE,
      telephone: '+61411099994',
      email: 'info@commutertransit.com.au',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Melbourne',
        addressRegion: 'VIC',
        addressCountry: 'AU',
      },
    },
    areaServed: { '@type': 'Country', name: 'Australia' },
    url: `${SITE}/services/${service.slug}`,
  });
  document.head.appendChild(script);
}

export function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? SERVICES[slug] : undefined;

  useEffect(() => {
    if (!service) return;
    injectHead(service);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    return () => {
      const s = document.getElementById('jsonld-service');
      if (s) s.remove();
    };
  }, [service]);

  if (!service) return <Navigate to="/" replace />;

  const others = SERVICE_ORDER.filter((s) => s !== service.slug).slice(0, 3);

  return (
    <div className="bg-[#fafafa]">
      {/* Minimal Top Bar */}
      <header className="absolute top-0 inset-x-0 z-50 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center pointer-events-none">
        <Link to="/" className="pointer-events-auto inline-flex items-center">
          <div className="h-16 md:h-20">
            <img src="/images/CT LOGO WHITE.png" alt="Commuter Transit" className="h-full w-auto object-contain" />
          </div>
        </Link>
        <Link
          to="/#contact"
          className="pointer-events-auto hidden md:inline-flex items-center gap-2 bg-white text-brand-blue px-7 py-3 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-zinc-100 transition-colors"
        >
          Book Transport
          <iconify-icon icon="solar:arrow-right-up-linear" width="14"></iconify-icon>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative bg-brand-blue text-white overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="container mx-auto px-6 max-w-7xl">
          <Link
            to="/#services"
            className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors mb-8"
          >
            <iconify-icon icon="solar:arrow-left-linear" width="14"></iconify-icon>
            All Services
          </Link>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <span className="text-[10px] sm:text-xs font-medium text-brand-orange uppercase tracking-[0.3em] mb-6 inline-block">
                Premium Service
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight mb-6 md:mb-8">
                {service.headline}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-2xl mb-8 md:mb-10">
                {service.hero}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/#contact"
                  className="px-10 py-4 bg-brand-orange hover:bg-brand-orange-light text-white text-[11px] font-medium uppercase tracking-[0.2em] rounded-full transition-colors text-center"
                >
                  Book Transport
                </Link>
                <a
                  href="tel:0411099994"
                  className="px-10 py-4 bg-transparent border border-white/25 hover:bg-white hover:text-brand-blue text-white text-[11px] font-medium uppercase tracking-[0.2em] rounded-full transition-all duration-500 text-center"
                >
                  Call 0411 099 994
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative h-[280px] md:h-[400px] lg:h-[480px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
            >
              <img src={service.image} alt={service.headline} className="w-full h-full object-cover" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/40 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 bg-[#fafafa]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="mb-6">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">About this service</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-brand-blue tracking-tight font-medium leading-[1.15]">
                Built around <span className="italic text-brand-orange">your requirements.</span>
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-base sm:text-lg md:text-xl text-zinc-600 font-light leading-relaxed">
                {service.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      {service.highlights.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="mb-10 md:mb-14">
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">What you get</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {service.highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="p-6 sm:p-8 bg-zinc-50 rounded-2xl sm:rounded-3xl hover:bg-zinc-100 transition-colors duration-500"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-blue mb-6 shadow-sm">
                    <iconify-icon icon={h.icon} width="22"></iconify-icon>
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-brand-blue mb-2 tracking-tight">{h.title}</h3>
                  <p className="text-sm sm:text-base text-zinc-500 font-light leading-relaxed">{h.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand-blue text-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.15] max-w-3xl">
              Ready to book <span className="text-brand-orange italic">{service.headline.split(' ').slice(-2).join(' ').toLowerCase()}?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                to="/#contact"
                className="px-10 py-4 bg-brand-orange hover:bg-brand-orange-light text-white text-[11px] font-medium uppercase tracking-[0.2em] rounded-full transition-colors text-center"
              >
                Book Transport
              </Link>
              <Link
                to="/#contact"
                className="px-10 py-4 bg-transparent border border-white/25 hover:bg-white hover:text-brand-blue text-white text-[11px] font-medium uppercase tracking-[0.2em] rounded-full transition-all duration-500 text-center"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="py-16 md:py-24 bg-[#fafafa]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-10 md:mb-14">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Other services</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {others.map((s) => {
              const o = SERVICES[s];
              return (
                <Link
                  key={s}
                  to={`/services/${s}`}
                  className="group block p-6 sm:p-8 bg-white border border-zinc-100 rounded-2xl sm:rounded-3xl hover:border-brand-orange/40 hover:shadow-xl transition-all duration-500"
                >
                  <h3 className="text-lg sm:text-xl font-medium text-brand-blue mb-2 tracking-tight group-hover:text-brand-orange transition-colors">{o.headline.split(':')[0]}</h3>
                  <p className="text-sm text-zinc-500 font-light leading-relaxed line-clamp-2 mb-4">{o.hero}</p>
                  <span className="inline-flex items-center gap-2 text-[10px] font-medium text-brand-blue uppercase tracking-[0.2em] group-hover:text-brand-orange transition-colors">
                    Read more
                    <iconify-icon icon="solar:arrow-right-linear" width="14"></iconify-icon>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
