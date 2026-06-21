/**
 * DetailScoreCard — score card for the CVE detail page.
 *
 * New props vs original:
 *   accentHex   {string}  Raw hex for accent line + icon glow  (default: "#06b6d4")
 *   iconBgClass {string}  Tailwind bg class for icon square     (default: "bg-slate-800")
 *   progress    {number}  0-100 — renders a mini bar if provided
 *   subtitle    {string}  Small text below the main value
 */
export default function DetailScoreCard({
  label,
  value,
  icon,
  color       = "text-cyan-400",
  accentHex   = "#06b6d4",
  iconBgClass = "bg-slate-800",
  progress,
  subtitle,
}) {
  return (
    <div
      className="
        group relative overflow-hidden
        rounded-2xl border border-slate-800
        bg-slate-900/70 backdrop-blur-xl
        p-5
        transition-all duration-300
        hover:-translate-y-1
        hover:border-slate-700
      "
      style={{
        /* subtle per-card radial tint behind the icon */
        backgroundImage: `radial-gradient(ellipse at top left, ${accentHex}0d 0%, transparent 55%), linear-gradient(135deg, #0f172a, #0a1020)`,
      }}
    >
      {/* Colored top accent line — matches each card's color */}
      <div
        className="absolute left-0 top-0 h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${accentHex}, ${accentHex}44, transparent)` }}
      />

      {/* Hover glow — same color as accent */}
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `${accentHex}22` }}
      />

      <div className="relative z-10 flex flex-col h-full">

        {/* Icon */}
        <div
          className={`
            mb-4 flex h-11 w-11 items-center justify-center rounded-xl
            ${iconBgClass}
            transition-all duration-300
            group-hover:scale-110
          `}
          style={{ border: `1px solid ${accentHex}30` }}
        >
          <i className={`ti ${icon} text-xl ${color}`} />
        </div>

        {/* Label */}
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
          {label}
        </p>

        {/* Value */}
        <h2 className={`mt-3 text-4xl font-black tracking-tight ${color}`}>
          {value}
        </h2>

        {/* Optional subtitle */}
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 leading-snug">{subtitle}</p>
        )}

        {/* Optional mini progress bar */}
        {progress != null && (
          <div className="mt-4">
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background: `linear-gradient(90deg, ${accentHex}66, ${accentHex})`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
