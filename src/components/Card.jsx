export default function Card({ title, icon, children, className = "" }) {
  return (
    <div
      className={`bg-slate-800 rounded-xl border border-slate-700 p-5 ${className}`}
    >
      {title && (
        <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
          {/* Only render the icon if one was passed */}
          {icon && <i className={`ti ${icon} text-base`} aria-hidden="true" />}
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}
