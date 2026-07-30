



import { useState, useRef, useCallback } from "react";
import { analyzeInventory } from "../services/inventoryService";

// ── Constants ──────────────────────────────────────────────────
const REQUIRED_COLUMNS = ["Host", "Vendor", "Product", "Version"];
const ROWS_PER_PAGE    = 10;

const TEMPLATE_CSV = `Host,Vendor,Product,Version
server01,apache,log4j,2.15.0
server02,apache,log4j,2.17.1
server03,nginx,nginx,1.24.0
server04,openssl,openssl,1.1.1w`;

// ── Helpers ────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

function scoreColor(score) {
  if (score >= 75) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-green-400";
}

function riskConfig(level) {
  const map = {
    CRITICAL: { color: "text-red-400",    bg: "bg-red-950/60",    border: "border-red-800/40",    hex: "#f87171" },
    HIGH:     { color: "text-orange-400", bg: "bg-orange-950/60", border: "border-orange-800/40", hex: "#fb923c" },
    MEDIUM:   { color: "text-yellow-400", bg: "bg-yellow-950/60", border: "border-yellow-800/40", hex: "#facc15" },
    LOW:      { color: "text-green-400",  bg: "bg-green-950/60",  border: "border-green-800/40",  hex: "#4ade80" },
  };
  return map[level] ?? map.LOW;
}

function severityBadge(severity) {
  const map = {
    CRITICAL: "bg-red-950/70 text-red-400 border-red-800/40",
    HIGH:     "bg-orange-950/70 text-orange-400 border-orange-800/40",
    MEDIUM:   "bg-yellow-950/70 text-yellow-400 border-yellow-800/40",
    LOW:      "bg-green-950/70 text-green-400 border-green-800/40",
  };
  return map[severity] ?? "bg-slate-800 text-slate-400 border-slate-700";
}

// ── Sub-components ─────────────────────────────────────────────

function SummaryCard({ label, value, icon, color, bg }) {
  return (
    <div className={`rounded-xl border p-4 ${bg} ${color.replace("text-", "border-").replace("400", "800/40")}`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`ti ${icon} text-sm ${color}`} />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

/** Single host component card — expandable */
function ComponentCard({ component, index }) {
  const [open, setOpen] = useState(index === 0); // first card open by default
  const rc = riskConfig(component.risk_level);
  const cveCount = component.vulnerabilities.length;
  const kevCount = component.vulnerabilities.filter((v) => v.kev).length;

  return (
    <div className={`rounded-2xl border overflow-hidden ${rc.border} bg-slate-900/70`}>

      {/* Header — click to toggle */}
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Risk dot */}
          <div className={`h-3 w-3 rounded-full flex-shrink-0`}
               style={{ background: rc.hex }} />

          {/* Host name */}
          <span className="font-mono text-sm font-bold text-slate-200">
            {component.host}
          </span>

          {/* Product info */}
          <span className="text-xs text-slate-500 truncate">
            {component.vendor}:{component.product} v{component.version}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* KEV count */}
          {kevCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/40">
              {kevCount} KEV
            </span>
          )}

          {/* CVE count */}
          <span className="text-[10px] text-slate-500">
            {cveCount} CVE{cveCount !== 1 ? "s" : ""}
          </span>

          {/* Threat score */}
          <span className={`text-sm font-bold font-mono ${scoreColor(component.highest_threat_score)}`}>
            {component.highest_threat_score.toFixed(1)}
          </span>

          {/* Risk badge */}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${rc.bg} ${rc.color} ${rc.border}`}>
            {component.risk_level}
          </span>

          {/* Chevron */}
          <i className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"} text-slate-600 text-sm`} />
        </div>
      </button>

      {/* Expanded: CVE table */}
      {open && (
        <div className="border-t border-slate-800/80">
          {cveCount === 0 ? (
            <div className="flex items-center gap-2 px-5 py-4 text-green-400 text-sm">
              <i className="ti ti-shield-check text-base" />
              No vulnerabilities found for this component
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/50">
                    {["CVE ID", "Severity", "CVSS", "EPSS", "Threat Score", "KEV", "Exploit"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {component.vulnerabilities
                    .slice()
                    .sort((a, b) => b.threat_score - a.threat_score)
                    .map((vuln) => (
                    <tr
                      key={vuln.cve_id}
                      className="border-t border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                    >
                      {/* CVE ID */}
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-blue-400 text-[11px]">
                          {vuln.cve_id}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityBadge(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                      </td>

                      {/* CVSS */}
                      <td className="px-4 py-2.5">
                        <span className={`font-mono font-semibold ${scoreColor(vuln.cvss_score * 10)}`}>
                          {vuln.cvss_score.toFixed(1)}
                        </span>
                      </td>

                      {/* EPSS */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300">
                            {(vuln.epss_score * 100).toFixed(1)}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, vuln.epss_score * 100)}%`,
                                background: scoreColor(vuln.epss_score * 100).includes("red")
                                  ? "#f87171" : scoreColor(vuln.epss_score * 100).includes("orange")
                                  ? "#fb923c" : "#facc15",
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Threat Score */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-semibold ${scoreColor(vuln.threat_score)}`}>
                            {vuln.threat_score.toFixed(1)}
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, vuln.threat_score)}%`,
                                background: "#f87171",
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* KEV */}
                      <td className="px-4 py-2.5">
                        {vuln.kev ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/40">
                            KEV
                          </span>
                        ) : (
                          <span className="text-slate-700 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Exploit */}
                      <td className="px-4 py-2.5">
                        {vuln.exploit_available ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-400 border border-orange-800/40">
                            PoC
                          </span>
                        ) : (
                          <span className="text-slate-700 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Inventory() {
  // ── Upload state ───────────────────────────────────────────
  const [file,        setFile]        = useState(null);
  const [csvData,     setCsvData]     = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewPage, setPreviewPage] = useState(0);

  // ── Analysis state ─────────────────────────────────────────
  const [analyzing,   setAnalyzing]   = useState(false);
  const [apiError,    setApiError]    = useState(null);
  const [results,     setResults]     = useState(null); // full response JSON

  const fileInputRef = useRef(null);

  // ── Parse CSV ──────────────────────────────────────────────
  const processFile = useCallback((f) => {
    setUploadError(null);
    setCsvData(null);
    setResults(null);
    setApiError(null);
    setPreviewPage(0);

    if (!f) return;
    if (!f.name.endsWith(".csv") && f.type !== "text/csv") {
      setUploadError("Only CSV files accepted. Please upload a .csv file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Maximum is 10 MB.");
      return;
    }

    setFile(f);
    const reader = new FileReader();
    reader.onload  = (e) => {
      const parsed = parseCSV(e.target.result);
      if (!parsed.headers.length) {
        setUploadError("CSV appears empty or invalid.");
        return;
      }
      setCsvData(parsed);
    };
    reader.onerror = () => setUploadError("Failed to read file. Please try again.");
    reader.readAsText(f);
  }, []);

  // ── Drag & drop ────────────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true);  };
  const handleDragLeave = ()  => setDragOver(false);
  const handleDrop      = (e) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
  };

  // ── Template download ──────────────────────────────────────
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE_CSV], { type: "text/csv" }));
    const a   = Object.assign(document.createElement("a"), { href: url, download: "inventory-template.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Reset ──────────────────────────────────────────────────
  const reset = () => {
    setFile(null); setCsvData(null); setResults(null);
    setUploadError(null); setApiError(null); setPreviewPage(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── ★ ANALYZE — API call ───────────────────────────────────
  const handleAnalyze = async () => {
    if (!file || !allColumnsPresent) return;

    setAnalyzing(true);
    setApiError(null);
    setResults(null);

    try {
      const response = await analyzeInventory(file);
      // response.data is the full JSON: { summary, components }
      setResults(response.data);
    } catch (err) {
      // Show a user-friendly error message
      if (err.response) {
        // Backend returned an error response (4xx / 5xx)
        setApiError(
          `Backend error ${err.response.status}: ${
            err.response.data?.detail || err.response.data?.message || "Unknown error"
          }`
        );
      } else if (err.request) {
        // Request was made but no response received
        setApiError("Cannot reach the backend. Check that the server is running.");
      } else {
        setApiError(`Unexpected error: ${err.message}`);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────
  const columnStatus = csvData
    ? REQUIRED_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: csvData.headers.includes(col) }), {})
    : null;

  const allColumnsPresent = columnStatus ? Object.values(columnStatus).every(Boolean) : false;
  const totalPages  = csvData ? Math.ceil(csvData.rows.length / ROWS_PER_PAGE) : 0;
  const visibleRows = csvData ? csvData.rows.slice(previewPage * ROWS_PER_PAGE, (previewPage + 1) * ROWS_PER_PAGE) : [];

  const overallRisk = results?.summary?.overall_risk;
  const rc = overallRisk ? riskConfig(overallRisk) : null;

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Inventory Scanner</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your asset inventory CSV to identify vulnerable software across your infrastructure
          </p>
        </div>
        {results && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl transition-all"
          >
            <i className="ti ti-refresh text-base" />
            New Analysis
          </button>
        )}
      </div>

      {/* ── FORMAT GUIDE ─────────────────────────────────── */}
      {!results && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <i className="ti ti-table text-cyan-400 text-sm" />
              Required CSV Format
            </h2>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-all"
            >
              <i className="ti ti-download text-sm" />
              Download Template
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { col: "Host",    desc: "Server or hostname",    example: "server01", color: "#3b82f6" },
              { col: "Vendor",  desc: "Software vendor name",  example: "apache",   color: "#a78bfa" },
              { col: "Product", desc: "Software product name", example: "log4j",    color: "#06b6d4" },
              { col: "Version", desc: "Installed version",     example: "2.15.0",   color: "#facc15" },
            ].map((f) => (
              <div key={f.col} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: f.color }}>{f.col}</span>
                  <span className="text-[10px] text-slate-600">required</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-1">{f.desc}</p>
                <p className="text-[10px] font-mono text-slate-400">{f.example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── UPLOAD AREA ──────────────────────────────────── */}
      {!csvData && !results && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
            dragOver ? "border-cyan-500 bg-cyan-500/5" : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileInput} />
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-cyan-500/20" : "bg-slate-800"}`}>
            <i className={`ti ti-file-upload text-3xl ${dragOver ? "text-cyan-400" : "text-slate-600"}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              {dragOver ? "Drop your CSV file here" : "Drag and drop your CSV file"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              or <span className="text-cyan-400">click to browse</span> · Max 10 MB · .csv only
            </p>
          </div>
          {uploadError && (
            <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/40 text-red-400 text-xs rounded-xl px-4 py-2.5 w-full max-w-md">
              <i className="ti ti-alert-circle text-sm flex-shrink-0" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* ── CSV PREVIEW ──────────────────────────────────── */}
      {csvData && !results && (
        <div className="space-y-4">

          {/* File info */}
          <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center flex-shrink-0">
                <i className="ti ti-file-type-csv text-cyan-400 text-base" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{file?.name}</p>
                <p className="text-xs text-slate-600">
                  {csvData.rows.length.toLocaleString()} rows · {csvData.headers.length} columns
                  {file && ` · ${(file.size / 1024).toFixed(1)} KB`}
                </p>
              </div>
            </div>
            <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors">
              <i className="ti ti-x text-xs" /> Remove
            </button>
          </div>

          {/* Column validation */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Column Validation</p>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLUMNS.map((col) => (
                <span key={col} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${
                  columnStatus[col]
                    ? "bg-green-950/60 text-green-400 border-green-800/40"
                    : "bg-red-950/60 text-red-400 border-red-800/40"
                }`}>
                  <i className={`ti ${columnStatus[col] ? "ti-check" : "ti-x"} text-[10px]`} />
                  {col}
                </span>
              ))}
            </div>
            {!allColumnsPresent && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                <i className="ti ti-alert-triangle text-xs" />
                Missing required columns — fix your CSV and re-upload.
              </p>
            )}
          </div>

          {/* Preview table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <i className="ti ti-table text-cyan-400 text-sm" /> Preview
              </h2>
              <span className="text-[10px] text-slate-600">
                {previewPage * ROWS_PER_PAGE + 1}–{Math.min((previewPage + 1) * ROWS_PER_PAGE, csvData.rows.length)} of {csvData.rows.length.toLocaleString()} rows
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/60">
                    <th className="text-left text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5 w-10">#</th>
                    {csvData.headers.map((h) => (
                      <th key={h} className={`text-left font-semibold uppercase tracking-wider px-4 py-2.5 ${REQUIRED_COLUMNS.includes(h) ? "text-slate-400" : "text-slate-600"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, i) => (
                    <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-slate-700 font-mono">{previewPage * ROWS_PER_PAGE + i + 1}</td>
                      {csvData.headers.map((h) => (
                        <td key={h} className="px-4 py-2.5 text-slate-400 font-mono">{row[h] || <span className="text-slate-700">—</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
                <button onClick={() => setPreviewPage((p) => Math.max(0, p - 1))} disabled={previewPage === 0}
                  className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
                  <i className="ti ti-chevron-left text-xs" /> Previous
                </button>
                <span className="text-[10px] text-slate-600">Page {previewPage + 1} of {totalPages}</span>
                <button onClick={() => setPreviewPage((p) => Math.min(totalPages - 1, p + 1))} disabled={previewPage === totalPages - 1}
                  className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
                  Next <i className="ti ti-chevron-right text-xs" />
                </button>
              </div>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/40 text-red-400 text-sm rounded-xl px-4 py-3">
              <i className="ti ti-alert-circle text-base flex-shrink-0" />
              {apiError}
            </div>
          )}

          {/* Analyze button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {allColumnsPresent
                ? `${csvData.rows.length.toLocaleString()} assets ready for vulnerability analysis`
                : "Fix missing columns before analyzing"}
            </p>
            <button
              onClick={handleAnalyze}
              disabled={!allColumnsPresent || analyzing}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                allColumnsPresent && !analyzing
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 cursor-pointer"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {analyzing ? (
                <>
                  <i className="ti ti-loader-2 animate-spin text-base" />
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="ti ti-search text-base" />
                  Analyze Vulnerabilities
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── LOADING STATE ─────────────────────────────────── */}
      {analyzing && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center">
            <i className="ti ti-loader-2 text-3xl text-cyan-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">Analyzing vulnerabilities...</p>
            <p className="text-xs text-slate-600 mt-1">Matching your assets against the CVE database</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ── RESULTS ──────────────────────────────────────────
          ══════════════════════════════════════════════════════ */}
      {results && !analyzing && (
        <div className="space-y-5">

          {/* ── Overall Risk Banner ──────────────────────── */}
          <div className={`flex items-center justify-between rounded-xl border px-5 py-4 ${rc.border} ${rc.bg}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: `${rc.hex}20` }}>
                <i className="ti ti-alert-octagon text-lg" style={{ color: rc.hex }} />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Overall Risk Level
                </span>
                <span className={`text-lg font-bold ${rc.color}`}>
                  {results.summary.overall_risk}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-700 mx-2" />
              <p className="text-xs text-slate-500">
                Threat score: <span className={`font-bold ${rc.color}`}>{results.summary.overall_threat_score}</span>
                {" "}· {results.summary.affected_components} of {results.summary.total_components} components affected
              </p>
            </div>
            <span className="text-[10px] text-slate-600">{file?.name}</span>
          </div>

          {/* ── Summary Stat Cards ───────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard label="Total"      value={results.summary.total_components}    icon="ti-server"        color="text-slate-300"  bg="bg-slate-800/60" />
            <SummaryCard label="Affected"   value={results.summary.affected_components} icon="ti-alert-circle"  color="text-orange-400" bg="bg-orange-950/40" />
            <SummaryCard label="Critical"   value={results.summary.critical}            icon="ti-flame"         color="text-red-400"    bg="bg-red-950/40" />
            <SummaryCard label="High"       value={results.summary.high}                icon="ti-alert-triangle" color="text-orange-400" bg="bg-orange-950/40" />
            <SummaryCard label="KEV"        value={results.summary.kev}                 icon="ti-bug"           color="text-red-400"    bg="bg-red-950/40" />
            <SummaryCard label="Exploitable" value={results.summary.exploitable}        icon="ti-code"          color="text-yellow-400" bg="bg-yellow-950/40" />
          </div>

          {/* ── Component Cards ──────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <i className="ti ti-server text-cyan-400 text-sm" />
              Component Analysis
              <span className="text-slate-700 font-normal normal-case tracking-normal">
                — click any row to expand CVE details
              </span>
            </h2>
            <div className="space-y-3">
              {results.components
                .slice()
                .sort((a, b) => b.highest_threat_score - a.highest_threat_score)
                .map((component, i) => (
                  <ComponentCard key={`${component.host}-${i}`} component={component} index={i} />
                ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

