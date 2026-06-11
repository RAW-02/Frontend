export default function DetailScoreCard({ label, value, icon, color = "text-slate-100" }) {
    return (
     <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
  
        <div className="flex items-center gap-1.5 mb-2">
          <i className={`ti ${icon} text-slate-400 text-sm`} aria-hidden="true" />
          <span className="text-xs text-slate-400">{label}</span>
        </div>
  
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
  
      </div>
    );
  }