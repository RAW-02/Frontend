import { useState, useEffect } from "react";
import PieChart from "../components/charts/PieChart";
import HorizontalBarChart from "../components/charts/HorizontalBarChart";
import Card from "../components/Card";
import { getAnalytics } from "../services/analyticsService";

// ── MOCK DATA ────────────────────────────────────────────────
const MOCK_DATA = {
  severity_distribution: [
    { name: "Critical", value: 8510 },
    { name: "High", value: 4860 },
    { name: "Medium", value: 4130 },
    { name: "Low", value: 3890 },
    { name: "None", value: 2920 },
  ],
  top_vendors: [
    { name: "Microsoft", value: 4210 },
    { name: "Apple", value: 3031 },
    { name: "Google", value: 2566 },
    { name: "Linux", value: 2020 },
    { name: "Oracle", value: 1557 },
  ],
  top_cwes: [
    { name: "CWE-79", value: 3812 },
    { name: "CWE-89", value: 3090 },
    { name: "CWE-125", value: 2480 },
    { name: "CWE-787", value: 2059 },
    { name: "CWE-20", value: 1601 },
  ],
  top_products: [
    { name: "Windows", value: 2940 },
    { name: "iOS", value: 2175 },
    { name: "Android", value: 1999 },
    { name: "macOS", value: 1617 },
    { name: "Chrome", value: 1293 },
  ],
};

// ── SEVERITY COLORS ──────────────────────────────────────────
const SEVERITY_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];

// ── CHART SECTION WRAPPER ────────────────────────────────────
function ChartCard({ title, icon, loading, children }) {
  return (
    <Card title={title} icon={icon}>
      {loading ? (
        <div className="h-52 bg-slate-700/50 rounded-lg animate-pulse" />
      ) : (
        children
      )}
    </Card>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAnalytics();
        setData(response.data);
      } catch (err) {
        // --- DEVELOPMENT FALLBACK ---
        // Remove these two lines and uncomment setError() when API is ready.
        console.warn("API unavailable — using mock data:", err.message);
        setData(MOCK_DATA);
        // setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── ERROR STATE ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <i
          className="ti ti-alert-triangle text-3xl text-red-400"
          aria-hidden="true"
        />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Aggregated intelligence across all vulnerability data sources
        </p>
      </div>

      {/* ── Row 1: Severity Distribution + Top Vendors ── */}
      {/* Two equal columns on large screens, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Severity distribution"
          icon="ti-chart-pie"
          loading={loading}
        >
          {/* PieChart gets the severity data and our severity color palette */}
          <PieChart
            data={data?.severity_distribution}
            colors={SEVERITY_COLORS}
          />
        </ChartCard>

        <ChartCard title="Top vendors" icon="ti-building" loading={loading}>
          {/* Blue bars for vendors */}
          <HorizontalBarChart data={data?.top_vendors} color="#3b82f6" />
        </ChartCard>
      </div>

      {/* ── Row 2: Top CWEs + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Top CWEs" icon="ti-code" loading={loading}>
          {/* Purple bars for CWEs — different color to visually separate from vendors */}
          <HorizontalBarChart data={data?.top_cwes} color="#a78bfa" />
        </ChartCard>

        <ChartCard title="Top products" icon="ti-box" loading={loading}>
          <HorizontalBarChart data={data?.top_products} color="#2dd4bf" />
        </ChartCard>
      </div>
    </div>
  );
}
