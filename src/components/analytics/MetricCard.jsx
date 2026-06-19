export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor
}) {
  return (
    <div
      className="
      relative overflow-hidden
      rounded-2xl
      border border-slate-800
      bg-slate-900/70
      backdrop-blur-xl
      p-6
      shadow-lg shadow-black/20
      transition-all duration-300
      hover:border-cyan-500/30
      hover:shadow-cyan-500/10
      "
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />

      <div className="flex items-center gap-3">

        <div
          className={`
          h-10 w-10
          rounded-lg
          flex items-center justify-center
          ${iconBg}
          `}
        >
          <i
            className={`ti ${icon} text-lg ${iconColor}`}
          />
        </div>

        <span className="text-sm font-medium text-slate-400">
          {title}
        </span>

      </div>

      <div className="mt-5">

        <h2 className="text-4xl font-bold text-white">
          {value}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>

      </div>

    </div>
  );
}