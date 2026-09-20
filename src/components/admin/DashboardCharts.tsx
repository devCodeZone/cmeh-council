"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { APPLICATION_STATUS_LABELS } from "@/lib/utils";

const COLORS = ["#0b5d52", "#c99a3a", "#2563eb", "#b8860b", "#1f8a4c", "#b3261e", "#64748b"];

export function RegistrationsTrendChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0b5d52" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#0b5d52" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e9e7" />
        <XAxis dataKey="day" fontSize={11} tickFormatter={(v) => v.slice(5)} />
        <YAxis fontSize={11} allowDecimals={false} />
        <Tooltip />
        <Area type="monotone" dataKey="count" stroke="#0b5d52" fill="url(#colorCount)" strokeWidth={2} name="Registrations" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusBreakdownChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({ name: APPLICATION_STATUS_LABELS[d.status] || d.status, value: d.count }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(entry) => entry.name}>
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
