import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SeverityBadge from "../components/SeverityBadge";
import AiSummaryCard  from "../components/AiSummaryCard";
import { searchVulnerabilities } from "../services/searchService";

function BooleanIcon({ value }) {
  return value
    ? <i className="ti ti-check text-green-400 text-base" aria-label="Yes" />
    : <span className="text-slate-600 text-sm">—</span>;
}

// ── MOCK DATA ────────────────────────────────────────────────
// Realistic placeholder results for when the backend is not running.
// Shape MUST match exactly what your FastAPI /api/search returns.
// When the real API works, delete this and the mock branch below.
const MOCK_RESULTS = [
  {
    cve_id      : "CVE-2021-44228",
    severity    : "Critical",
    threat_score: 9.8,
    epss        : 0.975,
    kev         : true,
    poc         : true,
    exploit     : true,
    ai_summary  : "Log4Shell is a critical RCE vulnerability in Apache Log4j 2. Attackers exploit JNDI lookups in log messages to execute arbitrary code on the server. Actively exploited in the wild with a CVSS score of 10.0.",
  },
  {
    cve_id      : "CVE-2021-45046",
    severity    : "Critical",
    threat_score: 9.0,
    epss        : 0.941,
    kev         : true,
    poc         : true,
    exploit     : false,
    ai_summary  : null,
  },
  {
    cve_id      : "CVE-2021-45105",
    severity    : "High",
    threat_score: 7.5,
    epss        : 0.612,
    kev         : false,
    poc         : true,
    exploit     : false,
    ai_summary  : null,
  },
  {
    cve_id      : "CVE-2021-44832",
    severity    : "Medium",
    threat_score: 6.6,
    epss        : 0.388,
    kev         : false,
    poc         : false,
    exploit     : false,
    ai_summary  : null,
  },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // hasSearched: becomes true after the first search
  // We use this to show "no results" only after a search, not on page load
  const [hasSearched, setHasSearched] = useState(false);

  // useNavigate returns a function we call to change the URL
  const navigate = useNavigate();

  const handleSearch = async () => {
    // trim() removes leading/trailing spaces
    // Do nothing if the box is empty
    if (!query.trim()) return;

    // Reset state for a fresh search
    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      // Call our service function — this hits GET /api/search?q=<query>
      const response = await searchVulnerabilities(query);
      setResults(response.data.results ?? response.data ?? []);

    } catch (err) {
      console.warn("API unavailable — using mock data:", err.message);
      setResults(MOCK_RESULTS);
      
      // Uncomment this line and delete the two lines above when API is ready:
      // setError("Could not reach the server. Please try again.");
    } finally {
      // finally always runs — whether the request succeeded or failed
      setLoading(false);
    }
  };

  // ── handleKeyDown ────────────────────────────────────────────
  // Allows pressing Enter in the input to trigger the search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── handleRowClick ───────────────────────────────────────────
  // When user clicks a table row, navigate to the detail page.
  // navigate() changes the URL — React Router renders the matching page.
  const handleRowClick = (cveId) => {
    navigate(`/vulnerability/${cveId}`);
  };

  // The first result's AI summary (if it has one)
  // We show only one AI summary card — for the top result
  const topSummary = results.find((r) => r.ai_summary);

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Search</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search by CVE ID, keyword, vendor, or product name
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          // Every keystroke updates the query state
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. apache log4j, CVE-2021-44228, microsoft exchange..."
          className="
            flex-1 bg-slate-800 border border-slate-700 rounded-xl
            px-4 py-3 text-sm text-slate-100 placeholder-slate-500
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          "
        />

        <button
          onClick={handleSearch}
          // Disable the button while loading so user can't double-submit
          disabled={loading}
          className="
            flex items-center gap-2 bg-blue-600 hover:bg-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            text-white text-sm font-medium
            px-5 py-3 rounded-xl transition-colors duration-150
          "
        >
          {/* Show a spinner icon while loading, search icon otherwise */}
          <i
            className={`ti ${loading ? "ti-loader-2 animate-spin" : "ti-search"} text-base`}
            aria-hidden="true"
          />
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* ── Error message ── */}
      {/* Only renders if error state is not null */}
      {error && (
        <div className="flex items-center gap-2 bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
          <i className="ti ti-alert-circle text-base" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* ── Results table ── */}
      {/* Only render the table if we have results */}
      {results.length > 0 && (
        <div>
          {/* Result count line */}
          <p className="text-xs text-slate-500 mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
            <span className="text-slate-300">"{query}"</span>
          </p>

          {/* overflow-x-auto: if the table is wider than the screen on mobile,
              show a horizontal scrollbar instead of breaking the layout */}
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm border-collapse">

              {/* Table header */}
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  {/* text-left = left-align text, whitespace-nowrap = no line breaks */}
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">CVE ID</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">Severity</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">Threat score</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">EPSS</th>
                  <th className="text-center text-xs text-slate-400 font-medium px-4 py-3">KEV</th>
                  <th className="text-center text-xs text-slate-400 font-medium px-4 py-3">PoC</th>
                  <th className="text-center text-xs text-slate-400 font-medium px-4 py-3">Exploit</th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {results.map((vuln) => (
                  <tr
                    key={vuln.cve_id}
                    // cursor-pointer = hand cursor on hover
                    // hover:bg-slate-800 = subtle highlight on hover
                    // transition-colors = smooth color change
                    className="
                      border-b border-slate-700/50 last:border-0
                      hover:bg-slate-800 cursor-pointer transition-colors duration-100
                    "
                    onClick={() => handleRowClick(vuln.cve_id)}
                  >
                    {/* CVE ID in monospace blue */}
                    <td className="px-4 py-3 font-mono text-blue-400 text-xs whitespace-nowrap">
                      {vuln.cve_id}
                    </td>

                    <td className="px-4 py-3">
                      <SeverityBadge severity={vuln.severity} />
                    </td>

                    {/* toFixed(1) shows one decimal place: 9.8, 7.5 etc. */}
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {Number(vuln.threat_score).toFixed(1)}
                    </td>

                    {/* EPSS is 0–1, show 3 decimal places */}
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {Number(vuln.epss).toFixed(3)}
                    </td>

                    {/* Boolean columns are centered */}
                    <td className="px-4 py-3 text-center">
                      <BooleanIcon value={vuln.kev} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <BooleanIcon value={vuln.poc} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <BooleanIcon value={vuln.exploit} />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* AI Summary Card — shows below the table */}
          {/* topSummary is the first result that has an ai_summary field */}
          <AiSummaryCard
            cveId={topSummary?.cve_id}
            summary={topSummary?.ai_summary}
          />
        </div>
      )}

      {/* ── Empty state ── */}
      {/* Show only after a search returns zero results */}
      {hasSearched && !loading && results.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500">
          <i className="ti ti-search-off text-4xl mb-3 block" aria-hidden="true" />
          <p className="text-sm">No vulnerabilities found for "{query}"</p>
          <p className="text-xs mt-1">Try a different keyword or CVE ID</p>
        </div>
      )}

    </div>
  );
}