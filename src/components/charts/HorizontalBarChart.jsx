


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";

/** Dynamic Y-axis width based on longest label — never clips vendor names */
function calcYAxisWidth(data) {
  const longest = Math.max(...data.map((d) => String(d.name ?? "").length));
  return Math.min(Math.max(longest * 7 + 12, 80), 190);
}

function CustomTooltip({ active, payload, label, tooltipLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        padding: "8px 12px",
        fontSize: "12px",
        color: "#f8fafc",
        lineHeight: 1.6,
      }}
    >
      <p style={{ color: "#94a3b8", marginBottom: 2 }}>{label}</p>
      <p>
        <span style={{ fontWeight: 600 }}>
          {Number(payload[0].value).toLocaleString()}
        </span>{" "}
        <span style={{ color: "#475569" }}>{tooltipLabel}</span>
      </p>
    </div>
  );
}

export default function HorizontalBarChart({
  data = [],
  color = "#3b82f6",
  tooltipLabel = "Count",
  height = 380,         // fixed default so paired charts are always same height
}) {
  if (!data.length) return null;

  const yAxisWidth = calcYAxisWidth(data);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 52, left: 4, bottom: 4 }}
        barCategoryGap={14}
      >
        <YAxis
          dataKey="name"
          type="category"
          width={yAxisWidth}
          tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "inherit" }}
          axisLine={false}
          tickLine={false}
        />
        <XAxis type="number" hide />

        <Tooltip
          content={<CustomTooltip tooltipLabel={tooltipLabel} />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />

        <Bar
          dataKey="value"
          radius={[0, 6, 6, 0]}
          maxBarSize={14}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {/* Opacity fades by rank — top item is brightest */}
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={color}
              fillOpacity={Math.max(0.4, 1 - i * 0.06)}
            />
          ))}

          {/* Value label to the right of each bar */}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v) => Number(v).toLocaleString()}
            style={{ fill: "#475569", fontSize: 11, fontFamily: "inherit" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
