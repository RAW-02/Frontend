import { useState, useRef, useCallback } from "react";

// ── CSV Parser ─────────────────────────────────────────────────
// Parses CSV text into array of objects using first row as headers
function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

// ── Template CSV content ───────────────────────────────────────
const TEMPLATE_CSV = `Host,Vendor,Product,Version
server01,apache,log4j,2.15.0
server02,apache,log4j,2.17.1
server03,nginx,nginx,1.24.0
server04,openssl,openssl,1.1.1w`;

const REQUIRED_COLUMNS = ["Host", "Vendor", "Product", "Version"];

// ── Sub-components ─────────────────────────────────────────────

function ColumnBadge({ name, present }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${
        present
          ? "bg-green-950/60 text-green-400 border-green-800/40"
          : "bg-red-950/60 text-red-400 border-red-800/40"
      }`}
    >
      <i className={`ti ${present ? "ti-check" : "ti-x"} text-[10px]`} />
      {name}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Inventory() {
  const [file,        setFile]        = useState(null);
  const [csvData,     setCsvData]     = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [error,       setError]       = useState(null);
  const [previewPage, setPreviewPage] = useState(0);

  const fileInputRef = useRef(null);
  const ROWS_PER_PAGE = 10;

  // ── Validate and parse uploaded file ──────────────────────────
  const processFile = useCallback((f) => {
    setError(null);
    setCsvData(null);
    setPreviewPage(0);

    if (!f) return;

    // Accept .csv or text/csv
    if (!f.name.endsWith(".csv") && f.type !== "text/csv") {
      setError("Only CSV files are accepted. Please upload a .csv file.");
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);

      if (parsed.headers.length === 0) {
        setError("CSV file appears to be empty or invalid.");
        return;
      }

      setCsvData(parsed);
    };
    reader.onerror = () => setError("Failed to read the file. Please try again.");
    reader.readAsText(f);
  }, []);

  // ── Drag and drop handlers ────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true);  };
  const handleDragLeave = ()  => setDragOver(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  };

  const handleFileInput = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  // ── Download sample template ──────────────────────────────────
  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "inventory-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Reset ─────────────────────────────────────────────────────
  const reset = () => {
    setFile(null);
    setCsvData(null);
    setError(null);
    setPreviewPage(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Column validation ─────────────────────────────────────────
  const columnStatus = csvData
    ? REQUIRED_COLUMNS.reduce((acc, col) => {
        acc[col] = csvData.headers.includes(col);
        return acc;
      }, {})
    : null;

  const allColumnsPresent = columnStatus
    ? Object.values(columnStatus).every(Boolean)
    : false;

  // ── Pagination ────────────────────────────────────────────────
  const totalPages    = csvData ? Math.ceil(csvData.rows.length / ROWS_PER_PAGE) : 0;
  const visibleRows   = csvData
    ? csvData.rows.slice(previewPage * ROWS_PER_PAGE, (previewPage + 1) * ROWS_PER_PAGE)
    : [];

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Inventory Scanner</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your asset inventory CSV to identify vulnerable software across your infrastructure
        </p>
      </div>

      {/* ── FORMAT GUIDE ───────────────────────────────────── */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <i className="ti ti-table text-cyan-400 text-sm" />
            Required CSV Format
          </h2>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <i className="ti ti-download text-sm" />
            Download Template
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { col: "Host",    desc: "Server or hostname",     example: "server01",  color: "#3b82f6" },
            { col: "Vendor",  desc: "Software vendor name",   example: "apache",    color: "#a78bfa" },
            { col: "Product", desc: "Software product name",  example: "log4j",     color: "#06b6d4" },
            { col: "Version", desc: "Installed version",      example: "2.15.0",    color: "#facc15" },
          ].map((f) => (
            <div
              key={f.col}
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-bold"
                  style={{ color: f.color }}
                >
                  {f.col}
                </span>
                <span className="text-[10px] text-slate-600">required</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-1">{f.desc}</p>
              <p className="text-[10px] font-mono text-slate-400">{f.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── UPLOAD AREA ────────────────────────────────────── */}
      {!csvData && (
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-10
            flex flex-col items-center justify-center gap-4
            cursor-pointer transition-all duration-200
            ${dragOver
              ? "border-cyan-500 bg-cyan-500/5"
              : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileInput}
          />

          <div
            className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${
              dragOver ? "bg-cyan-500/20" : "bg-slate-800"
            }`}
          >
            <i
              className={`ti ti-file-upload text-3xl transition-colors ${
                dragOver ? "text-cyan-400" : "text-slate-600"
              }`}
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              {dragOver ? "Drop your CSV file here" : "Drag and drop your CSV file"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              or <span className="text-cyan-400">click to browse</span> · Max 10 MB · .csv only
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/40 text-red-400 text-xs rounded-xl px-4 py-2.5 w-full max-w-md">
              <i className="ti ti-alert-circle text-sm flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── CSV PREVIEW ────────────────────────────────────── */}
      {csvData && (
        <div className="space-y-4">

          {/* File info bar */}
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
            <button
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <i className="ti ti-x text-xs" />
              Remove
            </button>
          </div>

          {/* Column validation */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
              Column Validation
            </p>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLUMNS.map((col) => (
                <ColumnBadge key={col} name={col} present={columnStatus[col]} />
              ))}
              {/* Show extra columns */}
              {csvData.headers
                .filter((h) => !REQUIRED_COLUMNS.includes(h))
                .map((h) => (
                  <span key={h} className="text-[10px] font-medium text-slate-600 bg-slate-800 px-2 py-1 rounded-full">
                    {h} (extra)
                  </span>
                ))}
            </div>
            {!allColumnsPresent && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                <i className="ti ti-alert-triangle text-xs" />
                Missing required columns. Please fix your CSV and re-upload.
              </p>
            )}
          </div>

          {/* Preview table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <i className="ti ti-table text-cyan-400 text-sm" />
                Preview
              </h2>
              <span className="text-[10px] text-slate-600">
                Showing {previewPage * ROWS_PER_PAGE + 1}–
                {Math.min((previewPage + 1) * ROWS_PER_PAGE, csvData.rows.length)} of{" "}
                {csvData.rows.length.toLocaleString()} rows
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/60">
                    <th className="text-left text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5 w-10">
                      #
                    </th>
                    {csvData.headers.map((h) => (
                      <th
                        key={h}
                        className={`text-left font-semibold uppercase tracking-wider px-4 py-2.5 ${
                          REQUIRED_COLUMNS.includes(h) ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {h}
                        {!REQUIRED_COLUMNS.includes(h) && (
                          <span className="ml-1 text-slate-700 normal-case tracking-normal font-normal">extra</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-slate-700 font-mono">
                        {previewPage * ROWS_PER_PAGE + i + 1}
                      </td>
                      {csvData.headers.map((h) => (
                        <td key={h} className="px-4 py-2.5 text-slate-400 font-mono">
                          {row[h] || <span className="text-slate-700">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
                <button
                  onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                  disabled={previewPage === 0}
                  className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <i className="ti ti-chevron-left text-xs" /> Previous
                </button>
                <span className="text-[10px] text-slate-600">
                  Page {previewPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPreviewPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={previewPage === totalPages - 1}
                  className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  Next <i className="ti ti-chevron-right text-xs" />
                </button>
              </div>
            )}
          </div>

          {/* Analyze button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {allColumnsPresent
                ? `${csvData.rows.length.toLocaleString()} assets ready for vulnerability analysis`
                : "Fix missing columns before analyzing"}
            </p>

            <button
              disabled={!allColumnsPresent}
              className={`
                inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-200
                ${allColumnsPresent
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 cursor-pointer"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
                }
              `}
            >
              <i className="ti ti-search text-base" />
              Analyze Vulnerabilities
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
