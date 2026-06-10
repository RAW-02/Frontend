export default function Card({ title, children, className = "" }) {
    return (
      <div className={`bg-slate-800 rounded-xl border border-slate-700 p-5 ${className}`}>
  
        {title && (
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            {title}
          </h2>
        )}
  
        {children}
      </div>
    );
  }