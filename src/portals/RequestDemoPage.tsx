import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { 
  Building2, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Phone, 
  User, 
  Briefcase,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const RequestDemoPage: React.FC = () => {
  const { navigate } = useRouter();
  const { submitDemoRequest } = useApp();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('Public University');
  const [position, setPosition] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [message, setMessage] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!contactName.trim() || !contactEmail.trim() || !institutionName.trim()) {
      setErrorMsg('Please provide your name, official institutional email, and university name.');
      return;
    }

    if (!contactEmail.includes('@') || !contactEmail.includes('.')) {
      setErrorMsg('Please enter a valid institutional email address (e.g., name@university.edu.ph).');
      return;
    }

    const res = submitDemoRequest({
      institutionName,
      contactName,
      contactEmail,
      contactNumber: contactNumber || '+63 (32) 000-0000',
      designation: position || 'Campus Administrator',
      estimatedFacilities: `${institutionType} Campus`,
      message: message.trim() || 'Institutional inquiry submitted via SmartSpace /request-demo form.',
    });

    if (res.success) {
      setIsSubmitted(true);
    } else {
      setErrorMsg(res.error || 'Failed to submit demo request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-95 transition-opacity"
            title="Return to SmartSpace Homepage"
          >
            <SmartSpaceLogo size={34} showTagline={true} />
          </button>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-purple-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
            <button
              onClick={() => navigate('/access')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {isSubmitted ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 max-w-xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Institutional Request Logged
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Demo Request Received
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Thank you, <strong>{contactName}</strong>. Our enterprise solutions team has received your inquiry for <strong>{institutionName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Next Onboarding Steps:</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600 pl-5 list-disc">
                <li>We will dispatch a calendar invitation to <strong>{contactEmail}</strong> within 1 business day.</li>
                <li>No account was created; this inquiry does not activate a paid subscription or contractual lock-in.</li>
                <li>We will prepare a customized demonstration tailored to {institutionName}'s specific campus facilities and approval hierarchy.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Return to SmartSpace Homepage
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Context & Value */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Institutional Demonstration
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  See SmartSpace in Action for Your University
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Schedule a focused product walk-through with our solution architects. We will show you how universities centralize reservations, prevent double bookings, and eliminate paper custodian logs.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>No Obligation & Zero Setup Fee</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Requesting an institutional demo does not create an account or commit your university to a purchase.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Multi-Campus Architecture</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Designed for higher education institutions of all sizes, from single colleges to large multi-campus university systems.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>30-Minute Tailored Session</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    We demonstrate workflows relevant to your role: approval routing, QR gate permits, and utilization reporting.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Request an Institutional Demo
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete this form and an institutional coordinator will reach out to confirm your preferred session time.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Santos"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institutional Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. facilities@university.edu.ph"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institution / University Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. University of Science & Technology"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institution Type
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Public University">Public / State University</option>
                      <option value="Private University">Private Higher Education Institution</option>
                      <option value="College">College / Institute</option>
                      <option value="Higher Education System">Multi-Campus University System</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Position or Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Director of Physical Plant, Dean, Registrar"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone / Telephone
                    </label>
                    <input
                      type="tel"
                      placeholder="+63 (32) 123-4567"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facility Management Needs / Questions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your campus facility challenges (e.g. number of buildings, double booking issues, approval routing)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Institutional Demo Request</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Submitting this form does not create an institutional account or require credit card details.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
