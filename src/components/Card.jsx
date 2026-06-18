export default function Card({title, icon, children, className = "",}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:-translate-y-1 ${className}`}
    >
      {/* Top Accent Line */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent opacity-70" />

      {title && (
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
                <i className={`ti ${icon} text-lg`} />
              </div>
            )}

            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              {title}
            </h2>
            
          </div>
        </div>
      )}

      <div className="text-slate-200">
        {children}
      </div>
    </div>
  );
}