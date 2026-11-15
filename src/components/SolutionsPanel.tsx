import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../router/RouterContext';
import { ArrowRight } from 'lucide-react';
import { FACILITY_IMAGES } from '../data/facilityImages';

interface SolutionsPanelProps {
  onNavigate?: (path: string) => void;
}

export const SolutionsPanel: React.FC<SolutionsPanelProps> = ({ onNavigate }) => {
  const router = useRouter();
  const navigate = onNavigate || router.navigate;

  // Stats counting animation trigger
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [countLifecycle, setCountLifecycle] = useState(0);
  const [countTiers, setCountTiers] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsVisible]);

  useEffect(() => {
    if (!statsVisible) return;

    const duration = 1600;
    const startTime = performance.now();

    const cubicInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let frameId: number;
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / duration));
      const eased = cubicInOut(progress);

      setCountLifecycle(Math.round(eased * 5));
      setCountTiers(Math.round(eased * 4));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [statsVisible]);

  // Cards use smooth CSS hover elevation instead of JS mouse handlers on static containers

  const solutions = [
    {
      label: '[Events & assemblies]',
      title: 'Auditoriums, gyms and open courts',
      desc: 'Lock the slot, collect the adviser endorsement and issue the gate pass without a single paper slip.',
      image: FACILITY_IMAGES.auditorium,
    },
    {
      label: '[Academic spaces]',
      title: 'Laboratories and lecture halls',
      desc: 'Department Chair clearance and custodian sign-off built into every request, with equipment and capacity shown up front.',
      image: FACILITY_IMAGES.computingLab,
    },
    {
      label: '[Cross-campus access]',
      title: 'Multi-campus workflow support',
      desc: 'Student organizations can submit facility requests across configured campus workspaces, each under its own clearance policy.',
      image: FACILITY_IMAGES.tennisCourts,
    },
  ];

  return (
    <section
      id="solutions-panel"
      className="relative z-10 bg-white rounded-t-[22px] px-6 sm:px-9 pt-16 pb-20 -mt-[30vh] shadow-[0_-30px_60px_rgba(11,21,40,0.12)] border-t border-slate-100"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="story-chip">Our solutions</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1528] tracking-tight leading-tight">
              Built for every kind of campus space
            </h2>
          </div>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-[360px] font-normal">
            Auditoriums, gymnasiums, courts, laboratories and lecture halls on one auditable booking record — so every reservation can be traced from request to gate scan.
          </p>
        </div>

        {/* 3 Visual Solution Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-2">
          {solutions.map((card, idx) => (
            <div
              key={idx}
              className="group relative h-[360px] sm:h-[440px] rounded-[12px] overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="w-full h-full relative">
                {/* Background Image with Zoom */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                  loading="lazy"
                />
                {/* Dark gradient overlay for readable contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/95 via-[#0B1528]/55 to-transparent transition-opacity duration-300" />

                {/* Card Content */}
                <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-between text-white z-10">
                  <div className="flex items-center justify-between">
                    <span className="story-mono text-[11px] text-[#FDB813] font-bold tracking-widest bg-[#0B1528]/85 px-2.5 py-1 rounded backdrop-blur-xs">
                      {card.label}
                    </span>
                    <div aria-hidden="true" className="w-7 h-7 rounded-full bg-[#FDB813] text-[#0B1528] flex items-center justify-center font-bold text-sm shadow-md transition-transform duration-300 group-hover:-rotate-45">
                      →
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed transition-all duration-300 font-normal">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA under cards */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/request-demo')}
            className="px-8 py-3.5 rounded-full bg-[#0077C8] hover:bg-[#0060a3] text-white font-extrabold text-sm shadow-xl shadow-blue-900/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Request Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Four Count-up Stats */}
        <div
          ref={statsRef}
          className="pt-10 border-t border-[#e0e5ea] grid grid-cols-2 md:grid-cols-4 gap-8 text-left"
        >
          <div className="space-y-1.5">
            <div className="text-4xl sm:text-5xl font-medium text-[#0B1528] tracking-tight font-sans">
              Pilot
            </div>
            <div className="story-mono text-[10.5px] uppercase tracking-wider text-slate-600 font-semibold">
              Guided campus onboarding
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-4xl sm:text-5xl font-medium text-[#0B1528] tracking-tight font-sans">
              {countLifecycle}
            </div>
            <div className="story-mono text-[10.5px] uppercase tracking-wider text-slate-600 font-semibold">
              Step booking lifecycle
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-4xl sm:text-5xl font-medium text-[#0B1528] tracking-tight font-sans">
              {countTiers}
            </div>
            <div className="story-mono text-[10.5px] uppercase tracking-wider text-slate-600 font-semibold">
              Approval tiers
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-4xl sm:text-5xl font-medium text-[#0B1528] tracking-tight font-sans flex items-center gap-2">
              <span>0</span>
              <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-lime-700" title="Conflict-checked scheduling" />
            </div>
            <div className="story-mono text-[10.5px] uppercase tracking-wider text-slate-600 font-semibold">
              Double bookings
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
