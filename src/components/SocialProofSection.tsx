import React from 'react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIG } from '../config/business';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  QrCode,
  CalendarCheck,
  ArrowRight,
  MessageSquarePlus,
} from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const { setIsDemoModalOpen } = useApp();

  const capabilities = [
    {
      icon: <CalendarCheck className="w-5 h-5 text-emerald-300" />,
      title: 'Overlap & Conflict Checking',
      description:
        'Checks requested timeslots against pending and approved bookings to help reduce scheduling collisions.',
    },
    {
      icon: <Clock className="w-5 h-5 text-sky-300" />,
      title: 'Tracked Review Queue',
      description:
        'Replaces paper routing slips with structured approval status tracking and decision notes.',
    },
    {
      icon: <QrCode className="w-5 h-5 text-amber-300" />,
      title: 'Digital QR Gate Passes',
      description:
        'Issues scannable digital booking references so venue custodians can check approved entry details.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-purple-300" />,
      title: 'Cebu City Pilot Scope',
      description:
        'Built for colleges and universities in Cebu City evaluating digital facility governance workflows.',
    },
  ];

  return (
    <section className="space-y-8">
      {/* Honest Pilot-Stage Overview Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{BUSINESS_CONFIG.stage}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Built for Transparent Campus Facility Workflows
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {BUSINESS_CONFIG.stageNote} SmartSpace is a student-built prototype with no formal commercial university deployments or endorsements yet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  {cap.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white">{cap.title}</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Honest Join the Pilot / Share Feedback Callout */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 sm:p-9 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0077C8] text-xs font-bold border border-blue-200">
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Early Evaluation &amp; Feedback</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Join the pilot and share campus feedback
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            If your college, student organization, or facility office in Cebu City would like to walk through the prototype and share workflow suggestions, request a guided pilot session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDemoModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs sm:text-sm font-bold shadow-sm transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Join the pilot / share feedback</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
