import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// PropertyStatusChart.tsx
export const  PropertyStatusChart = ({ properties }) => {
    const statusData = [
      { name: 'Occupied', value: properties?.filter(p => p.status === 'occupied').length },
      { name: 'Vacant', value: properties?.filter(p => p.status === 'vacant').length },
      { name: 'Maintenance', value: properties?.filter(p => p.status === 'maintenance').length },
    ];
  
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4">Property Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%">
              <Cell fill="#0369a1" />
              <Cell fill="#94a3b8" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Legend />
            <Tooltip formatter={(value) => [value, "Properties"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }