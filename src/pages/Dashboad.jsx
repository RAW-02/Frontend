import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import SeverityBadge from "../components/SeverityBadge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  getStats,
  getRecentVulnerabilities,
  getTrendData,
} from "../services/dashboardService";

// ─────────────────────────────────────────────────────────────
// NOTE FOR BACKEND:
// The /dashboard/recent-cves endpoint must return these fields
// per CVE for the feed, watchlist and score breakdown to work:
//   cve_id, severity, threat_score, kev_status,
//   epss_score, published_date
// ─────────────────────────────────────────────────────────────

// ── HELPERS ───────────────────────────────────────────────────

/**
 * Normalize a raw CVE object from the API.
 * Tries multiple possible field names so we're resilient
 * to minor backend naming differences.
 */
function normalizeCVE(raw) {
  return {
    cve_id:         raw.cve_id        ?? raw.id           ?? raw.cveId        ?? "Unknown",
    severity:       raw.severity      ?? raw.severity_level ?? null,
    // threat_score: try every reasonable field name
    threat_score:   raw.threat_score  ?? raw.score         ?? raw.composite_score
                  ?? raw.threat       ?? raw.risk_score     ?? null,
    // kev_status: try every reasonable field name
    kev_status:     raw.kev_status    ?? raw.kev            ?? raw.is_kev
                  ?? raw.in_kev       ?? raw.exploited       ?? false,
    epss_score:     raw.epss_score    ?? raw.epss            ?? null,
    published_date: raw.published_date ?? raw.publishedDate  ?? raw.pub_date ?? null,
  };
}

/** Compute "last 7 days" trend from published_date on each CVE. */
function buildTrendFromCVEs(vulns) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day:   d.toLocaleDateString("en-US", { weekday: "short" }),
      date:  d.toISOString().split("T")[0],
      count: 0,
    };
  });

  vulns.forEach((v) => {
    if (!v.published_date) return;
    const pub = new Date(v.published_date).toISOString().split("T")[0];
    const slot = days.find((d) => d.date === pub);
    if (slot) slot.count++;
  });

  return days.map(({ day, count }) => ({ day, count }));
}

/** Threat-score risk bands — only counts CVEs with a real score (not null). */
function computeBands(vulns) {
  const bands = [
    { label: "Critical risk", range: "75 – 100", color: "#f87171", count: 0 },
    { label: "High risk",     range: "50 – 75",  color: "#fb923c", count: 0 },
    { label: "Medium risk",   range: "25 – 50",  color: "#facc15", count: 0 },
    { label: "Low risk",      range: "0 – 25",   color: "#4ade80", count: 0 },
  ];
  let scored = 0;
  vulns.forEach((v) => {
    if (v.threat_score == null) return; // skip unscored CVEs
    scored++;
    const s = v.threat_score;
    if      (s >= 75) bands[0].count++;
    else if (s >= 50) bands[1].count++;
    else if (s >= 25) bands[2].count++;
    else              bands[3].count++;
  });
  return { bands, scored, total: vulns.length };
}

function getThreatLevel(stats) {
  const total   = stats.total_vulnerabilities || 1;
  const critPct = (stats.critical / total) * 100;
  const kevPct  = (stats.kev      / total) * 100;
  if (critPct > 50 || kevPct > 50)
    return { label: "CRITICAL", color: "text-red-400",    hex: "#f87171", border: "border-red-800/40",    bg: "bg-red-950/40"    };
  if (critPct > 30 || kevPct > 30)
    return { label: "HIGH",     color: "text-orange-400", hex: "#fb923c", border: "border-orange-800/40", bg: "bg-orange-950/40" };
  if (critPct > 15)
    return { label: "MEDIUM",   color: "text-yellow-400", hex: "#facc15", border: "border-yellow-800/40", bg: "bg-yellow-950/40" };
  return   { label: "LOW",      color: "text-green-400",  hex: "#4ade80", border: "border-green-800/40",  bg: "bg-green-950/40"  };
}

function scoreColor(s) {
  if (s >= 75) return "text-red-400";
  if (s >= 50) return "text-orange-400";
  if (s >= 25) return "text-yellow-400";
  return "text-slate-400";
}
function scoreHex(s) {
  if (s >= 75) return "#f87171";
  if (s >= 50) return "#fb923c";
  if (s >= 25) return "#facc15";
  return "#4ade80";
}

// ── SUB-COMPONENTS ────────────────────────────────────────────

function DashStatCard({ label, value, icon, accentHex, valueColor, subtitle, loading }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700"
      style={{ backgroundImage: `radial-gradient(ellipse at top left, ${accentHex}0d, transparent 55%)` }}
    >
      <div className="absolute left-0 top-0 h-[2px] w-full"
           style={{ background: `linear-gradient(90deg, ${accentHex}, transparent)` }} />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
        <div className="h-9 w-9 rounded-xl flex items-center justify-center"
             style={{ background: `${accentHex}18`, border: `1px solid ${accentHex}28` }}>
          <i className={`ti ${icon} text-base`} style={{ color: accentHex }} />
        </div>
      </div>

      {loading
        ? <div className="h-9 w-20 rounded-lg bg-slate-800 animate-pulse mb-1" />
        : <h2 className={`text-4xl font-bold tracking-tight ${valueColor}`}>
            {typeof value === "number" ? value.toLocaleString() : (value ?? "—")}
          </h2>
      }
      <p className="mt-2 text-xs text-slate-600">{subtitle}</p>
    </div>
  );
}

/** Threat score cell: shows bar + number, or a dim "N/A" — never a bar with 0% */
function ScoreCell({ score }) {
  if (score == null)
    return <span className="text-[11px] text-slate-700 font-mono">N/A</span>;
  return (
    <div className="flex items-center gap-2 justify-end">
      <span className={`font-mono text-[11px] font-semibold ${scoreColor(score)}`}>
        {Number(score).toFixed(1)}
      </span>
      <div className="w-8 h-1.5 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full"
             style={{ width: `${Math.min(100, score)}%`, background: scoreHex(score) }} />
      </div>
    </div>
  );
}

function TableHead() {
  return (
    <div className="grid grid-cols-[1fr_80px_90px] gap-x-3 px-1 pb-2 border-b border-slate-800/80 mb-1 flex-shrink-0">
      {["CVE ID", "Severity", "Threat score"].map((h, i) => (
        <span key={h} className={`text-[10px] font-semibold text-slate-600 uppercase tracking-wider ${i > 0 ? "text-right" : ""}`}>{h}</span>
      ))}
    </div>
  );
}

function CveRow({ vuln, onClick }) {
  return (
    <div
      className="grid grid-cols-[1fr_80px_90px] gap-x-3 items-center px-1 py-[5px] rounded-lg cursor-pointer hover:bg-slate-800/60 transition-colors duration-100"
      onClick={() => onClick(vuln.cve_id)}
    >
      <span className="font-mono text-[11px] text-blue-400 truncate" title={vuln.cve_id}>
        {vuln.cve_id}
      </span>
      <div className="flex justify-end">
        <SeverityBadge severity={vuln.severity} />
      </div>
      <div className="flex justify-end">
        <ScoreCell score={vuln.threat_score} />
      </div>
    </div>
  );
}

function SectionCard({ accentHex, title, icon, badge, subtitle, children, className = "" }) {
  return (
    <div className={`relative overflow-hidden flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl p-5 h-full ${className}`}>
      <div className="absolute left-0 top-0 h-[2px] w-full"
           style={{ background: `linear-gradient(90deg, ${accentHex}, transparent)` }} />
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          <i className={`ti ${icon} text-xs`} style={{ color: accentHex }} />
          {title}
        </h2>
        {badge}
      </div>
      {subtitle && <p className="text-[10px] text-slate-600 mb-3 flex-shrink-0 leading-relaxed">{subtitle}</p>}
      {children}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="font-semibold text-blue-400">
        {payload[0].value} new CVE{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const [loading,     setLoading]     = useState(true);
  const [stats,       setStats]       = useState({
    total_vulnerabilities: 0, critical: 0, kev: 0, exploitable: 0,
  });
  const [rawVulns,    setRawVulns]    = useState([]);
  const [trendData,   setTrendData]   = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, recentRes, trendRes] = await Promise.all([
          getStats(),
          getRecentVulnerabilities(),
          getTrendData(),
        ]);

        setStats(statsRes.data ?? {});

        // Normalize every CVE to handle any field-name variation
        const raw = Array.isArray(recentRes.data) ? recentRes.data : [];
        setRawVulns(raw.map(normalizeCVE));

        // Use API trend data if available, else build from CVE published dates
        const apiTrend = Array.isArray(trendRes.data) ? trendRes.data : [];
        setTrendData(apiTrend); // will be filled after vulns are set if empty
      } catch (err) {
        console.warn("[Dashboard] fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Derived ────────────────────────────────────────────────
  const recentVulns = rawVulns; // normalized

  // If API gave no trend data → build from CVE published dates
  const chartData = useMemo(() => {
    if (trendData.length > 0) return trendData;
    return buildTrendFromCVEs(recentVulns);
  }, [trendData, recentVulns]);

  const hasTrendData = chartData.some((d) => d.count > 0);

  // KEV watchlist = kev_status=true, sorted by threat_score desc
  const watchlist = useMemo(() =>
    [...recentVulns]
      .filter((v) => v.kev_status === true)
      .sort((a, b) => (b.threat_score ?? -1) - (a.threat_score ?? -1))
      .slice(0, 6),
    [recentVulns]
  );

  // Threat score bands (only counts CVEs with real scores)
  const { bands, scored, total: bandTotal } = useMemo(
    () => computeBands(recentVulns),
    [recentVulns]
  );
  const maxBandCount = Math.max(...bands.map((b) => b.count), 1);

  const avgThreat = useMemo(() => {
    const valid = recentVulns.filter((v) => v.threat_score != null);
    if (!valid.length) return null;
    return (valid.reduce((s, v) => s + v.threat_score, 0) / valid.length).toFixed(1);
  }, [recentVulns]);

  const topThreat = useMemo(() =>
    recentVulns
      .filter((v) => v.threat_score != null)
      .reduce((top, v) => (v.threat_score > (top?.threat_score ?? -1) ? v : top), null),
    [recentVulns]
  );

  const threatLevel = useMemo(() => getThreatLevel(stats), [stats]);
  const critPct = stats.total_vulnerabilities > 0
    ? Math.round((stats.critical / stats.total_vulnerabilities) * 100)
    : 0;

  const handleCveClick = (cveId) => navigate(`/vulnerability/${cveId}`);

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Threat Intelligence Platform · data updated periodically
        </p>
      </div>

      {/* THREAT LEVEL BANNER */}
      <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${threatLevel.border} ${threatLevel.bg}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: `${threatLevel.hex}18` }}>
            <i className="ti ti-alert-octagon text-base" style={{ color: threatLevel.hex }} />
          </div>
          <div className="flex-shrink-0">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block leading-none mb-0.5">
              Overall threat level
            </span>
            <span className={`text-sm font-bold ${threatLevel.color}`}>{threatLevel.label}</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-700 mx-2 flex-shrink-0" />
          <p className="hidden sm:block text-xs text-slate-500 truncate">
            {critPct > 0 && `${critPct}% of indexed CVEs are Critical`}
            {stats.kev > 0 && ` · ${stats.kev} on CISA KEV watchlist`}
            {avgThreat && ` · avg threat score ${avgThreat}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-slate-600">Live</span>
        </div>
      </div>

      {/* ROW 1: STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashStatCard label="Total Vulnerabilities" value={stats.total_vulnerabilities} icon="ti-database"       accentHex="#06b6d4" valueColor="text-slate-100"   subtitle="All indexed CVEs"             loading={loading} />
        <DashStatCard label="Critical CVEs"         value={stats.critical}              icon="ti-alert-triangle" accentHex="#f87171" valueColor="text-red-400"     subtitle={critPct > 0 ? `${critPct}% of total vulnerabilities` : "Severity is Critical"} loading={loading} />
        <DashStatCard label="Known Exploited"       value={stats.kev}                   icon="ti-bug"            accentHex="#fb923c" valueColor="text-orange-400"  subtitle="On CISA KEV watchlist"        loading={loading} />
        <DashStatCard label="Public PoCs"           value={stats.exploitable}           icon="ti-code"           accentHex="#facc15" valueColor="text-yellow-400"  subtitle="Exploit code available"       loading={loading} />
      </div>

      {/* ROW 2: CVE FEED (left) + TREND CHART (right) — equal height via grid stretch */}
      <div className="grid grid-cols-1 lg:grid-cols-[56fr_44fr] gap-4 items-stretch">

        {/* CVE Intelligence Feed */}
        <SectionCard accentHex="#3b82f6" title="CVE Intelligence Feed" icon="ti-radio"
          badge={
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
              recent · sorted by date
            </span>
          }
        >
          <TableHead />
          <div className="flex-1 overflow-hidden">
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-7 rounded-lg bg-slate-800/50 animate-pulse mb-1" />
                ))
              : recentVulns.length === 0
                ? <div className="flex items-center justify-center h-32 text-slate-600 text-sm">No recent vulnerabilities</div>
                : recentVulns.slice(0, 9).map((v) => (
                    <CveRow key={v.cve_id} vuln={v} onClick={handleCveClick} />
                  ))
            }
          </div>
          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-slate-600">Click any row to open full CVE report</span>
            <button onClick={() => navigate("/search")}
              className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
              Search all CVEs →
            </button>
          </div>
        </SectionCard>

        {/* 7-day trend chart */}
        <SectionCard accentHex="#a78bfa" title="New CVEs — Last 7 Days" icon="ti-chart-bar">
          {loading ? (
            <div className="flex-1 rounded-xl bg-slate-800/50 animate-pulse" style={{ minHeight: 180 }} />
          ) : !hasTrendData ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ minHeight: 180 }}>
              <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                <i className="ti ti-chart-bar text-xl text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium">No trend data yet</p>
                <p className="text-[10px] text-slate-700 mt-1">
                  Requires <code className="text-slate-500">/dashboard/trend</code> endpoint<br />
                  or CVEs with <code className="text-slate-500">published_date</code> field
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0" style={{ minHeight: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill="#3b82f6" fillOpacity={0.55 + (i / chartData.length) * 0.45} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ROW 3: KEV WATCHLIST (left) + THREAT SCORE BREAKDOWN (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

        {/* KEV Priority Watchlist */}
        <SectionCard accentHex="#f87171" title="KEV Priority Watchlist" icon="ti-shield-exclamation"
          subtitle="Known-exploited CVEs confirmed by CISA — sorted by threat score. Patch immediately."
          badge={
            watchlist.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">
                {watchlist.length} active
              </span>
            )
          }
        >
          {watchlist.length > 0 && <TableHead />}

          <div className="flex-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-7 rounded-lg bg-slate-800/50 animate-pulse mb-1" />
              ))
            ) : watchlist.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <i className="ti ti-shield-check text-xl text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    {recentVulns.length > 0
                      ? "No KEV-flagged CVEs in recent data"
                      : "No CVE data loaded"}
                  </p>
                  <p className="text-[10px] text-slate-700 mt-1">
                    {recentVulns.length > 0
                      ? <>Requires <code className="text-slate-500">kev_status: true</code> field<br />from <code className="text-slate-500">/dashboard/recent-cves</code> endpoint</>
                      : "Check backend connection"}
                  </p>
                </div>
              </div>
            ) : (
              watchlist.map((v) => (
                <CveRow key={v.cve_id} vuln={v} onClick={handleCveClick} />
              ))
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-slate-800/80 flex-shrink-0">
            <p className="text-[10px] text-slate-700">
              {watchlist.length > 0
                ? "All listed CVEs are confirmed exploited in the wild (CISA KEV)"
                : `${recentVulns.length} CVE${recentVulns.length !== 1 ? "s" : ""} loaded · kev_status field needed from API`}
            </p>
          </div>
        </SectionCard>

        {/* Threat Score Breakdown */}
        <SectionCard accentHex="#06b6d4" title="Threat Score Breakdown" icon="ti-chart-dots"
          subtitle="CVEs grouped by composite threat score — unique risk view not shown in Analytics."
        >
          <div className="flex-1 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-slate-800/50 animate-pulse" />
              ))
            ) : scored === 0 ? (
              /* No threat scores at all — show clean info state */
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <i className="ti ti-chart-dots text-xl text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-medium">No threat scores available</p>
                  <p className="text-[10px] text-slate-700 mt-1">
                    Requires <code className="text-slate-500">threat_score</code> field<br />
                    from <code className="text-slate-500">/dashboard/recent-cves</code> endpoint
                  </p>
                </div>
                {/* Still show the empty bands so the layout looks right */}
                <div className="w-full space-y-2 mt-2">
                  {bands.map((band) => (
                    <div key={band.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ background: band.color }} />
                          {band.label}
                          <span className="text-slate-700 text-[10px]">{band.range}</span>
                        </span>
                        <span className="text-xs text-slate-700">0 CVEs</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              bands.map((band) => {
                const pct = Math.round((band.count / maxBandCount) * 100);
                return (
                  <div key={band.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                              style={{ background: band.color }} />
                        {band.label}
                        <span className="text-slate-600 text-[10px]">{band.range}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {band.count}
                        <span className="text-slate-600 font-normal"> CVE{band.count !== 1 ? "s" : ""}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700 ease-out"
                           style={{ width: `${pct}%`, background: band.color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Stats footer */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 flex-shrink-0">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <i className="ti ti-flame text-orange-400 text-sm" />
                Avg threat score
              </span>
              <span className="font-semibold text-slate-200">
                {loading ? "—" : avgThreat ? `${avgThreat} / 100` : "N/A"}
              </span>
            </div>
            {topThreat && (
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <i className="ti ti-arrow-up-right text-red-400 text-sm" />
                  Highest threat
                </span>
                <span className="font-semibold text-red-400">
                  {topThreat.threat_score?.toFixed(1)} — {topThreat.cve_id}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <i className="ti ti-database text-slate-600 text-sm" />
                Scored CVEs
              </span>
              <span className="text-slate-400">
                {scored} of {bandTotal}
              </span>
            </div>
            <p className="text-[10px] text-slate-700 pt-1 border-t border-slate-800/60">
              Severity distribution & vendor analysis →{" "}
              <button onClick={() => navigate("/analytics")}
                className="text-cyan-600 hover:text-cyan-400 transition-colors">
                Analytics page
              </button>
            </p>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

