import StatCard from "../components/StatCard";
import Card from "../components/Card";
import SeverityBadge from "../components/SeverityBadge";
import React, { useEffect, useState } from "react";

import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, } from "recharts";

import {getStats, getRecentVulnerabilities, getTopVendors, getTrendData,} from "../services/dashboardService";

function VendorBar({ name, count, max }) {
  const widthPct = Math.round((count / max) * 100);

  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs text-slate-400 w-20 text-right truncate">
        {name}
      </span>
      <div className="flex-1 bg-slate-900 rounded h-2">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-10">
        {count.toLocaleString()}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    exploited: 0,
    pocs: 0,
  });

  const [recentVulns, setRecentVulns] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, recentRes, vendorsRes, trendRes] = await Promise.all([
          getStats(),
          getRecentVulnerabilities(5),
          getTopVendors(5),
          getTrendData(),
        ]);

        setStats(statsRes.data);
        setRecentVulns(recentRes.data);
        setTopVendors(vendorsRes.data);
        setTrendData(trendRes.data);
      } catch (err) {
        console.warn("API unavailable - Check dashboad file", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const maxVendorCount = topVendors.length > 0 ? topVendors[0].count : 0;

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
                <span className="text-sm font-mono text-blue-400">
                  {vuln.id}
                </span>
                <SeverityBadge severity={vuln.severity} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="New CVEs — last 7 days">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={trendData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false} // hide the axis line
                tickLine={false} // hide the tick marks
              />

              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b", // dark background
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                cursor={{ fill: "#ffffff10" }} // subtle hover highlight
              />

              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

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
