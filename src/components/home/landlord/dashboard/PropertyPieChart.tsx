// components/PropertyPieChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0369a1', '#075985', '#0ea5e9', '#7dd3fc'];

export const PropertyPieChart = ({ data }: { data: { name: string; value: number }[] }) => (
  <div className="bg-white p-4 rounded-lg shadow h-[300px]">
    <h3 className="font-medium mb-4">Property Status</h3>
    <ResponsiveContainer width="100%" height="90%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} properties`, ""]}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);