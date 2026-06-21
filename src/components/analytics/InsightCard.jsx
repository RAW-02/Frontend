
/**
 * InsightCard — rich stat card for key insights.
 *
 * Props:
 *   title        {string}   Card label (e.g. "Top Vendor")
 *   value        {string}   Primary display value (e.g. "cisco")
 *   subtitle     {string}   Description line (e.g. "93 vulnerabilities")
 *   icon         {string}   Tabler icon class (e.g. "ti-building")
 *   color        {string}   Tailwind text color class
 *   accentHex    {string}   Raw hex for gradient/glow (e.g. "#3b82f6")
 *   progress     {number}   0-100, shows a filled bar if provided
 *   progressLabel {string}  Label next to the bar (e.g. "of total score")
 *   badge        {string}   Optional small badge text (e.g. "CRITICAL")
 */
export default function InsightCard({
  title,
  value,
  subtitle,
  icon,
  color      = "text-cyan-400",
  accentHex  = "#06b6d4",
  progress,
  progressLabel,
  badge,
}) {
  return (
    <div
      className="
        relative overflow-hidden flex flex-col
        rounded-2xl border border-slate-800
        bg-slate-900/70 backdrop-blur-xl
        p-5
        shadow-lg shadow-black/20
        transition-all duration-300
        hover:-translate-y-0.5
        cursor-default
        h-full
      "
      style={{
        background: `radial-gradient(ellipse at top left, ${accentHex}0d 0%, transparent 60%), #0f172a`,
      }}
    >
      {/* Colored top accent line */}
      <div
        className="absolute left-0 top-0 h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${accentHex}, ${accentHex}33, transparent)` }}
      />

      {/* Subtle left glow on hover */}
      <div
        className="absolute left-0 top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(180deg, ${accentHex}88, transparent)` }}
      />

      {/* Header row: icon + label + optional badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentHex}1a`, border: `1px solid ${accentHex}30` }}
          >
            <i className={`ti ${icon} text-lg ${color}`} />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">
            {title}
          </p>
        </div>

        {badge && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${accentHex}1a`, color: accentHex }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Primary value */}
      <h3
        className={`text-2xl font-bold leading-none truncate ${color}`}
        title={String(value)}
      >
        {value}
      </h3>

      {/* Subtitle */}
      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
        {subtitle}
      </p>

      {/* Progress bar */}
      {progress != null && (
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-600">
              {progressLabel ?? "of scale"}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: accentHex }}>
              {progress.toFixed(1)}%
            </span>
          </div>
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
  );
}
