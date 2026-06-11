import {
    PieChart as RechartsPie,
    Pie,
    Cell,             // Cell lets us color each slice individually
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";
  
  const CHART_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];
  
  export default function PieChart({ data = [], colors = CHART_COLORS, height = 220 }) {
    if (!data.length) return null;
  
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
  
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
  
          <Tooltip
            contentStyle={{
              backgroundColor : "#1e293b",
              border          : "1px solid #334155",
              borderRadius    : "8px",
              fontSize        : "12px",
              color           : "#f1f5f9",
            }}
            formatter={(value, name) => [`${value}`, name]}
          />
  
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "8px" }}
          />
  
        </RechartsPie>
      </ResponsiveContainer>
    );
  }