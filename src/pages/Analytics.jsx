import { useState, useEffect } from "react";
import PieChart from "../components/charts/PieChart";
import HorizontalBarChart from "../components/charts/HorizontalBarChart";
import Card from "../components/Card";
import MetricCard from "../components/analytics/MetricCard";
import InsightCard from "../components/analytics/InsightCard";
import {
  getDashboardAnalytics,
  getSeverityAnalytics,
  getVendorAnalytics,
  getTopCweAnalytics,
  getEpssAnalytics,
  getThreatScoreAnalytics,
} from "../services/analyticsService";

// ── CONSTANTS ─────────────────────────────────────────────────
const SEVERITY_COLORS  = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];
const SEVERITY_ORDER   = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const METHODOLOGY = [
  { title: "Severity Distribution", icon: "ti-chart-pie",
    text: "How vulnerabilities are spread across Critical, High, Medium and Low severity levels." },
  { title: "Top Vendors",           icon: "ti-building",
    text: "Vendors with the highest number of affected CVEs across all indexed data." },
  { title: "Top CWEs",              icon: "ti-code",
    text: "Most common weakness categories across all indexed vulnerabilities." },
  { title: "EPSS",                  icon: "ti-target-arrow",
    text: "Probability that a vulnerability will be exploited in the next 30 days." },
  { title: "Threat Score",          icon: "ti-flame",
    text: "Composite risk score derived from multiple threat intelligence signals." },
];

// ── LOADING SKELETON ─────────────────────────────────────────
function Skeleton({ h = "h-64" }) {
  return (
    <div className={`${h} w-full rounded-xl bg-slate-800/50 animate-pulse`} />
  );
}

// ── CHART CARD WRAPPER ────────────────────────────────────────
function ChartCard({ title, icon, loading, skeletonH = "h-[420px]", children, className = "" }) {
  return (
    <Card title={title} icon={icon} className={className}>
      {loading ? <Skeleton h={skeletonH} /> : children}
    </Card>
  );
}

// ── SEVERITY BREAKDOWN (right panel of the full-width row) ────
function SeverityBreakdown({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!total) return null;

  // Ensure rows appear in the standard severity order
  const ordered = SEVERITY_ORDER
    .map((sev) => data.find((d) => d.name?.toUpperCase() === sev))
    .filter(Boolean);

  // Add anything that wasn't in the order list (future severities)
  const rest = data.filter(
    (d) => !SEVERITY_ORDER.includes(d.name?.toUpperCase())
  );
  const rows = [...ordered, ...rest];

  const colorMap = {
    CRITICAL: { bar: "#f87171", bg: "#f871711a", text: "text-red-400" },
    HIGH:     { bar: "#fb923c", bg: "#fb923c1a", text: "text-orange-400" },
    MEDIUM:   { bar: "#facc15", bg: "#facc151a", text: "text-yellow-400" },
    LOW:      { bar: "#4ade80", bg: "#4ade801a", text: "text-green-400" },
  };

  return (
    <div className="flex flex-col justify-center gap-3 py-2 w-full">
      {rows.map((item, i) => {
        const key  = item.name?.toUpperCase();
        const c    = colorMap[key] ?? { bar: SEVERITY_COLORS[i] ?? "#60a5fa",
                                        bg: "#60a5fa1a", text: "text-blue-400" };
        const pct  = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";

        return (
          <div key={item.name} className="group/row">
            {/* Label row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: c.bar }}
                />
                <span className={`text-sm font-semibold ${c.text} uppercase tracking-wide`}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-200">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-xs text-slate-600 w-10 text-right">
                  {pct}%
                </span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${c.bar}88, ${c.bar})`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Total footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-600">Total indexed</span>
        <span className="text-sm font-bold text-slate-300">
          {total.toLocaleString()} CVEs
        </span>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function Analytics() {
  const [dashboard,    setDashboard]    = useState(null);
  const [severityData, setSeverityData] = useState([]);
  const [vendorData,   setVendorData]   = useState([]);
  const [cweData,      setCweData]      = useState([]);
  const [epssStats,    setEpssStats]    = useState(null);
  const [threatStats,  setThreatStats]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // ── Derived values ──────────────────────────────────────────
  const totalVulns = dashboard?.total_vulnerabilities ?? 0;
  const avgEpss    = dashboard?.average_epss          ?? 0;
  const avgThreat  = dashboard?.average_threat_score  ?? 0;

  const criticalCount =
    dashboard?.severity_distribution?.find(
      (item) => item.key === "CRITICAL"
    )?.doc_count ?? 0;

  const topVendor = vendorData[0];
  const topCwe    = cweData[0];

  // ── Data fetch ──────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, sevRes, vendRes, cweRes, epssRes, threatRes] =
          await Promise.all([
            getDashboardAnalytics(),
            getSeverityAnalytics(),
            getVendorAnalytics(),
            getTopCweAnalytics(),
            getEpssAnalytics(),
            getThreatScoreAnalytics(),
          ]);

        setDashboard(dashRes.data);

        setSeverityData(
          Array.isArray(sevRes.data)
            ? sevRes.data.map((i) => ({ name: i.severity, value: i.count }))
            : []
        );
        setVendorData(
          Array.isArray(vendRes.data)
            ? vendRes.data.slice(0, 10).map((i) => ({ name: i.vendor, value: i.count }))
            : []
        );
        setCweData(
          Array.isArray(cweRes.data)
            ? cweRes.data.slice(0, 10).map((i) => ({ name: i.cwe, value: i.count }))
            : []
        );
        setEpssStats(epssRes.data);
        setThreatStats(threatRes.data);

      } catch (err) {
        console.error("[Analytics] fetch error:", err);
        setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Error state ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <i className="ti ti-alert-triangle text-3xl text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Aggregated intelligence across all vulnerability data sources
        </p>
      </div>

      {/* ── ROW 1: METRIC CARDS ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Vulnerabilities"
          value={loading ? null : totalVulns}
          subtitle="All indexed CVEs"
          icon="ti-shield-check"
          iconBg="bg-cyan-950/80"
          iconColor="text-cyan-400"
        />
        <MetricCard
          title="Critical CVEs"
          value={loading ? null : criticalCount}
          subtitle="Severity is Critical"
          icon="ti-alert-triangle"
          iconBg="bg-red-950/80"
          iconColor="text-red-400"
        />
        <MetricCard
          title="Average EPSS"
          value={loading ? null : avgEpss?.toFixed(3)}
          subtitle="Exploitation probability"
          icon="ti-target-arrow"
          iconBg="bg-yellow-950/80"
          iconColor="text-yellow-400"
        />
        <MetricCard
          title="Avg Threat Score"
          value={loading ? null : avgThreat?.toFixed(1)}
          subtitle="Overall risk score"
          icon="ti-flame"
          iconBg="bg-orange-950/80"
          iconColor="text-orange-400"
        />
      </div>

      {/* ── ROW 2: INSIGHT CARDS ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-36" />)
        ) : (
          <>
            <InsightCard
              title="Top Vendor"
              value={topVendor?.name ?? "—"}
              subtitle={`${(topVendor?.value ?? 0).toLocaleString()} affected vulnerabilities`}
              icon="ti-building"
              color="text-blue-400"
              accentHex="#3b82f6"
              progress={
                totalVulns > 0 && topVendor
                  ? (topVendor.value / totalVulns) * 100
                  : undefined
              }
              progressLabel="of total vulnerabilities"
            />

            <InsightCard
              title="Top CWE"
              value={topCwe?.name ?? "—"}
              subtitle={`${(topCwe?.value ?? 0).toLocaleString()} affected CVEs`}
              icon="ti-code"
              color="text-purple-400"
              accentHex="#a78bfa"
              progress={
                totalVulns > 0 && topCwe
                  ? (topCwe.value / totalVulns) * 100
                  : undefined
              }
              progressLabel="of total vulnerabilities"
            />

            <InsightCard
              title="Highest EPSS"
              value={
                epssStats?.maximum != null
                  ? Number(epssStats.maximum).toFixed(3)
                  : "—"
              }
              subtitle="Maximum exploitability score"
              icon="ti-target-arrow"
              color="text-yellow-400"
              accentHex="#facc15"
              badge="HIGH RISK"
              progress={
                epssStats?.maximum != null
                  ? Number(epssStats.maximum) * 100
                  : undefined
              }
              progressLabel="exploitation probability"
            />

            <InsightCard
              title="Highest Threat"
              value={
                threatStats?.maximum != null
                  ? Number(threatStats.maximum).toFixed(1)
                  : "—"
              }
              subtitle="Maximum risk score"
              icon="ti-flame"
              color="text-orange-400"
              accentHex="#f97316"
              badge="CRITICAL"
              progress={threatStats?.maximum ?? undefined}
              progressLabel="of maximum threat score"
            />
          </>
        )}
      </div>

      {/* ── ROW 3: SEVERITY DISTRIBUTION — FULL WIDTH ──────── */}
      <Card title="Severity Distribution" icon="ti-chart-pie">
        {loading ? (
          <Skeleton h="h-72" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            {/* Donut — fixed size, never stretches */}
            <div className="lg:col-span-2">
              <PieChart
                data={severityData}
                colors={SEVERITY_COLORS}
                height={280}
              />
            </div>

            {/* Breakdown — scales cleanly regardless of data size */}
            <div className="lg:col-span-3 px-2 lg:px-6 lg:border-l border-slate-800">
              <SeverityBreakdown data={severityData} />
            </div>
          </div>
        )}
      </Card>

      {/* ── ROW 4: VENDORS (left) + CWEs (right) — SAME HEIGHT  */}
      {/*   CSS grid ensures equal height; both charts use height=380  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <ChartCard
          title="Top 10 Vendors"
          icon="ti-building"
          loading={loading}
          skeletonH="h-[420px]"
          className="h-full"
        >
          <HorizontalBarChart
            data={vendorData}
            color="#3b82f6"
            tooltipLabel="Vulnerabilities"
            height={380}
          />
          <p className="mt-3 text-xs text-slate-600">
            Showing the 10 vendors with the highest number of affected vulnerabilities.
          </p>
        </ChartCard>

        <ChartCard
          title="Top 10 CWEs"
          icon="ti-code"
          loading={loading}
          skeletonH="h-[420px]"
          className="h-full"
        >
          <HorizontalBarChart
            data={cweData}
            color="#a78bfa"
            tooltipLabel="Affected CVEs"
            height={380}
          />
          <p className="mt-3 text-xs text-slate-600">
            Showing the 10 most common weakness categories across all indexed vulnerabilities.
          </p>
        </ChartCard>
      </div>

      {/* ── ROW 5: METHODOLOGY ─────────────────────────────── */}
      <Card title="Analytics Methodology" icon="ti-book">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {METHODOLOGY.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-4
                         transition-colors duration-200 hover:border-slate-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <i className={`ti ${item.icon} text-sm text-cyan-400`} />
                <h4 className="text-sm font-semibold text-cyan-400">
                  {item.title}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
