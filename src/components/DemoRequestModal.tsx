import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  X, 
  Calendar, 
  Mail, 
  User, 
  Phone, 
  Briefcase, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const DemoRequestModal: React.FC = () => {
  const { isDemoModalOpen, setIsDemoModalOpen, submitDemoRequest } = useApp();

  const [institutionName, setInstitutionName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [designation, setDesignation] = useState('Vice President for Administration');
  const [estimatedFacilities, setEstimatedFacilities] = useState('15-30 Spaces');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isDemoModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!institutionName.trim()) {
      setErrorMsg('Please enter your university or college name.');
      return;
    }
    if (!contactName.trim()) {
      setErrorMsg('Please provide the official contact person name.');
      return;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@') || !contactEmail.includes('.')) {
      setErrorMsg('Please provide a valid official institutional email address.');
      return;
    }
    if (!contactNumber.trim()) {
      setErrorMsg('Please provide a contact phone or telephone number.');
      return;
    }

    const res = submitDemoRequest({
      institutionName,
      contactName,
      contactEmail,
      contactNumber,
      designation,
      estimatedFacilities,
      preferredDate,
      message,
    });

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.error || 'Failed to submit demo request.');
    }
  };

  const handleClose = () => {
    setIsDemoModalOpen(false);
    setSubmitted(false);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-purple-200 text-xs font-semibold tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4 text-purple-300" />
            <span>Institutional Consultation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Request an Institutional Demo
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-md">
            Schedule a personalized walkthrough of SmartSpace for your university’s administration and facilities division.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Demo Request Received
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <strong>{contactName}</strong>. Our higher education onboarding team will review your inquiry for <strong>{institutionName}</strong> and send an invitation to <strong>{contactEmail}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-left text-xs text-purple-900 space-y-1.5 max-w-md mx-auto">
                <div className="font-bold flex items-center gap-1.5 text-purple-950">
                  <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Important Governance Policy</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Demo requests introduce your leadership to the platform. They do not automatically grant administrator access or create an active university workspace. Formal onboarding requires administrative review.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Done & Return to SmartSpace
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Notice Banner */}
              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Notice:</strong> This form requests a personalized consultation. It will not automatically register or activate a university account without formal platform authorization.
                </div>
              </div>

              {/* University Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  University / College Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Southern Philippines Foundation"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Contact Person & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Maria Clara Santos"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Designation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. VP for Administration / Dean"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Institutional Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="name@university.edu.ph"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="+63 (32) 234-5678"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Estimated Facilities & Preferred Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Campus Spaces
                  </label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={estimatedFacilities}
                      onChange={(e) => setEstimatedFacilities(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white cursor-pointer"
                    >
                      <option value="5-15 Spaces">5 - 15 Spaces (Single Campus)</option>
                      <option value="15-30 Spaces">15 - 30 Spaces (Standard College)</option>
                      <option value="30-75 Spaces">30 - 75 Spaces (Major University)</option>
                      <option value="75+ Spaces Multi-Campus">75+ Spaces (Multi-Campus System)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Demo Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Space Management Objectives / Key Needs
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your campus facility reservation workflows or current challenges..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>Submit Institutional Demo Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
