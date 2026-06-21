import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CHART_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
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
      <span style={{ color: "#94a3b8" }}>{name}: </span>
      <span style={{ fontWeight: 600 }}>{Number(value).toLocaleString()}</span>
    </div>
  );
}

function CustomLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px 16px",
        paddingTop: 10,
      }}
    >
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: entry.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PieChart({
  data = [],
  colors = CHART_COLORS,
  height = 280,
}) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="44%"
          innerRadius={70}
          outerRadius={105}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
          animationDuration={700}
          animationEasing="ease-out"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
