import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HorizontalBarChart({
  data = [],
  color = "#3b82f6",
  height = 240,
}) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
        barCategoryGap={18}
      >
        <YAxis
          dataKey="name"
          type="category"
          width={90}
          tick={{
            fill: "#94a3b8",
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
        />

        <XAxis
          type="number"
          hide
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            color: "#f8fafc",
            fontSize: "13px",
          }}
          formatter={(value) => [
            Number(value).toLocaleString(),
            "Count",
          ]}
          cursor={{ fill: "rgba(255,255,255,.04)" }}
        />

        <Bar
          dataKey="value"
          fill={color}
          radius={[8, 8, 8, 8]}
          maxBarSize={16}
          animationDuration={900}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}