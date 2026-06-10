import StatCard from "../components/StatCard";
import Card from "../components/Card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── MOCK DATA ────────────────────────────────────────────────
// This is placeholder data. Later we will fetch this from FastAPI.
// Keeping it separate at the top makes it easy to find and replace.

const stats = {
  total: 24310,
  critical: 1847,
  exploited: 312,
  pocs: 589,
};

// 7-day trend data — each object is one bar on the chart
// "day" = label on X axis, "count" = height of the bar
const trendData = [
  { day: "Mon", count: 42 },
  { day: "Tue", count: 67 },
  { day: "Wed", count: 55 },
  { day: "Thu", count: 89 },
  { day: "Fri", count: 74 },
  { day: "Sat", count: 31 },
  { day: "Sun", count: 58 },
];

// Recent vulnerabilities — latest 5 CVEs
const recentVulns = [
  { id: "CVE-2024-1234", severity: "Critical" },
  { id: "CVE-2024-5678", severity: "High"     },
  { id: "CVE-2024-9012", severity: "Medium"   },
  { id: "CVE-2024-3456", severity: "Critical" },
  { id: "CVE-2024-7890", severity: "High"     },
];

// Top vendors by vulnerability count
const topVendors = [
  { name: "Microsoft", count: 4210 },
  { name: "Apple",     count: 3031 },
  { name: "Google",    count: 2566 },
  { name: "Linux",     count: 2020 },
  { name: "Oracle",    count: 1557 },
];

// ── HELPER: SeverityBadge ────────────────────────────────────
// A small inline component — just for this file, no need for its own file.
// Returns a colored pill based on the severity string.
function SeverityBadge({ severity }) {
  // Map each severity to a Tailwind class combo
  const colors = {
    Critical: "bg-red-950  text-red-400",
    High:     "bg-orange-950 text-orange-400",
    Medium:   "bg-yellow-950 text-yellow-400",
    Low:      "bg-blue-950  text-blue-400",
  };

  // Fall back to gray if severity is something unexpected
  const cls = colors[severity] ?? "bg-slate-700 text-slate-300";

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${cls}`}>
      {severity}
    </span>
  );
}

// ── HELPER: VendorBar ────────────────────────────────────────
// A simple horizontal bar row used in Top Vendors.
// Shows the vendor name, a proportional bar, and the count.
function VendorBar({ name, count, max }) {
  // Calculate how wide this bar should be as a percentage of the biggest value
  // e.g. if max is 4210 and count is 2020, width = (2020/4210)*100 = 48%
  const widthPct = Math.round((count / max) * 100);

  return (
    <div className="flex items-center gap-3 mb-3">
      {/* Vendor name — fixed width so all bars start at the same x position */}
      <span className="text-xs text-slate-400 w-20 text-right truncate">{name}</span>

      {/* Bar track — full width gray background */}
      <div className="flex-1 bg-slate-900 rounded h-2">
        {/* Bar fill — width is dynamic based on widthPct */}
        <div
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${widthPct}%` }}
        />
      </div>

      {/* The count number on the right */}
      <span className="text-xs text-slate-500 w-10">{count.toLocaleString()}</span>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function Dashboard() {
  // The highest vendor count — used to calculate bar widths proportionally
  const maxVendorCount = topVendors[0].count;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Vulnerability overview · data updated periodically
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total vulnerabilities"
          value={stats.total}
          icon="ti-database"
          color="text-slate-100"
        />
        <StatCard
          label="Critical"
          value={stats.critical}
          icon="ti-alert-triangle"
          color="text-red-400"
        />
        <StatCard
          label="Known exploited"
          value={stats.exploited}
          icon="ti-bug"
          color="text-orange-400"
        />
        <StatCard
          label="Public PoCs"
          value={stats.pocs}
          icon="ti-code"
          color="text-yellow-400"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <Card title="Recent vulnerabilities">
          <ul className="space-y-3">
            {recentVulns.map((vuln) => (
              <li key={vuln.id} className="flex items-center justify-between">
                <span className="text-sm font-mono text-blue-400">{vuln.id}</span>
                <SeverityBadge severity={vuln.severity} />
              </li>
            ))}
          </ul>
        </Card>

        {/* ── 7-Day Trend Chart ── */}
        <Card title="New CVEs — last 7 days">
          {/* ResponsiveContainer makes Recharts fill the card's width */}
          {/* height={180} = fixed pixel height for the chart area */}
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>

              {/* XAxis: shows the day labels at the bottom */}
              {/* tick = style for the axis labels */}
              <XAxis
                dataKey="day"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}   // hide the axis line
                tickLine={false}   // hide the tick marks
              />

              {/* YAxis: shows the numbers on the left */}
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Tooltip: the popup that shows the count when you hover a bar */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",  // dark background
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                cursor={{ fill: "#ffffff10" }}  // subtle hover highlight
              />

              {/* Bar: the actual bars — dataKey links to the "count" field in trendData */}
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              {/*                                            ↑ top corners rounded */}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Top Vendors ── */}
        <Card title="Top vendors">
          {topVendors.map((vendor) => (
            <VendorBar
              key={vendor.name}
              name={vendor.name}
              count={vendor.count}
              max={maxVendorCount}
            />
          ))}
        </Card>

      </div>
    </div>
  );
}