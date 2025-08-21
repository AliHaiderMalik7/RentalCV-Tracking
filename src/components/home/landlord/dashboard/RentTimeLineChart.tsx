import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  } from 'recharts';
  import { payments } from '../../../../../utils/data';
  
  export const RentTimelineChart = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4">Rent Collection Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={payments} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {/* Grid for readability */}
            <CartesianGrid strokeDasharray="3 3" />
  
            {/* Axes */}
            <XAxis dataKey="month" />
            <YAxis />
  
            {/* Tooltip */}
            <Tooltip
              formatter={(value: number) => [`£${value.toLocaleString()}`, "Rent Collected"]}
              contentStyle={{ backgroundColor: "#f9fafb", borderRadius: "0.5rem", borderColor: "#e5e7eb" }}
            />
  
            {/* Optional: Legend */}
            <Legend verticalAlign="top" height={36} />
  
            {/* Area with gradient */}
            <defs>
              <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0369a1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0369a1" stopOpacity={0.1} />
              </linearGradient>
            </defs>
  
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0369a1"
              fillOpacity={1}
              fill="url(#colorRent)"
              dot={{ r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };
  