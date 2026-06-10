export default function StatCard({ label, value, icon, color = "text-slate-100", loading = false }) {
    return (
      
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
  
        <div className="flex items-center gap-2 mb-3">
          <i className={`ti ${icon} text-lg text-slate-400`} aria-hidden="true" />
  
          <span className="text-sm text-slate-400">{label}</span>
        </div>
  
        {loading ? (
          <div className="h-8 w-24 bg-slate-700 rounded animate-pulse" />
        ) : (
          <p className={`text-3xl font-bold ${color}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
  
      </div>
    );
  }