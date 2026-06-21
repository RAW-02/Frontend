import { formatValue } from "../../utils/formatValue";

/**
 * MetricCard — compact stat card showing a primary value + a secondary "max" line.
 *
 * Props:
 *   title       {string}  Card label
 *   value       {number}  Primary value (avg/total)
 *   subtitle    {string}  Description under primary value
 *   maxValue    {number}  Secondary value shown in footer (e.g. highest EPSS)
 *   maxLabel    {string}  Footer label (e.g. "Highest")
 *   icon        {string}  Tabler icon class e.g. "ti-shield-check"
 *   iconBg      {string}  Tailwind bg class for icon bg
 *   iconColor   {string}  Tailwind text class for icon
 *   valueColor  {string}  Tailwind text class for the big number (optional)
 *   valueType   {string}  "auto"|"count"|"epss"|"score" — passed to formatValue
 *   loading     {bool}
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  maxValue,
  maxLabel = "Highest",
  icon,
  iconBg = "bg-slate-800",
  iconColor = "text-cyan-400",
  valueColor = "text-white",
  valueType = "auto",
  loading = false,
}) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        border border-slate-800
        bg-slate-900/70
        backdrop-blur-xl
        p-4
        shadow-lg shadow-black/20
        transition-all duration-300
        hover:border-cyan-500/30
        hover:shadow-cyan-500/10
      "
    >
      {/* Top accent line */}
      <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />

      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`
            h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${iconBg}
          `}
        >
          <i className={`ti ${icon} text-sm ${iconColor}`} />
        </div>
        <span className="text-xs font-medium text-slate-400 leading-tight">
          {title}
        </span>
      </div>

      {/* Primary value */}
      {loading ? (
        <div className="h-8 w-24 rounded-lg bg-slate-800 animate-pulse mb-1" />
      ) : (
        <h2 className={`text-3xl font-bold leading-none ${valueColor}`}>
          {formatValue(value, valueType)}
        </h2>
      )}

      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>

      {/* Divider + secondary stat */}
      {(maxValue !== undefined && maxValue !== null) && (
        <>
          <div className="mt-3 border-t border-slate-800" />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-600">{maxLabel}</span>
            {loading ? (
              <div className="h-3 w-12 rounded bg-slate-800 animate-pulse" />
            ) : (
              <span className="text-xs font-semibold text-slate-300">
                {formatValue(maxValue, valueType)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
