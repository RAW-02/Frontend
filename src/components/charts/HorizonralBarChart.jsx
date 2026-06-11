import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
  } from "recharts";
  
  export default function HorizontalBarChart({ data = [], color = "#3b82f6", height = 240 }) {
    if (!data.length) return null;
  
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <YAxis
            dataKey="name"
            type="category"
            width={72}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
  
          <XAxis
            type="number"
            hide
          />
  
          <Tooltip
            contentStyle={{
              backgroundColor : "#1e293b",
              border          : "1px solid #334155",
              borderRadius    : "8px",
              fontSize        : "12px",
              color           : "#f1f5f9",
            }}
            formatter={(value) => [value.toLocaleString(), "Count"]}
            cursor={{ fill: "#ffffff08" }}
          />
  
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
  
        </BarChart>
      </ResponsiveContainer>
    );
  }