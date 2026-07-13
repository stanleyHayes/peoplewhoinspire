import { FaLightbulb, FaUsers, FaGlobe, FaHeart } from 'react-icons/fa';
import SectionHeader from '../ui/SectionHeader';
import { Reveal3D } from '../motion/Reveal';

const pillars = [
  {
    icon: FaLightbulb,
    title: 'Inspire',
    description:
      'We spark the flame of purpose in individuals, helping them discover their unique calling and the impact they are meant to make in the world.',
  },
  {
    icon: FaUsers,
    title: 'Connect',
    description:
      'We build bridges between visionary leaders across borders, creating a powerful network of change-makers who support and uplift one another.',
  },
  {
    icon: FaGlobe,
    title: 'Equip',
    description:
      'Through world-class programs, masterclasses, and mentorship, we provide leaders with the tools, knowledge, and skills they need to thrive.',
  },
  {
    icon: FaHeart,
    title: 'Empower',
    description:
      'We invest in the growth of leaders, giving them the confidence, resources, and community to turn their vision into lasting impact.',
  },
];

export default function WhatWeDo() {
  return (
    <section className="bg-[#f7f5ef] py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          subtitle="What We Do"
          title="Building Purpose-Driven Leaders"
          description="At PWI, we operate through four interconnected pillars that form the foundation of our global leadership development approach."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <Reveal3D key={pillar.title} delay={index * 0.12} className="h-full">
              <div className="group relative h-full overflow-hidden border border-gray-200 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl">
                {/* Number */}
                <div className="absolute right-4 top-4 font-serif text-5xl font-bold text-gray-100 transition-colors duration-300 group-hover:text-gold-100">
                  0{index + 1}
                </div>

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-navy-900 transition-colors duration-300 group-hover:bg-gold-400">
                    <pillar.icon className="text-xl text-gold-400 transition-colors duration-300 group-hover:text-navy-950" />
                  </div>
                  <h3 className="mb-3 font-serif text-xl font-bold text-navy-800">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-7 text-gray-500">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </Reveal3D>
          ))}
        </div>
      </div>
    </section>
  );
}
