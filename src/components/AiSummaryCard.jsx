export default function AiSummaryCard({ cveId, summary }) {
  // Don't render if no summary exists
  if (!summary) return null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 mt-6 shadow-lg shadow-black/20 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10">
      {/* Top Accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-transparent" />

      {/* Glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <i className="ti ti-sparkles text-lg" aria-hidden="true"/>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">AI Threat Summary</h3>
            <p className="text-xs text-slate-500"> Generated intelligence overview </p>
          </div>
        </div>

        {cveId && (
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
            {cveId}
          </span>
        )}

      </div>

      {/* Divider */}
      <div className="mb-5 h-px bg-slate-800" />

      {/* Summary */}
      <p className="relative z-10 text-[15px] leading-7 text-slate-300">
        {summary}
      </p>

    </div>
  );
}