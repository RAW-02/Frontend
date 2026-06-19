export default function InsightCard({
  title,
  value,
  subtitle,
  icon,
  color = "text-cyan-400"
}) {
  return (
    <div
      className="
      rounded-2xl
      border border-slate-800
      bg-slate-900/70
      p-5
      transition-all duration-300
      hover:border-cyan-500/30
      "
    >

      <div className="flex items-center gap-3">

        <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
          <i
            className={`ti ${icon} text-lg ${color}`}
          />
        </div>

        <span className="text-sm font-medium text-slate-400">
          {title}
        </span>

      </div>

      <div className="mt-4">

        <h3 className="text-2xl font-bold text-white">
          {value}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>

      </div>

    </div>
  );
}