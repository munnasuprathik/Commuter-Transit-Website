import React from 'react';
import { motion } from 'framer-motion';

const vehicles = [
  {
    name: "Wheelchair Accessible Van",
    capacity: "Up to 5 + Wheelchair",
    luggage: "2 Mobility Aids",
    image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=1000",
    alt: "Wheelchair accessible van for NDIS transport in Melbourne",
    description: "Fully equipped WAVs for NDIS participants and individuals with mobility needs — ramps, restraints, and trained drivers."
  },
  {
    name: "Corporate Minibus",
    capacity: "Up to 14 Passengers",
    luggage: "6 Large Cases",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000",
    alt: "Corporate minibus for event shuttle and airport transfer in Melbourne",
    description: "Premium group transport for corporate events, airport transfers, and conference shuttles across Melbourne."
  },
  {
    name: "Crew Bus",
    capacity: "Up to 21 Passengers",
    luggage: "Tool Kits & Gear",
    image: "https://images.unsplash.com/photo-1581094751227-43b4852bb2f7?auto=format&fit=crop&q=80&w=1000",
    alt: "Civil crew bus for construction and infrastructure project worker transport Victoria",
    description: "Purpose-built crew buses for civil construction and infrastructure projects — early starts, shift changes, and remote site access."
  }
];

export function FleetSection() {
  return (
    <section id="fleet" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:mb-24">
          <h2 className="text-[40px] md:text-[80px] font-light tracking-tighter leading-none mb-6">
            THE <span className="italic font-serif">Fleet</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-500 max-w-xl font-light leading-relaxed">
            Our well-maintained fleet covers everything from wheelchair accessible vans for NDIS transport, to corporate minibuses and civil crew coaches operating across Melbourne and Victoria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {vehicles.map((vehicle, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-3xl mb-8 bg-zinc-100">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.alt}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-medium tracking-tight">{vehicle.name}</h3>
                </div>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">
                  {vehicle.description}
                </p>
                <div className="flex gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <iconify-icon icon="solar:users-group-rounded-linear" width="16" className="text-zinc-400"></iconify-icon>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{vehicle.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <iconify-icon icon="solar:suitcase-lines-linear" width="16" className="text-zinc-400"></iconify-icon>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{vehicle.luggage}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
