import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIG } from '../config/business';
import { ArrowRight, Sparkles } from 'lucide-react';
import auditoriumImg from '../assets/images/campus_cultural_auditorium_1794643571428.jpg';
import computingLabImg from '../assets/images/computing_innovation_lab_1794643572006.jpg';
import sportsArenaImg from '../assets/images/university_sports_arena_1794643572315.jpg';

interface WorkflowPreviewCard {
  id: string;
  client: string;
  tagline: string;
  badge: string;
  outcome: string;
  gradientStyle: React.CSSProperties;
  monogramType: 'auditorium' | 'lab' | 'athletics';
  stat1: {
    value: string;
    label: string;
  };
  stat2: {
    value: string;
    label: string;
  };
  photoUrl: string;
  photoAlt: string;
}

const WORKFLOW_PREVIEWS: WorkflowPreviewCard[] = [
  {
    id: 'workflow-auditorium',
    client: 'Auditoriums & Assembly Halls',
    tagline: 'Sample Public Higher Education Flow',
    badge: 'Illustrative Workflow',
    outcome: 'Designed to prevent double bookings across shared campus venues',
    gradientStyle: {
      background: 'radial-gradient(circle at 35% 25%, rgb(176, 64, 18) 0%, rgb(46, 13, 4) 100%)',
    },
    monogramType: 'auditorium',
    stat1: {
      value: 'Overlap Check',
      label: 'Flags conflicting slots before approval',
    },
    stat2: {
      value: 'Digital Log',
      label: 'Replaces paper requisition routing slips',
    },
    photoUrl: auditoriumImg,
    photoAlt: 'Illustrative university cultural auditorium interior',
  },
  {
    id: 'workflow-lab',
    client: 'Computing & STEM Laboratories',
    tagline: 'Sample Laboratory Custodian Flow',
    badge: 'Illustrative Workflow',
    outcome: 'Structured adviser and custodian review before slot confirmation',
    gradientStyle: {
      background: 'linear-gradient(135deg, rgb(236, 96, 28) 0%, rgb(250, 150, 56) 100%)',
    },
    monogramType: 'lab',
    stat1: {
      value: 'Multi-Step',
      label: 'Department and custodian approval queue',
    },
    stat2: {
      value: 'QR Pass',
      label: 'Scannable digital booking reference',
    },
    photoUrl: computingLabImg,
    photoAlt: 'Illustrative university computer laboratory workstations',
  },
  {
    id: 'workflow-athletics',
    client: 'Gymnasiums & Sports Courts',
    tagline: 'Sample Athletics Facility Flow',
    badge: 'Illustrative Workflow',
    outcome: 'Clear schedule visibility for student organizations and athletic staff',
    gradientStyle: {
      background: 'radial-gradient(circle at 35% 25%, rgb(132, 52, 22) 0%, rgb(24, 9, 5) 100%)',
    },
    monogramType: 'athletics',
    stat1: {
      value: '12-Hour Grid',
      label: 'Day-to-evening schedule availability view',
    },
    stat2: {
      value: 'Pilot Scope',
      label: 'Built for higher education in Cebu City',
    },
    photoUrl: sportsArenaImg,
    photoAlt: 'Illustrative indoor university sports arena',
  },
];

export const CampusResultsCaseStudies: React.FC = () => {
  const { navigate } = useRouter();
  const { setIsDemoModalOpen } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const headlineWords = [
    'How',
    'campuses',
    'can',
    'organize',
    'facility',
    'bookings',
    'with',
    'SmartSpace',
  ];

  const renderMonogram = (type: WorkflowPreviewCard['monogramType']) => {
    switch (type) {
      case 'auditorium':
        return (
          <svg className="w-6 h-6 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 21h18" />
            <path d="M5 21V10l7-5 7 5v11" />
            <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
            <path d="M12 5V2" />
          </svg>
        );
      case 'lab':
        return (
          <svg className="w-6 h-6 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 20h20" />
            <path d="M5 20V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12" />
            <circle cx="12" cy="13" r="3" />
            <path d="M12 6V3" />
          </svg>
        );
      case 'athletics':
        return (
          <svg className="w-6 h-6 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
    }
  };

  return (
    <section
      id="campus-results"
      className="py-24 sm:py-32 bg-[#FDFDFD] border-y border-slate-100 overflow-hidden font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Block: Centered Headline with Word-by-Word Stagger */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B8460F]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B8460F]" />
            <span>{BUSINESS_CONFIG.stage} · Illustrative Workflows</span>
          </motion.div>

          <h2 className="text-3xl sm:text-5xl lg:text-[44px] font-semibold tracking-tight text-black leading-[1.18] flex flex-wrap justify-center gap-x-2.5 gap-y-1">
            {headlineWords.map((word, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.45,
                  delay: shouldReduceMotion ? 0 : idx * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`inline-block ${
                  word === 'organize' || word === 'SmartSpace'
                    ? 'text-[#B8460F] font-semibold'
                    : 'text-black'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
            className="text-sm sm:text-base text-[#2B2B2B] leading-relaxed max-w-2xl mx-auto font-light"
          >
            {BUSINESS_CONFIG.stageNote} Explore illustrative workflow examples for campus auditoriums, laboratories, and athletic spaces below.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.45, ease: 'easeInOut' }}
            className="w-24 h-[1.5px] bg-[#B8460F]/30 mx-auto rounded-full origin-center"
          />
        </div>

        {/* 3 Tall Workflow Preview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch max-w-6xl mx-auto pt-4">
          {WORKFLOW_PREVIEWS.map((study, idx) => {
            const isHovered = hoveredCardId === study.id;

            return (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.65,
                  delay: shouldReduceMotion ? 0 : 0.2 + idx * 0.12,
                  ease: [0.25, 1, 0.5, 1],
                }}
                onMouseEnter={() => setHoveredCardId(study.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={study.gradientStyle}
                className="group relative rounded-[28px] p-6 sm:p-7 text-white shadow-xl hover:shadow-2xl transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden cursor-default select-none border border-white/15"
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: -8,
                        transition: { duration: 0.3, ease: 'easeOut' },
                      }
                }
              >
                <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80 block">
                        {study.badge}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white leading-tight">
                        {study.client}
                      </h3>
                      <p className="text-xs text-white/85 font-light">
                        {study.tagline}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 shrink-0 shadow-inner group-hover:bg-white/25 transition-colors">
                      {renderMonogram(study.monogramType)}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="inline-block px-3 py-1 rounded-xl text-xs font-medium bg-black/25 backdrop-blur-xs text-white border border-white/20">
                      {study.outcome}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-3 items-stretch">
                    <div className="pr-2 space-y-1">
                      <div className="text-lg sm:text-xl font-semibold tracking-tight text-white leading-snug">
                        {study.stat1.value}
                      </div>
                      <p className="text-[11px] text-white/85 font-light leading-snug">
                        {study.stat1.label}
                      </p>
                    </div>

                    <div className="pl-3 border-l border-white/30 space-y-1">
                      <div className="text-lg sm:text-xl font-semibold tracking-tight text-white leading-snug">
                        {study.stat2.value}
                      </div>
                      <p className="text-[11px] text-white/85 font-light leading-snug">
                        {study.stat2.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lower Section: 3:2 Photo Framed by Stacked Translucent "Paper" Layers */}
                <div className="pt-8 relative mt-auto">
                  <div className="relative aspect-[3/2] w-full">
                    <motion.div
                      animate={
                        isHovered && !shouldReduceMotion
                          ? {
                              rotate: -5.5,
                              y: -14,
                              scale: 1.02,
                              opacity: 0.45,
                            }
                          : {
                              rotate: -3,
                              y: -6,
                              scale: 0.98,
                              opacity: 0.3,
                            }
                      }
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md shadow-md pointer-events-none origin-bottom-right"
                    />

                    <motion.div
                      animate={
                        isHovered && !shouldReduceMotion
                          ? {
                              rotate: 5,
                              y: -10,
                              scale: 1.01,
                              opacity: 0.6,
                            }
                          : {
                              rotate: 2.5,
                              y: -3,
                              scale: 0.99,
                              opacity: 0.45,
                            }
                      }
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl bg-white/60 border border-white/70 backdrop-blur-md shadow-sm pointer-events-none origin-bottom-left"
                    />

                    <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/40 bg-black/30">
                      <img
                        src={study.photoUrl}
                        alt={study.photoAlt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-white/95">
                        <span className="font-medium tracking-wide drop-shadow-sm">
                          {study.client}
                        </span>
                        <span className="bg-black/45 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-semibold border border-white/30">
                          Illustrative Image
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
          className="text-center pt-4"
        >
          <button
            type="button"
            onClick={() => {
              if (setIsDemoModalOpen) {
                setIsDemoModalOpen(true);
              } else {
                navigate('/request-demo');
              }
            }}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-black text-xs sm:text-sm font-medium border border-slate-300 hover:border-black shadow-sm hover:shadow transition-all duration-300 cursor-pointer active:scale-98 group"
          >
            <span>Join the pilot / request a walkthrough</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CampusResultsCaseStudies;
