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
      "
      >
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />

        <div className="flex justify-between items-start">

          {/* LEFT SIDE */}
          <div className="flex-1">

            {/* ICON + TITLE */}
            
            <div className="flex items-center gap-3">

              <div
                className={`
                  h-10
                  w-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  ${iconBg}
                `}
              >
                <i
                  className={`ti ${icon} text-lg ${iconColor}`}
                />
              </div>

              <p className="text-xs uppercase tracking-wider text-slate-400">
                {title}
              </p>

            </div>

            {/* VALUE */}
            <h2 className="mt-4 text-4xl font-bold text-white">
              {value}
            </h2>

            {/* SUBTITLE */}
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>

          </div>

        </div>
    </div>
  );
}