// src/pages/Dashboard/index.jsx
import Navbar from '../../components/layout/Navbar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { name: 'Admin', value: 10 },
    { name: 'Supervisor', value: 20 },
    { name: 'QA', value: 15 },
  ];

  const COLORS = ['#2563eb', '#38bdf8', '#fbbf24'];
  const navigate = useNavigate();

  // Pie section click handler
  const handlePieClick = (data, index) => {
    if (data && data.name) {
      navigate(`/role/${data.name.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div
        className="rounded-2xl shadow-2xl border border-blue-100 w-full max-w-xl flex flex-col items-center mx-auto mt-16"
        style={{
          minHeight: '540px',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18), 0 1.5px 8px 0 rgba(59,130,246,0.10)',
          padding: '2.5rem 1.5rem',
          border: '1.5px solid rgba(59,130,246,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Top Center Title */}
        <h2 className="text-2xl font-extrabold mb-2 text-blue-700 text-center tracking-tight w-full">
          User Statistics
        </h2>
        {/* Subtitle Center */}
        <p className="text-gray-500 mb-8 text-center w-full">
          See how your team is distributed by role
        </p>
        {/* Pie Chart Center */}
        <div style={{ width: '220px', margin: '0 auto', marginBottom: '2rem' }}>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={stats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={5}
                startAngle={30}
                endAngle={390}
                stroke="#fff"
                strokeWidth={3}
                style={{
                  filter: 'drop-shadow(0 8px 16px rgba(59,130,246,0.18))',
                  cursor: 'pointer'
                }}
                onClick={handlePieClick}
              >
                {stats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.18))',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend Center */}
        <div
          className="flex items-center justify-center mt-4 mx-auto"
          style={{ width: 'max-content' }}
        >
          {stats.map((s, idx) => (
            <div key={s.name} className="flex items-center gap-2 mx-4">
              <span style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: COLORS[idx % COLORS.length],
                border: '2px solid #fff',
                boxShadow: '0 2px 6px rgba(59,130,246,0.12)'
              }} />
              <span className="text-gray-700 font-medium">{s.name}: <span className="font-bold">{s.value}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}