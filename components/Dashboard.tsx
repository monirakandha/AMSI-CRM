import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Shield, CheckCircle, CreditCard, FileText } from 'lucide-react';
import { Customer, Ticket, Invoice, InvoiceStatus } from '../types';

interface DashboardProps {
  customers: Customer[];
  tickets: Ticket[];
  invoices: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ customers, tickets, invoices }) => {
  const totalRevenue = customers.reduce((acc, curr) => acc + curr.contractValue, 0);
  const openTickets = tickets.filter(t => t.status !== 'Resolved').length;
  const criticalTickets = tickets.filter(t => t.priority === 'Critical' || t.priority === 'High').length;
  const activeSystems = customers.reduce((acc, c) => acc + c.systems.length, 0);

  // New Metrics
  const activeSubscriptions = customers.filter(c => c.contractValue > 0).length;
  const overdueInvoicesCount = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;

  const data = [
    { name: 'Mon', alarms: 4, service: 2 },
    { name: 'Tue', alarms: 3, service: 5 },
    { name: 'Wed', alarms: 7, service: 3 },
    { name: 'Thu', alarms: 2, service: 4 },
    { name: 'Fri', alarms: 5, service: 6 },
    { name: 'Sat', alarms: 8, service: 1 },
    { name: 'Sun', alarms: 1, service: 0 },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Operational Overview</h2>
          <p className="text-slate-500 mt-1">Real-time business intelligence for alarm monitoring.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Live Monitoring
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Monthly Recurring Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+5.2%" 
          color="blue" 
        />
        <StatCard 
          title="Active Subscriptions" 
          value={activeSubscriptions.toString()} 
          icon={CreditCard} 
          trend="Stable" 
          color="indigo" 
        />
        <StatCard 
          title="Active Systems" 
          value={activeSystems.toString()} 
          icon={Shield} 
          trend="+2 new" 
          color="purple" 
        />
        <StatCard 
          title="Open Tickets" 
          value={openTickets.toString()} 
          icon={AlertTriangle} 
          trend={openTickets > 5 ? "High Load" : "Normal"} 
          color={openTickets > 5 ? "amber" : "green"} 
        />
        <StatCard 
          title="Avg Resolution Time" 
          value="4.2h" 
          icon={CheckCircle} 
          trend="-12%" 
          color="emerald" 
        />
        <StatCard 
          title="Overdue Invoices" 
          value={overdueInvoicesCount.toString()} 
          icon={FileText} 
          trend={overdueInvoicesCount > 0 ? "Action Needed" : "All Clear"} 
          color={overdueInvoicesCount > 0 ? "red" : "slate"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Alarm Events vs Service Calls</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAlarms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="alarms" stroke="#ef4444" fillOpacity={1} fill="url(#colorAlarms)" name="Alarm Triggers" strokeWidth={2} />
                <Area type="monotone" dataKey="service" stroke="#3b82f6" fillOpacity={1} fill="url(#colorService)" name="Service Calls" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">System Status Distribution</h3>
          <div className="h-80 flex flex-col justify-center">
            {/* Simple distribution viz since we don't need a full pie chart for this simple breakdown */}
            <div className="space-y-6">
                <StatusRow label="Armed (Away/Stay)" count={customers.reduce((acc, c) => acc + c.systems.filter(s => s.status.includes('Armed')).length, 0)} total={activeSystems} color="bg-green-500" />
                <StatusRow label="Disarmed" count={customers.reduce((acc, c) => acc + c.systems.filter(s => s.status === 'Disarmed').length, 0)} total={activeSystems} color="bg-slate-400" />
                <StatusRow label="Trouble Condition" count={customers.reduce((acc, c) => acc + c.systems.filter(s => s.status === 'Trouble').length, 0)} total={activeSystems} color="bg-amber-500" />
                <StatusRow label="Offline/Error" count={customers.reduce((acc, c) => acc + c.systems.filter(s => s.status === 'Offline').length, 0)} total={activeSystems} color="bg-red-500" />
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">AI Insight</p>
                        <p className="text-xs text-slate-500 mt-1">Trouble signals increased by 15% this week. Most common issue: Low Battery (likely due to cold weather snap).</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: any; trend: string; color: string }> = ({ title, value, icon: Icon, trend, color }) => {
    const colorClasses: {[key: string]: string} = {
        blue: 'text-blue-600 bg-blue-100',
        indigo: 'text-indigo-600 bg-indigo-100',
        purple: 'text-purple-600 bg-purple-100',
        amber: 'text-amber-600 bg-amber-100',
        green: 'text-green-600 bg-green-100',
        emerald: 'text-emerald-600 bg-emerald-100',
        red: 'text-red-600 bg-red-100',
        slate: 'text-slate-600 bg-slate-100',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
                <p className={`text-xs font-medium mt-2 ${trend.startsWith('+') ? 'text-green-600' : trend === 'Action Needed' ? 'text-red-600' : 'text-slate-500'}`}>
                    {trend} {trend !== 'Action Needed' && trend !== 'Stable' && trend !== 'All Clear' ? 'from last month' : ''}
                </p>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color] || 'text-slate-600 bg-slate-100'}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

const StatusRow: React.FC<{label: string, count: number, total: number, color: string}> = ({label, count, total, color}) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500">{count} ({Math.round(percentage)}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

export default Dashboard;