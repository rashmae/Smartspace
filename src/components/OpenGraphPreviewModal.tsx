import React, { useState } from 'react';
import { X, Share2, Copy, CheckCircle2, Globe, Sparkles, Building2, CalendarCheck, ShieldCheck } from 'lucide-react';
import SmartSpaceLogo from './SmartSpaceLogo';

interface OpenGraphPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenGraphPreviewModal: React.FC<OpenGraphPreviewModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  OpenGraph Social Share Card Preview
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  ogimage.gallery Inspired
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official social banner rendered when sharing SmartSpace links on Twitter/X, LinkedIn, and Slack.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Display Container */}
        <div className="p-6 sm:p-10 bg-slate-100 flex items-center justify-center">
          {/* Social Card (1200x630 aspect ratio styled) */}
          <div className="w-full max-w-[620px] aspect-[1.91/1] bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-purple-500/30 flex flex-col justify-between relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top brand */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-black tracking-tight text-white block">SmartSpace</span>
                  <span className="text-[10px] text-purple-300 block -mt-1">Book It, Track It, Use It.</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                Live SaaS Platform
              </span>
            </div>

            {/* Main Title in Card */}
            <div className="space-y-2 relative z-10 my-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                University Spaces, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                  Booked Smarter.
                </span>
              </h2>
              <p className="text-xs text-purple-200/90 max-w-md line-clamp-2">
                Multi-University Facility Booking, Conflict Prevention & Administrative Governance SaaS.
              </p>
            </div>

            {/* Bottom Badges */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 pt-3 border-t border-purple-500/20 relative z-10">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Zero Double Bookings
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Verifiable QR Permits
                </span>
              </div>
              <span className="font-mono text-purple-300">smartspace.ph</span>
            </div>
          </div>
        </div>

        {/* Footer with share & copy button */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Globe className="w-4 h-4 text-purple-600" />
            <span>Target Canonical URL: <strong>https://smartspace.ph/platform</strong></span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Shareable URL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
