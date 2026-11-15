import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building, 
  AlertCircle, 
  Info,
  Calendar,
  Users
} from 'lucide-react';

export const UtilizationReportsView: React.FC = () => {
  const { institutionBookings, institutionFacilities, currentInstitution } = useApp();

  // Dynamic calculations from actual records
  const totalRequests = institutionBookings.length;
  const pendingRequests = institutionBookings.filter((b) => b.status === 'pending').length;
  const approvedReservations = institutionBookings.filter((b) => b.status === 'approved').length;
  const rejectedRequests = institutionBookings.filter((b) => b.status === 'rejected').length;

  const approvalRate = totalRequests > 0 
    ? Math.round((approvedReservations / totalRequests) * 100) 
    : 0;

  // Breakdown by facility
  const facilityStats = useMemo(() => {
    return institutionFacilities.map((fac) => {
      const bookingsForFac = institutionBookings.filter((b) => b.facilityId === fac.id);
      const approved = bookingsForFac.filter((b) => b.status === 'approved').length;
      const pending = bookingsForFac.filter((b) => b.status === 'pending').length;
      const rejected = bookingsForFac.filter((b) => b.status === 'rejected').length;
      const totalAttendees = bookingsForFac.reduce((sum, b) => sum + (b.attendees || 0), 0);

      return {
        id: fac.id,
        name: fac.name,
        type: fac.type,
        capacity: fac.capacity,
        totalRequests: bookingsForFac.length,
        approved,
        pending,
        rejected,
        totalAttendees,
      };
    }).sort((a, b) => b.totalRequests - a.totalRequests);
  }, [institutionFacilities, institutionBookings]);

  // Breakdown by date (upcoming activity)
  const dateStats = useMemo(() => {
    const map = new Map<string, { total: number; approved: number; pending: number }>();
    for (const b of institutionBookings) {
      const cur = map.get(b.date) || { total: 0, approved: 0, pending: 0 };
      cur.total += 1;
      if (b.status === 'approved') cur.approved += 1;
      if (b.status === 'pending') cur.pending += 1;
      map.set(b.date, cur);
    }

    return Array.from(map.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [institutionBookings]);

  // Max value for bar scaling
  const maxFacilityRequests = Math.max(...facilityStats.map((f) => f.totalRequests), 1);

  return (
    <div className="space-y-6">
      {/* Notion Workspace Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-[#0077C8]">Institutional Analytics</span>
            <span aria-hidden="true">·</span>
            <span>{currentInstitution.shortName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Facility Utilization Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Dynamic overview of reservation demand, venue popularity, and clearance metrics computed from active session records.
          </p>
        </div>

        <div className="text-xs text-slate-500 border-l border-slate-200 pl-4 max-w-xs">
          <span className="font-semibold text-slate-800 block">Live Session Dataset</span>
          Updates automatically when requests are submitted, approved, or rejected.
        </div>
      </div>

      {/* Linear Hairline KPI Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-5 bg-slate-200 gap-px rounded-xl overflow-hidden border border-slate-200">
        <div className="bg-white p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Requests</span>
            <BarChart3 className="w-4 h-4 text-[#0077C8]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono tabular-nums">{totalRequests}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Logged submissions</div>
        </div>

        <div className="bg-white p-4">
          <div className="flex items-center justify-between text-amber-700 text-xs mb-1">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono tabular-nums">{pendingRequests}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting clearance</div>
        </div>

        <div className="bg-white p-4">
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
            <span>Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">{approvedReservations}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Permits issued</div>
        </div>

        <div className="bg-white p-4">
          <div className="flex items-center justify-between text-red-700 text-xs mb-1">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-700 font-mono tabular-nums">{rejectedRequests}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">With recorded reason</div>
        </div>

        <div className="bg-white p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#0077C8] text-xs mb-1">
            <span>Approval Rate</span>
            <TrendingUp className="w-4 h-4 text-[#0077C8]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0077C8] font-mono tabular-nums">{approvalRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Completed reviews</div>
        </div>
      </div>

      {/* Primary Analytics Section: Reservations by Facility */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Requested Facilities Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Facility Demand & Booking Frequency
              </h3>
              <p className="text-[11px] text-slate-500">
                Number of reservation requests received per facility in {currentInstitution.shortName}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Live Demo Chart
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {facilityStats.map((f) => {
              const pct = Math.round((f.totalRequests / maxFacilityRequests) * 100);
              return (
                <div key={f.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[280px]">
                      {f.name}
                    </span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      <strong>{f.totalRequests}</strong> reqs ({f.approved} approved)
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-5 bg-slate-100 rounded-md overflow-hidden flex">
                    {/* Approved chunk */}
                    <div
                      style={{ width: `${(f.approved / maxFacilityRequests) * 100}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`${f.approved} Approved`}
                    />
                    {/* Pending chunk */}
                    <div
                      style={{ width: `${(f.pending / maxFacilityRequests) * 100}%` }}
                      className="bg-amber-400 transition-all duration-300"
                      title={`${f.pending} Pending`}
                    />
                    {/* Rejected chunk */}
                    <div
                      style={{ width: `${(f.rejected / maxFacilityRequests) * 100}%` }}
                      className="bg-red-400 transition-all duration-300"
                      title={`${f.rejected} Rejected`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Approved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Pending Review
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-400"></span> Rejected
            </span>
          </div>
        </div>

        {/* Breakdown by Date / Scheduled Timeline */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Upcoming Reservations by Date
            </h3>
            <p className="text-[11px] text-slate-500">
              Distribution of facility usage across reserved calendar dates
            </p>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {dateStats.map((item) => (
              <div
                key={item.date}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">{item.date}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {item.total} total scheduled request(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  {item.approved > 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      {item.approved} Confirmed
                    </span>
                  )}
                  {item.pending > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                      {item.pending} Pending
                    </span>
                  )}
                </div>
              </div>
            ))}

            {dateStats.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No scheduled dates recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Honest Scientific & Business Evaluation Scope Guidelines */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Prototype Metric Definitions & Operational Scope</span>
        </div>
        <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed text-[11px]">
          <li>
            <strong>Proxy Metric Disclosure:</strong> Booking counts and permit logs represent reservation demand and scheduling attempts. They serve as a proxy for facility utilization and do not verify physical presence, actual door access, or sensor-measured room occupancy.
          </li>
          <li>
            <strong>No Unsubstantiated Claims:</strong> This prototype does not claim quantified administrative time savings, reduced scheduling friction, or eliminated scheduling conflicts prior to conducting and completing empirical validation tests with real university users.
          </li>
          <li>
            <strong>Demonstration Scope:</strong> All figures above are calculated dynamically from local sample records within the current prototype browser session.
          </li>
        </ul>
      </div>
    </div>
  );
};
