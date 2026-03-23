"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { BarChart3, DollarSign, PieChart, TrendingUp, Users } from "lucide-react";

interface Filing {
  taxYear: number;
  totalRevenue: number | null;
  totalExpenses: number | null;
  totalAssetsEOY: number | null;
  totalLiabilitiesEOY: number | null;
  netAssetsEOY: number | null;
  compensationOfficers: number | null;
  pctOfficerCompensation: number | null;
  employeeCount: number | null;
  volunteerCount: number | null;
  contributionsAndGrants: number | null;
  programServiceRevenue: number | null;
  returnType: string | null;
}

interface Props {
  filings: Filing[];
  orgName: string;
}

function formatCompact(val: number): string {
  if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

function formatTooltip(val: number): string {
  return `$${val.toLocaleString()}`;
}

const TABS = [
  { id: "revenue", label: "Revenue & Expenses", icon: TrendingUp },
  { id: "assets", label: "Assets & Liabilities", icon: BarChart3 },
  { id: "compensation", label: "Officer Compensation", icon: DollarSign },
  { id: "staffing", label: "Staffing", icon: Users },
  { id: "breakdown", label: "Revenue Sources", icon: PieChart },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function IrsOrgCharts({ filings, orgName }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("revenue");

  if (filings.length === 0) return null;

  const chartData = filings.map((f) => ({
    year: String(f.taxYear),
    revenue: f.totalRevenue ?? 0,
    expenses: f.totalExpenses ?? 0,
    assets: f.totalAssetsEOY ?? 0,
    liabilities: f.totalLiabilitiesEOY ?? 0,
    netAssets: f.netAssetsEOY ?? 0,
    officerComp: f.compensationOfficers ?? 0,
    pctOfficerComp: f.pctOfficerCompensation ? +(f.pctOfficerCompensation * 100).toFixed(1) : 0,
    employees: f.employeeCount ?? 0,
    volunteers: f.volunteerCount ?? 0,
    contributions: f.contributionsAndGrants ?? 0,
    programRevenue: f.programServiceRevenue ?? 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-gray-100">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === id
                ? "border-blue-500 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="p-6">
        {activeTab === "revenue" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Expenses Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis tickFormatter={formatCompact} fontSize={12} />
                <Tooltip formatter={(val: number) => formatTooltip(val)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "assets" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Assets, Liabilities & Net Assets</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis tickFormatter={formatCompact} fontSize={12} />
                <Tooltip formatter={(val: number) => formatTooltip(val)} />
                <Legend />
                <Area type="monotone" dataKey="assets" name="Total Assets" stroke="#3b82f6" fill="#3b82f680" />
                <Area type="monotone" dataKey="liabilities" name="Liabilities" stroke="#ef4444" fill="#ef444440" />
                <Area type="monotone" dataKey="netAssets" name="Net Assets" stroke="#10b981" fill="#10b98140" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "compensation" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Officer Compensation</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-2">Total Officer Compensation ($)</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" fontSize={12} />
                    <YAxis tickFormatter={formatCompact} fontSize={12} />
                    <Tooltip formatter={(val: number) => formatTooltip(val)} />
                    <Bar dataKey="officerComp" name="Officer Compensation" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Officer Compensation as % of Expenses</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" fontSize={12} />
                    <YAxis tickFormatter={(v: number) => `${v}%`} fontSize={12} />
                    <Tooltip formatter={(val: number) => `${val}%`} />
                    <Line type="monotone" dataKey="pctOfficerComp" name="% of Expenses" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "staffing" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Employees & Volunteers</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" name="Employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="volunteers" name="Volunteers" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "breakdown" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Sources Breakdown</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis tickFormatter={formatCompact} fontSize={12} />
                <Tooltip formatter={(val: number) => formatTooltip(val)} />
                <Legend />
                <Bar dataKey="contributions" name="Contributions & Grants" fill="#10b981" stackId="rev" />
                <Bar dataKey="programRevenue" name="Program Service Revenue" fill="#3b82f6" stackId="rev" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
