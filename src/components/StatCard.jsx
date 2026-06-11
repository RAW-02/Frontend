export default function StatCard({
  label, value, icon, color = "text-cyan-400", loading = false,
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(34,211,238,0.08)]"
    >
      {/* Top Accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent opacity-80" />

      {/* Glow */}
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            {label}
          </p>

          {loading ? (<div className="mt-4 h-9 w-28 rounded-lg bg-slate-800 animate-pulse" />
          ) : (
            <h2 className={`mt-3 text-4xl font-bold tracking-tight ${color}`}>
              {typeof value === "number"
                ? value.toLocaleString()
                : value}
            </h2>
          )}

        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400 transition-all duration-300 group-hover:bg-cyan-500/10 group-hover:scale-110">
          <i className={`ti ${icon} text-2xl`} />
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 mt-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-slate-500">
          Live intelligence data
        </span>
      </div>
    </div>
  );
}