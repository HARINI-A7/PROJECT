import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TrafficChart({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(9, 20, 36, 0.85)', border: '1px solid rgba(255,255,255,0.04)', height: '100%' }}>
      <h3 style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px', fontWeight: 700 }}>Hourly Flight Traffic (Last 6 Hours)</h3>
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: '#050D1A', border: '1px solid #1E293B', borderRadius: '8px', fontSize: '13px', color: '#E2E8F0' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
            <Bar dataKey="Arrivals" fill="#00C2FF" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="Departures" fill="#06EDD8" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
