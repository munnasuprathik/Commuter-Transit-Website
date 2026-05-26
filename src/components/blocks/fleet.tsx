import { motion } from 'framer-motion';

const fleetTypes = [
  { name: 'Sedan', icon: 'lucide:car' },
  { name: 'SUV', icon: 'lucide:car-front' },
  { name: 'Accessible Vans', icon: 'lucide:accessibility' },
  { name: 'Group Transport', icon: 'lucide:bus' },
  { name: 'Executive Fleet', icon: 'lucide:briefcase' },
];

const fleetFeatures = [
  { title: 'Clean & Sanitised', desc: 'Regularly', icon: 'lucide:sparkles' },
  { title: 'GPS Tracked', desc: 'For Safety', icon: 'lucide:map-pin' },
  { title: 'Well Maintained', desc: 'Always', icon: 'lucide:wrench' },
  { title: 'Comfort & Safety', desc: 'Guaranteed', icon: 'lucide:shield-check' },
];

export function FleetSection() {
  return (
    <section id="fleet" className="py-16 md:py-24 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Side: Typography & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] sm:text-xs font-bold text-brand-orange uppercase tracking-[0.3em] block mb-4">Our Fleet</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-brand-blue font-bold tracking-tight mb-6 leading-[1.15]">
              Modern Fleet.<br/>
              <span className="italic font-medium text-brand-orange">Maximum Comfort.</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-500 font-light leading-relaxed max-w-md mb-10">
              Our vehicles are equipped for safety, accessibility and reliability on every journey.
            </p>
            
            
          </motion.div>

          {/* Right Side: Grid Layout */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid sm:grid-cols-2 gap-8 lg:gap-12 bg-[#fafafa] p-8 sm:p-10 rounded-3xl border border-gray-100"
          >
            {/* Types Column */}
            <div className="space-y-6">
              <h3 className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-4 border-b border-gray-200">Fleet Types</h3>
              <ul className="space-y-4">
                {fleetTypes.map((type, i) => (
                  <li key={i} className="flex items-center gap-4 text-brand-blue group">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-brand-orange shrink-0 group-hover:scale-110 group-hover:border-brand-orange/30 transition-all duration-300">
                      <iconify-icon icon={type.icon} width="20"></iconify-icon>
                    </div>
                    <span className="font-medium text-sm">{type.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features Column */}
            <div className="space-y-6">
              <h3 className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-4 border-b border-gray-200">Fleet Features</h3>
              <ul className="space-y-6">
                {fleetFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-brand-blue shrink-0 mt-0.5 group-hover:scale-110 group-hover:border-brand-blue/30 transition-all duration-300">
                      <iconify-icon icon={feature.icon} width="18"></iconify-icon>
                    </div>
                    <div>
                      <h4 className="font-medium text-brand-blue text-sm">{feature.title}</h4>
                      <p className="text-[13px] text-gray-500 font-light mt-1">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

