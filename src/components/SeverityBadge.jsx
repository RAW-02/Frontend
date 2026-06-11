export default function SeverityBadge({ severity }) {
    const colors = {
      Critical : "bg-red-950    text-red-400",
      High     : "bg-orange-950 text-orange-400",
      Medium   : "bg-yellow-950 text-yellow-400",
      Low      : "bg-blue-950   text-blue-400",
    };
  
    const cls = colors[severity] ?? "bg-slate-700 text-slate-300";
  
    return (
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${cls}`}>
        {severity ?? "Unknown"}
      </span>
    );
  }