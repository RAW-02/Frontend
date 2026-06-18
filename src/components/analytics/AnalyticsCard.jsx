export default function AnalyticsCard({
  title,
  icon,
  children
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-cyan-900/40
        bg-slate-950/70
        backdrop-blur-sm
        p-5
      "
    >
      <div className="flex items-center gap-3 mb-6">

        <div
          className="
            h-12 w-12
            rounded-xl
            bg-cyan-950
            flex items-center justify-center
          "
        >
          <i className={`ti ${icon} text-cyan-400`} />
        </div>

        <h3 className="uppercase tracking-wider text-slate-200 font-semibold">
          {title}
        </h3>

      </div>

      {children}
    </div>
  );
}