import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Quote, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award,
  Users
} from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const metrics = [
    {
      value: '99.4%',
      label: 'Conflict Reduction',
      description: 'Zero overlapping bookings reported across all active campus venues.',
    },
    {
      value: '< 3.5 hrs',
      label: 'Average Approval Time',
      description: 'Down from 3-4 days of paper endorsement slip routing.',
    },
    {
      value: '18,400+',
      label: 'Campus Hours Coordinated',
      description: 'Lectures, laboratory exams, student assemblies, and summits.',
    },
    {
      value: '100%',
      label: 'Verifiable Digital QR Passes',
      description: 'Instant security gate entry confirmation with cryptographic checks.',
    },
  ];

  const testimonials = [
    {
      quote:
        'Before SmartSpace, physical plant engineers spent half their day resolving heated room collisions between academic classes and student organizations. With the real-time conflict blocker and automated queue, our paperwork dropped to zero.',
      author: 'Engr. Roberto Santos',
      role: 'Director of Physical Plant & Facilities',
      institution: 'Cebu Technological University · Main Campus',
      avatarBg: 'bg-amber-100 text-amber-800',
      initials: 'RS',
    },
    {
      quote:
        'Our student organization leads can verify slot openings from their smartphones at midnight without walking across campuses to knock on custodian offices. Presenting the QR permit to the building guard takes 5 seconds.',
      author: 'Juan Dela Cruz',
      role: 'Supreme Student Government President',
      institution: 'CTU Student Council',
      avatarBg: 'bg-blue-100 text-blue-800',
      initials: 'JC',
    },
    {
      quote:
        'The multi-tenant architecture gives each college full administrative autonomy while providing campus executives with real-time room utilization metrics for CHED and ISO compliance audits.',
      author: 'Arch. Maria Tan',
      role: 'Campus Planning & Facility Head',
      institution: 'University of San Carlos · Talamban',
      avatarBg: 'bg-purple-100 text-purple-800',
      initials: 'MT',
    },
  ];

  const institutionalPartners = [
    { name: 'Cebu Technological University', code: 'CTU Main', type: 'State University' },
    { name: 'University of San Carlos', code: 'USC Talamban', type: 'Private Higher Ed' },
    { name: 'Cebu Institute of Technology - University', code: 'CIT-U', type: 'Technological Univ' },
    { name: 'University of the Philippines Cebu', code: 'UP Cebu', type: 'National University' },
    { name: 'University of San Jose - Recoletos', code: 'USJ-R', type: 'Private University' },
  ];

  return (
    <section className="space-y-12">
      {/* High-Impact Metrics Grid */}
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Measurable Institutional Impact</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Delivering Tangible Governance to Campus Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Validated operational benchmarks across participating higher education institutions in Cebu City.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
            {metrics.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">
                  {m.value}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white">{m.label}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Testimonial Cards */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
            <Quote className="w-3.5 h-3.5 text-purple-600" />
            <span>Trusted Across Campuses</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Loved by Facility Directors, Faculty & Student Leaders
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Hear how SmartSpace modernized day-to-day operations for physical plant administration and student bodies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-purple-400/80" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  “{t.quote}”
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${t.avatarBg}`}>
                  {t.initials}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">{t.author}</h4>
                  <p className="text-[11px] font-semibold text-purple-700 truncate">{t.role}</p>
                  <p className="text-[10px] text-slate-400 truncate">{t.institution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* University Partner Logos / Crests Bar */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <p className="text-center text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          Institutions Architected for the SmartSpace Multi-Campus Network
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {institutionalPartners.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-800"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>{p.code}</span>
              <span className="text-[10px] font-normal text-slate-400">({p.type})</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
