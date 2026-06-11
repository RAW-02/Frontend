export default function AiSummaryCard({ cveId, summary }) {
    // If there is no summary text yet, render nothing at all.
    // This keeps the UI clean before any search is run.
    if (!summary) return null;
  
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-4">
  
        {/* Header row: sparkles icon + label + CVE ID */}
        <div className="flex items-center gap-2 mb-3">
          <i className="ti ti-sparkles text-indigo-400 text-base" aria-hidden="true" />
          <span className="text-sm font-semibold text-indigo-400">AI summary</span>
  
          {/* Only show the CVE ID chip if one was passed in */}
          {cveId && (
            <span className="text-xs font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded ml-1">
              {cveId}
            </span>
          )}
        </div>
  
        {/* The summary text — leading-relaxed gives comfortable line spacing */}
        <p className="text-sm text-slate-300 leading-relaxed">
          {summary}
        </p>
  
      </div>
    );
  }