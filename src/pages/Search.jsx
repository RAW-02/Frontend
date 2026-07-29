import { useState } from "react";
import { useNavigate } from "react-router";
import SeverityBadge from "../components/SeverityBadge";
import AiSummaryCard from "../components/AiSummaryCard";
import { searchVulnerabilities } from "../services/searchService";

// ── HELPERS ───────────────────────────────────────────────────

function BooleanBadge({ value, trueLabel = "Yes", falseLabel = "No" }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-950 text-green-400 border border-green-800/60">
      <i className="ti ti-check text-xs" aria-hidden="true" />
      {trueLabel}
    </span>
  ) : (
    <span className="text-slate-600 text-xs">—</span>
  );
}

/** Color-codes the threat score: ≥80 red, ≥60 orange, ≥40 yellow, else slate */
function ThreatScore({ value }) {
  if (value == null) return <span className="text-slate-600 text-xs">N/A</span>;
  const n = Number(value);
  const color =
    n >= 80 ? "text-red-400" :
    n >= 60 ? "text-orange-400" :
    n >= 40 ? "text-yellow-400" :
              "text-slate-300";
  return (
    <span className={`font-mono text-xs font-semibold ${color}`}>
      {n.toFixed(1)}
    </span>
  );
}

// ── MOCK DATA ─────────────────────────────────────────────────
const MOCK_RESULTS = [
  { cve_id: "CVE-2021-44228", severity: "Critical", threat_score: 9.8,  epss: 0.975, kev_status: true,  poc: true  },
  { cve_id: "CVE-2021-45046", severity: "Critical", threat_score: 9.0,  epss: 0.941, kev_status: true,  poc: true  },
  { cve_id: "CVE-2021-45105", severity: "High",     threat_score: 7.5,  epss: 0.612, kev_status: false, poc: true  },
  { cve_id: "CVE-2021-44832", severity: "Medium",   threat_score: 6.6,  epss: 0.388, kev_status: false, poc: false },
];

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function Search() {
  const [query,      setQuery]      = useState("");
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [hasSearched,setHasSearched]= useState(false);
  const [searchedQ,  setSearchedQ]  = useState("");   // query used for last search

  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);
    setSearchedQ(query.trim());

    try {
      const response = await searchVulnerabilities(query);
      setResults(response.data.results ?? response.data ?? []);
    } catch (err) {
      console.warn("API unavailable — using mock data:", err.message);
      setResults(MOCK_RESULTS);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  const handleRowClick = (cveId) => navigate(`/vulnerability/${cveId}`);
  const topSummary = results.find((r) => r.ai_summary);

  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Search</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search by CVE ID, keyword, vendor, or product name
        </p>
      </div>

      {/* ── SEARCH BAR ─────────────────────────────────────── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <i
            className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. apache, CVE-2021-44228, cisco, CWE-20…"
            className="
              w-full bg-slate-800/80 border border-slate-700 rounded-xl
              pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500
              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              transition-colors
            "
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="
            flex items-center gap-2 bg-blue-600 hover:bg-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            text-white text-sm font-medium
            px-5 py-3 rounded-xl transition-colors duration-150 whitespace-nowrap
          "
        >
          <i
            className={`ti ${loading ? "ti-loader-2 animate-spin" : "ti-search"} text-base`}
            aria-hidden="true"
          />
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* ── ERROR ──────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
          <i className="ti ti-alert-circle text-base" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* ── RESULTS ────────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="space-y-3">

          {/* Result count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="text-slate-300 font-semibold">{results.length.toLocaleString()}</span>
              {" "}result{results.length !== 1 ? "s" : ""} for{" "}
              <span className="text-blue-400">"{searchedQ}"</span>
            </p>
            <p className="text-xs text-slate-600">Click a row to view details</p>
          </div>

          {/*
            overflow-x-auto: horizontal scroll on small screens — never breaks layout.
            table-fixed + colgroup: column widths are locked percentages, so no
            column can grow unbounded no matter how long the data is.
          */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/80">
            <table className="w-full text-sm border-collapse table-fixed min-w-[540px]">

              {/* Fixed column widths — adjust if you add/remove columns */}
              <colgroup>
                <col style={{ width: "32%" }} />  {/* CVE ID */}
                <col style={{ width: "22%" }} />  {/* Severity */}
                <col style={{ width: "20%" }} />  {/* Threat Score */}
                <col style={{ width: "13%" }} />  {/* KEV */}
                <col style={{ width: "13%" }} />  {/* PoC */}
              </colgroup>

              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700">
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 tracking-wide">
                    CVE ID
                  </th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 tracking-wide">
                    Severity
                  </th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 tracking-wide">
                    Threat Score
                  </th>
                  <th className="text-center text-xs text-slate-400 font-medium px-4 py-3 tracking-wide">
                    KEV
                  </th>
                  <th className="text-center text-xs text-slate-400 font-medium px-4 py-3 tracking-wide">
                    PoC
                  </th>
                </tr>
              </thead>

              <tbody>
                {results.map((vuln, idx) => (
                  <tr
                    key={vuln.cve_id ?? idx}
                    className="
                      border-b border-slate-700/40 last:border-0
                      hover:bg-slate-800/60 cursor-pointer
                      transition-colors duration-100
                    "
                    onClick={() => handleRowClick(vuln.cve_id)}
                  >
                    {/* CVE ID — truncated if too long, monospace */}
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-blue-400 text-xs font-medium truncate block"
                        title={vuln.cve_id}
                      >
                        {vuln.cve_id}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <SeverityBadge severity={vuln.severity} />
                    </td>

                    <td className="px-4 py-3">
                      <ThreatScore value={vuln.threat_score} />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <BooleanBadge value={vuln.kev_status} trueLabel="KEV" />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <BooleanBadge
                        value={
                          vuln.poc ??
                          (vuln.github_top_pocs && vuln.github_top_pocs.length > 0)
                        }
                        trueLabel="PoC"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Summary */}
          <AiSummaryCard
            cveId={topSummary?.cve_id}
            summary={topSummary?.ai_summary}
          />
        </div>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────── */}
      {hasSearched && !loading && results.length === 0 && !error && (
        <div className="text-center py-20 text-slate-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/80 mb-4">
            <i className="ti ti-search-off text-3xl text-slate-600" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            No results for "{searchedQ}"
          </p>
          <p className="text-xs mt-1 text-slate-600">
            Try a different keyword, CVE ID, or vendor name
          </p>
        </div>
      )}

      {/* ── INITIAL STATE (before any search) ──────────────── */}
      {!hasSearched && (
        <div className="text-center py-20 text-slate-600">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 mb-4">
            <i className="ti ti-shield-search text-3xl text-slate-600" aria-hidden="true" />
          </div>
          <p className="text-sm">Search across all indexed CVEs</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["log4j", "CVE-2021-44228", "cisco", "CWE-20", "apache"].map((hint) => (
              <button
                key={hint}
                onClick={() => { setQuery(hint); }}
                className="text-xs text-slate-500 border border-slate-700 hover:border-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}