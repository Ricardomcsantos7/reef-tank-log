import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

export default function ParameterChart({
  data,
  dataKey,
  title,
  color = "#f97316",
  unit,
  minLimit,
  maxLimit,
  idealMin,
  idealMax,
}) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-slate-100">{title}</h2>

      <div className="w-full h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
            />

            {/* Ideal range (green area) */}
            {idealMin !== undefined && idealMax !== undefined && (
              <ReferenceArea
                y1={idealMin}
                y2={idealMax}
                fill="#22c55e"
                fillOpacity={0.1}
              />
            )}

            {/* Hard limits */}
            {minLimit !== undefined && (
              <ReferenceLine
                y={minLimit}
                stroke="#ef4444"
                strokeDasharray="4 4"
              />
            )}

            {maxLimit !== undefined && (
              <ReferenceLine
                y={maxLimit}
                stroke="#ef4444"
                strokeDasharray="4 4"
              />
            )}

            {/* Data */}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
