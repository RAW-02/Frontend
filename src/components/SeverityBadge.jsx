export default function SeverityBadge({ severity }) {
  const variants = {
    Critical: {
      icon: "ti-alert-triangle-filled",
      className: "bg-red-500/10 text-red-400 border border-red-500/20",
    },

    High: {
      icon: "ti-flame",
      className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    },

    Medium: {
      icon: "ti-alert-circle",
      className: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
    },

    Low: {
      icon: "ti-shield-check",
      className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    },
  };

  const current = variants[severity] || {
    icon: "ti-help-circle",
    className: "bg-slate-800 text-slate-400 border border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-all duration-300 hover:scale-105
        ${current.className}
      `}
    >
      <i className={`ti ${current.icon} text-sm`} />
      {severity || "Unknown"}
    </span>
  );
}