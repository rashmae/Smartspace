import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  QrCode, 
  Copy, 
  ExternalLink, 
  Laptop, 
  Smartphone,
  Sparkles,
  Building2,
  Calendar,
  ArrowRight
} from 'lucide-react';
import SmartSpaceLogo from './SmartSpaceLogo';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  recipient: string;
  badge: string;
  badgeColor: string;
  description: string;
  renderContent: (isMobile: boolean) => React.ReactNode;
}

interface EmailTemplatesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailTemplatesDrawer: React.FC<EmailTemplatesDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTemplateId, setActiveTemplateId] = useState<string>('approved-permit');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const templates: EmailTemplate[] = [
    {
      id: 'approved-permit',
      name: 'Approved Permit & QR Pass',
      subject: '[SmartSpace] Booking Approved: Lecture Room A — Oct 28 (Permit #SS-CTU-9821)',
      recipient: 'juan.delacruz@ctu.edu.ph',
      badge: 'Permit Issuance',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Dispatched immediately when an institutional administrator approves a reservation request.',
      renderContent: (isMobile) => (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-slate-800 font-sans">
          {/* Email Top Header */}
          <div className="bg-purple-900 text-white p-6 sm:p-8 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-purple-300">
                Official Campus Notification
              </span>
              <h2 className="text-xl font-black text-white">Facility Permit Approved</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-800 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {/* Email Body */}
          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
            <p className="text-slate-700 leading-relaxed">
              Dear <strong>Juan Dela Cruz (Supreme Student Council)</strong>,
            </p>
            <p className="text-slate-600 leading-relaxed">
              Your facility reservation request for <strong>Lecture Room A (Academic Hall 1)</strong> at <strong>Cebu Technological University</strong> has been officially reviewed and <strong className="text-emerald-700">APPROVED</strong> by Engr. R. Santos (Physical Plant Administration).
            </p>

            {/* Approved Booking Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Permit Reference</span>
                <span className="font-mono font-bold text-purple-700">#SS-CTU-9821-VERIFIED</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Facility Venue</span>
                  <span className="font-bold text-slate-800">Lecture Room A · Room 201</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Window</span>
                  <span className="font-bold text-slate-800">Oct 28, 2026 · 9:00 AM – 12:00 PM</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose / Event</span>
                  <span className="font-bold text-slate-800">General Student Assembly</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Approved Capacity</span>
                  <span className="font-bold text-slate-800">40 Attendees</span>
                </div>
              </div>
            </div>

            {/* QR Pass Verification Badge */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-24 h-24 bg-white p-2 rounded-xl border border-purple-200 shadow-xs flex items-center justify-center shrink-0">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Campus Gate Entry Pass
                </span>
                <h4 className="font-black text-slate-900 text-sm">Present this QR code to Guard on Duty</h4>
                <p className="text-[11px] text-purple-900/80 leading-relaxed">
                  Campus security and building custodians scan this code to confirm approved entry time and authorized room key turnover.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-4">
              <p>• Please vacate the room promptly by 12:00 PM to allow scheduled custodial sanitization.</p>
              <p>• For urgent assistance, contact Campus Security at local extension 104.</p>
            </div>
          </div>

          {/* Email Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
            <p>SmartSpace SaaS Platform · Unified University Facility Operations</p>
            <p>Automated transactional notice generated for Cebu Technological University.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'conflict-alert',
      name: 'Schedule Conflict Alert',
      subject: '[SmartSpace Action Required] Venue Rescheduling Notice: Innovation Studio (Oct 29)',
      recipient: 'maria.santos@ctu.edu.ph',
      badge: 'Conflict Engine',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Triggered if an institutional executive override or emergency maintenance flags a booked space.',
      renderContent: (isMobile) => (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-slate-800 font-sans">
          <div className="bg-amber-900 text-white p-6 sm:p-8 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-amber-300">
                Automatic Schedule Conflict Alert
              </span>
              <h2 className="text-xl font-black text-white">Alternative Venue Available</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
            <p className="text-slate-700 leading-relaxed">
              Dear <strong>Prof. Maria Santos</strong>,
            </p>
            <p className="text-slate-600 leading-relaxed">
              An institutional university event with higher scheduling priority has been booked for <strong>Innovation Studio</strong> on <strong>Oct 29 at 02:00 PM</strong>.
            </p>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-950">
              <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>SmartSpace Automated Alternative Suggestion</span>
              </h4>
              <p className="text-amber-900/90 leading-relaxed">
                We have pre-reserved <strong>Technopreneurship Hub (Level 3)</strong> which has identical capacity (70 seats) and matching AV equipment for your timeslot.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button className="flex-1 py-3 px-4 rounded-xl bg-purple-700 text-white font-bold text-xs text-center shadow-xs cursor-pointer">
                Accept Alternative Space & Reissue Permit
              </button>
              <button className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center hover:bg-slate-200 cursor-pointer">
                Select Different Time Window
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            SmartSpace Conflict Resolution Engine · Cebu Technological University
          </div>
        </div>
      ),
    },
    {
      id: 'pending-ack',
      name: 'Booking Request Acknowledged',
      subject: '[SmartSpace] Request Received: Computer Laboratory 1 (Tracking #SS-REQ-4412)',
      recipient: 'kenneth.tan@ctu.edu.ph',
      badge: 'Request Pipeline',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Sent instantaneously when a requester submits a facility reservation.',
      renderContent: (isMobile) => (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-slate-800 font-sans">
          <div className="bg-indigo-950 text-white p-6 sm:p-8 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-indigo-300">
                Application Received
              </span>
              <h2 className="text-xl font-black text-white">Booking in Administrative Queue</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-300" />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
            <p className="text-slate-700 leading-relaxed">
              Dear <strong>Kenneth Tan (CS Department)</strong>,
            </p>
            <p className="text-slate-600 leading-relaxed">
              Your request for <strong>Computer Laboratory 1</strong> on <strong>Oct 30, 2026 (01:00 PM – 04:00 PM)</strong> has been logged and queued for administrative review.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Reviewer:</span>
                <span className="font-semibold text-slate-800">Engr. R. Santos (Physical Plant Admin)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Average Review Turnaround:</span>
                <span className="font-semibold text-slate-800">&lt; 3.5 Business Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Tracking ID:</span>
                <span className="font-mono font-bold text-indigo-600">#SS-REQ-4412</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              You will receive an instant email and SMS notification the moment an administrative determination is made.
            </p>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            SmartSpace Notifications · Automated University Facility Tracking
          </div>
        </div>
      ),
    },
  ];

  const currentTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  const handleCopySubject = () => {
    navigator.clipboard.writeText(currentTemplate.subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-slate-100 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Top Header */}
        <div className="bg-white p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Transactional Email Suite
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  reallygoodemails Inspired
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated university notices with verified branding, QR permits, and conflict notifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile / Desktop Preview Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setIsMobilePreview(false)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  !isMobilePreview ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="Desktop Layout Preview"
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMobilePreview(true)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isMobilePreview ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="Mobile Screen Preview"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selector Tabs */}
        <div className="bg-slate-50 p-2 sm:px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setActiveTemplateId(tpl.id)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTemplateId === tpl.id
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tpl.name}
            </button>
          ))}
        </div>

        {/* Subject & Meta bar */}
        <div className="bg-white px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider shrink-0">Subject:</span>
            <span className="font-semibold text-slate-800 truncate">{currentTemplate.subject}</span>
          </div>
          <button
            onClick={handleCopySubject}
            className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 hover:text-purple-900 shrink-0 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Subject Copied!' : 'Copy Subject Line'}</span>
          </button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center items-start">
          <div
            className={`transition-all duration-300 w-full ${
              isMobilePreview ? 'max-w-[380px]' : 'max-w-2xl'
            }`}
          >
            {currentTemplate.renderContent(isMobilePreview)}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-white p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Templates dynamically pull university logo, colors, and official signatories per subscribing institution.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
