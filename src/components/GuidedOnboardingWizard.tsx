import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import {
  Users,
  GraduationCap,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  Compass,
  Trophy,
  Laptop,
  Layers,
  X,
} from 'lucide-react';

interface GuidedOnboardingWizardProps {
  isModal?: boolean;
  onClose?: () => void;
}

type RoleChoice = 'student_org' | 'faculty' | 'university_admin';
type SectorChoice = 'ctu-main' | 'usc-main' | 'public-suc' | 'new-institution';
type GoalChoice = 'assemblies' | 'athletics' | 'labs' | 'governance';

export const GuidedOnboardingWizard: React.FC<GuidedOnboardingWizardProps> = ({
  isModal = false,
  onClose,
}) => {
  const { navigate } = useRouter();
  const { setInstitutionId, allInstitutions } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [roleChoice, setRoleChoice] = useState<RoleChoice | null>(null);
  const [sectorChoice, setSectorChoice] = useState<SectorChoice | null>(null);
  const [goalChoice, setGoalChoice] = useState<GoalChoice | null>(null);

  const progressPct = (step / 4) * 100;

  const canProceed =
    (step === 1 && roleChoice !== null) ||
    (step === 2 && sectorChoice !== null) ||
    (step === 3 && goalChoice !== null) ||
    step === 4;

  const handleNext = () => {
    if (!canProceed) return;
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  };

  const getRecommendedDestination = () => {
    if (roleChoice === 'university_admin') {
      if (sectorChoice === 'new-institution') {
        return {
          path: '/university/register',
          ctaLabel: 'Register Your University Campus',
          summary: 'Provision your Physical Plant workspace with custom multi-tier endorsements and 12-hour conflict locks.',
        };
      }
      return {
        path: '/university/login',
        ctaLabel: 'Enter University Admin Console',
        summary: 'Sign in directly to inspect pending facility requests, assign space custodians, and view utilization logs.',
      };
    }

    if (sectorChoice === 'new-institution') {
      return {
        path: '/request-demo',
        ctaLabel: 'Request Campus Onboarding',
        summary: 'Invite your university facilities team to configure a guided pilot campus catalog.',
      };
    }

    return {
      path: '/user/register',
      ctaLabel: 'Create Campus Requester Account',
      summary: 'Browse sample auditoriums, arenas, and computing labs with availability checks and digital QR gate passes.',
    };
  };

  const handleLaunch = () => {
    if (sectorChoice === 'ctu-main' || sectorChoice === 'usc-main') {
      const match = allInstitutions.find((i) =>
        sectorChoice === 'ctu-main' ? i.type === 'Public' : i.type === 'Private'
      );
      if (match) setInstitutionId(match.id);
    }
    const dest = getRecommendedDestination();
    if (onClose) onClose();
    navigate(dest.path);
  };

  const recommendation = getRecommendedDestination();

  return (
    <div
      className={`bg-white ${
        isModal
          ? 'rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden'
          : 'rounded-2xl border border-slate-200 shadow-xs w-full overflow-hidden'
      }`}
    >
      {/* Duolingo-inspired Top Progress Rail */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Previous onboarding step"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[11px] font-mono font-semibold text-slate-400 tabular-nums shrink-0">
            01
          </span>
        )}

        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '25%' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="h-full bg-gradient-to-r from-[#0077C8] to-[#8CC63F] rounded-full"
          />
        </div>

        <span className="text-[11px] font-mono font-bold text-slate-600 tabular-nums whitespace-nowrap shrink-0">
          Step {step} / 4
        </span>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close setup wizard"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Step Body with Framer Smooth Slide */}
      <div className="p-6 sm:p-8 min-h-[340px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0077C8]">
                  Guided Campus Setup · Step 1
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                  How will you use SmartSpace?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Pick your primary role so we configure the exact booking or governance workspace for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'student_org' as RoleChoice,
                    title: 'Student Org Officer',
                    desc: 'Reserve campus venues and receive QR gate passes.',
                    icon: <Users className="w-5 h-5 text-[#0077C8]" />,
                  },
                  {
                    id: 'faculty' as RoleChoice,
                    title: 'Faculty / Dept Chair',
                    desc: 'Book lecture halls, labs, and endorse student events.',
                    icon: <GraduationCap className="w-5 h-5 text-amber-600" />,
                  },
                  {
                    id: 'university_admin' as RoleChoice,
                    title: 'Facility Administrator',
                    desc: 'Approve requests, lock schedules, and audit metrics.',
                    icon: <Building2 className="w-5 h-5 text-emerald-700" />,
                  },
                ].map((opt) => {
                  const selected = roleChoice === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRoleChoice(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-colors duration-150 cursor-pointer flex flex-col justify-between space-y-3 relative ${
                        selected
                          ? 'border-[#0077C8] bg-blue-50/50 ring-2 ring-[#0077C8]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                          {opt.icon}
                        </div>
                        {selected && (
                          <span className="w-5 h-5 rounded-full bg-[#0077C8] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <strong className="text-sm font-bold text-slate-950 block">{opt.title}</strong>
                        <span className="text-xs text-slate-500 leading-snug block">{opt.desc}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0077C8]">
                  Guided Campus Setup · Step 2
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                  Select your campus network
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Choose a participating institution or register a new higher education campus.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'ctu-main' as SectorChoice,
                    title: 'Public State University (Sample Workspace)',
                    meta: 'State University / College · Illustrative Sandbox',
                  },
                  {
                    id: 'usc-main' as SectorChoice,
                    title: 'Private Higher Education (Sample Workspace)',
                    meta: 'Private College or University · Illustrative Sandbox',
                  },
                  {
                    id: 'public-suc' as SectorChoice,
                    title: 'Cross-Campus Discovery Sandbox',
                    meta: 'Explore multi-institution workflow rules',
                  },
                  {
                    id: 'new-institution' as SectorChoice,
                    title: 'Onboard a New Institution',
                    meta: 'Schedule a guided pilot workspace setup',
                  },
                ].map((opt) => {
                  const selected = sectorChoice === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setSectorChoice(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-colors duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                        selected
                          ? 'border-[#0077C8] bg-blue-50/50 ring-2 ring-[#0077C8]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <strong className="text-sm font-bold text-slate-950 block">{opt.title}</strong>
                        <span className="text-xs text-slate-500 block">{opt.meta}</span>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          selected
                            ? 'bg-[#0077C8] border-[#0077C8] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0077C8]">
                  Guided Campus Setup · Step 3
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                  Which spaces matter most today?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  We will surface relevant capacity specs, clearance steps, and booking rules first.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'assemblies' as GoalChoice,
                    title: 'Auditoriums & Symposium Halls',
                    meta: '150–800 seats · PA rigs & dean endorsements',
                    icon: <Compass className="w-4 h-4 text-[#0077C8]" />,
                  },
                  {
                    id: 'athletics' as GoalChoice,
                    title: 'Gymnasiums & Sports Courts',
                    meta: 'Varsity courts · floodlights & safety waivers',
                    icon: <Trophy className="w-4 h-4 text-[#EE2726]" />,
                  },
                  {
                    id: 'labs' as GoalChoice,
                    title: 'Computing & STEM Laboratories',
                    meta: 'Workstations · custodian check-in & power lock',
                    icon: <Laptop className="w-4 h-4 text-amber-600" />,
                  },
                  {
                    id: 'governance' as GoalChoice,
                    title: 'Full Multi-Campus Governance',
                    meta: 'Audit trails, analytics & QR gate security',
                    icon: <Layers className="w-4 h-4 text-emerald-700" />,
                  },
                ].map((opt) => {
                  const selected = goalChoice === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setGoalChoice(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-colors duration-150 cursor-pointer flex items-start gap-3 ${
                        selected
                          ? 'border-[#0077C8] bg-blue-50/50 ring-2 ring-[#0077C8]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        {opt.icon}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <strong className="text-sm font-bold text-slate-950 block">{opt.title}</strong>
                        <span className="text-xs text-slate-500 block">{opt.meta}</span>
                      </div>
                      {selected && (
                        <span className="w-5 h-5 rounded-full bg-[#0077C8] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Setup Complete · Workspace Tailored
                  </p>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    Your SmartSpace Path is Ready
                  </h3>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-slate-200 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-xs border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Role</span>
                    <strong className="text-slate-900">
                      {roleChoice === 'university_admin'
                        ? 'Facility Admin'
                        : roleChoice === 'faculty'
                        ? 'Faculty / Chair'
                        : 'Student Org'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus</span>
                    <strong className="text-slate-900">
                      {sectorChoice === 'ctu-main'
                        ? 'Public Sector (Sample)'
                        : sectorChoice === 'usc-main'
                        ? 'Private Sector (Sample)'
                        : sectorChoice === 'new-institution'
                        ? 'New Onboarding'
                        : 'Sample Network'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Focus</span>
                    <strong className="text-slate-900 capitalize">{goalChoice || 'All Spaces'}</strong>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {recommendation.summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Action Bar */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          {step < 4 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  navigate('/access');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Skip to Portal Gateway
              </button>

              <motion.button
                type="button"
                whileTap={canProceed ? { scale: 0.98 } : undefined}
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors duration-150 ${
                  canProceed
                    ? 'bg-[#0077C8] hover:bg-[#0060a3] text-white shadow-xs cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Adjust Choices
              </button>

              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunch}
                className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{recommendation.ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
