import { motion } from 'framer-motion';

const vehicles = [
  {
    name: 'Sedans',
    desc: 'Executive sedans for chauffeur travel and VIP transfers.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
  },
  {
    name: 'SUVs',
    desc: 'Spacious premium SUVs for corporate and family transport.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200',
  },
  {
    name: 'Accessible Vehicles',
    desc: 'Wheelchair-accessible vehicles with ramps and restraints.',
    image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=1200',
  },
  {
    name: 'Vans',
    desc: 'Passenger vans for group travel and logistics movement.',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1200',
  },
  {
    name: 'Mini Buses',
    desc: 'Mini buses for corporate shuttles and event transport.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
  },
  {
    name: 'Specialist Fleet',
    desc: 'Purpose-built vehicles for civil and infrastructure projects.',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200',
  },
];

export function FleetSection() {
  return (
    <section id="fleet" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Fleet Snapshot</span>
        </div>
        <div className="mb-10 md:mb-14 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-blue font-medium tracking-tight leading-[1.1]">
            Six vehicle classes. <span className="italic font-serif text-brand-orange">One trusted fleet.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {vehicles.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-50 border border-zinc-100 hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                <img
                  src={v.image}
                  alt={v.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-brand-blue tracking-tight mb-2">{v.name}</h3>
                <p className="text-sm sm:text-base text-zinc-500 font-light leading-relaxed">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
