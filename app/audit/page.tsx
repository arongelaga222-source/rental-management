import { getAuditLogs } from '@/lib/actions/reports';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const result = await getAuditLogs();
  const logs = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Audit Log</h1>
          <p className="text-xs text-slate-500">Immutable record of system operations, customer modifications, and financial actions</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <ShieldCheckIcon className="h-4 w-4" />
          Audit Trail Active
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Logged Event</span>
          <span>Timestamp & Performer</span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No audit logs recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              let parsedDetails = null;
              try {
                if (log.details) {
                  parsedDetails = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                }
              } catch {
                parsedDetails = log.details;
              }

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <DocumentTextIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px]">
                          ID: #{log.id}
                        </span>
                      </div>
                      {parsedDetails && (
                        <div className="mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-600 max-w-xl break-all">
                          {JSON.stringify(parsedDetails, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="flex items-center sm:justify-end gap-1.5 text-slate-700 font-semibold">
                      <UserCircleIcon className="h-4 w-4 text-slate-400" />
                      {log.performedBy.name} ({log.performedBy.role})
                    </div>
                    <div className="flex items-center sm:justify-end gap-1 text-slate-400 text-[11px] mt-0.5">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
