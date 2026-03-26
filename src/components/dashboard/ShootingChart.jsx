import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { calcFGPct, filterEventsByTime } from "@/lib/statUtils";

export default function ShootingChart({ events }) {
  const last5 = parseFloat(calcFGPct(filterEventsByTime(events, 5)));
  const wholeGame = parseFloat(calcFGPct(events));

  const data = [
    { name: "Last 5 Min", value: last5 },
    { name: "Whole Game", value: wholeGame },
  ];

  const colors = ["hsl(38, 92%, 50%)", "hsl(200, 80%, 50%)"];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-4">
        Shooting Trend (FG%)
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 12, fontSize: 12 }}
              formatter={(val) => [`${val}%`, "FG%"]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}