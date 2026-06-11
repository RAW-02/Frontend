export default function DetailScoreCard({label, value, icon, color = "text-cyan-400",}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]"
    >
      {/* Top Accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent opacity-80" />

      {/* Glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex flex-col h-full">

        {/* Icon */}
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 transition-all duration-300 group-hover:bg-cyan-500/10 group-hover:scale-110">
          <i className={`ti ${icon} text-xl`} />
        </div>

        {/* Label */}

        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
          {label}
        </p>

        {/* Value */}
        <h2 className={`mt-3 text-4xl font-black tracking-tight ${color}`}>
          {value}
        </h2>
      </div>
    </div>
  );
}