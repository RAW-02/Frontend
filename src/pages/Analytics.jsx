import { useState, useEffect } from "react";
import PieChart from "../components/charts/PieChart";
import HorizontalBarChart from "../components/charts/HorizontalBarChart";
import Card from "../components/Card";
import { getAnalytics } from "../services/analyticsService";

// ── SEVERITY COLORS ──────────────────────────────────────────
const SEVERITY_COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#60a5fa",
];

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
        console.error("Failed to load analytics:", err);

        setData({
          severity_distribution: [],
          top_vendors: [],
          top_cwes: [],
          top_products: [],
        });

        // setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Aggregated intelligence across all vulnerability data sources
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Severity distribution"
          icon="ti-chart-pie"
          loading={loading}
        >
          <PieChart
            data={data?.severity_distribution}
            colors={SEVERITY_COLORS}
          />
        </ChartCard>

        <ChartCard
          title="Top vendors"
          icon="ti-building"
          loading={loading}
        >
          <HorizontalBarChart
            data={data?.top_vendors}
            color="#3b82f6"
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Top CWEs"
          icon="ti-code"
          loading={loading}
        >
          <HorizontalBarChart
            data={data?.top_cwes}
            color="#a78bfa"
          />
        </ChartCard>

        <ChartCard
          title="Top products"
          icon="ti-box"
          loading={loading}
        >
          <HorizontalBarChart
            data={data?.top_products}
            color="#2dd4bf"
          />
        </ChartCard>
      </div>
    </div>
  );
}