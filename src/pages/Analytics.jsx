import { useState, useEffect } from "react";
import PieChart from "../components/charts/PieChart";
import HorizontalBarChart from "../components/charts/HorizontalBarChart";
import Card from "../components/Card";
import {
  getDashboardAnalytics,
  getSeverityAnalytics,
  getVendorAnalytics,
  getTopCweAnalytics,
  getEpssAnalytics,
  getThreatScoreAnalytics
} from "../services/analyticsService";

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


function StatCard({ title, value, icon, color = "text-cyan-400" }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-100">
            {value}
          </p>
        </div>

        <i
          className={`ti ${icon} text-3xl ${color}`}
          aria-hidden="true"
        />
      </div>
    </Card>
  );
}




// ── MAIN COMPONENT ───────────────────────────────────────────
export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);

  const [severityData, setSeverityData] = useState([]);

  const [vendorData, setVendorData] = useState([]);

  const [cweData, setCweData] = useState([]);

  const [epssStats, setEpssStats] = useState(null);

  const [threatStats, setThreatStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const criticalCount =
  dashboard?.severity_distribution?.find(
    item => item.key === "CRITICAL"
  )?.doc_count || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {

        const [
          dashboardRes,
          severityRes,
          vendorRes,
          cweRes,
          epssRes,
          threatRes
        ] = await Promise.all([
          getDashboardAnalytics(),
          getSeverityAnalytics(),
          getVendorAnalytics(),
          getTopCweAnalytics(),
          getEpssAnalytics(),
          getThreatScoreAnalytics()
        ]);

        setDashboard(dashboardRes.data);

        setSeverityData(
          severityRes.data.map(item => ({
            name: item.severity,
            value: item.count
          }))
        );

        setVendorData(
          vendorRes.data
            .slice(0, 10)
            .map(item => ({
              name: item.vendor,
              value: item.count
            }))
        );

        setCweData(
          cweRes.data
            .slice(0, 10)
            .map(item => ({
              name: item.cwe,
              value: item.count
            }))
        );

        setEpssStats(epssRes.data);

        setThreatStats(threatRes.data);

      } catch (err) {

        console.error(err);

        setError("Could not load analytics data.");

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


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <StatCard
          title="Total Vulnerabilities"
          value={dashboard?.total_vulnerabilities ?? "-"}
          icon="ti-shield"
          color="text-cyan-400"
        />

        <StatCard
          title="Critical CVEs"
          value={criticalCount}
          icon="ti-alert-triangle"
          color="text-red-400"
        />

        <StatCard
          title="Average EPSS"
          value={
            dashboard?.average_epss
              ? dashboard.average_epss.toFixed(3)
              : "-"
          }
          icon="ti-percentage"
          color="text-yellow-400"
        />

        <StatCard
          title="Avg Threat Score"
          value={
            dashboard?.average_threat_score
              ? dashboard.average_threat_score.toFixed(1)
              : "-"
          }
          icon="ti-flame"
          color="text-orange-400"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Severity distribution"
          icon="ti-chart-pie"
          loading={loading}
        >
          <PieChart
            data={severityData}
            colors={SEVERITY_COLORS}
          />
        </ChartCard>

        <ChartCard
          title="Top 10 vendors"
          icon="ti-building"
          loading={loading}
        >

          <>
            <HorizontalBarChart
              data={vendorData}
              color="#3b82f6"
              tooltipLabel="Vulnerabilities"
            />

            <p className="mt-3 text-xs text-slate-500">
              Showing the 10 vendors with the highest number of affected vulnerabilities.
            </p>
          </>


        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Top 10 CWEs"
          icon="ti-code"
          loading={loading}
        >
        
        <>
          <HorizontalBarChart
            data={cweData}
            color="#a78bfa"
            tooltipLabel="Affected CVEs"
          />

          <p className="mt-3 text-xs text-slate-500">
            Showing the 10 most common weakness categories across all indexed vulnerabilities.
          </p>
        </>



        </ChartCard>

        <Card title="EPSS Statistics" icon="ti-percentage">
          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Average</span>
              <span className="font-semibold">
                {epssStats?.average?.toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Maximum</span>
              <span className="font-semibold text-green-400">
                {epssStats?.maximum?.toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Minimum</span>
              <span className="font-semibold text-red-400">
                {epssStats?.minimum?.toFixed(5)}
              </span>
            </div>

          </div>
        </Card>




        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <Card title="Threat Score Statistics" icon="ti-flame">

            <div className="space-y-4">

              <div className="flex justify-between">
                <span>Average</span>
                <span className="font-semibold">
                  {threatStats?.average?.toFixed(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Maximum</span>
                <span className="font-semibold text-green-400">
                  {threatStats?.maximum?.toFixed(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Minimum</span>
                <span className="font-semibold text-red-400">
                  {threatStats?.minimum?.toFixed(1)}
                </span>
              </div>

            </div>

          </Card>

        </div>
        
      </div>
    </div>
  );
}