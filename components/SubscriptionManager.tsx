
import React from 'react';
import { Subscription, SubscriptionStatus, BillingCycle, Customer, Invoice, InvoiceStatus } from '../types';
import { Search, CreditCard, RefreshCw, AlertTriangle, CheckCircle, Plus, Calendar } from 'lucide-react';

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  customers: Customer[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, customers, setSubscriptions, setInvoices }) => {
  
  const handleGenerateInvoices = () => {
      // Simulate creating invoices for active subs
      const activeSubs = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE);
      let createdCount = 0;

      const newInvoices: Invoice[] = activeSubs.map(sub => {
          const customer = customers.find(c => c.id === sub.customerId);
          createdCount++;
          return {
              id: `INV-AUTO-${Math.floor(Math.random() * 10000)}`,
              customerId: sub.customerId,
              customerName: customer?.name || 'Unknown',
              date: new Date().toISOString().split('T')[0],
              dueDate: new Date().toISOString().split('T')[0], // Due immediately
              status: InvoiceStatus.SENT,
              subtotal: sub.amount,
              tax: sub.amount * 0.08,
              totalAmount: sub.amount * 1.08,
              items: [{
                  id: Math.random().toString(),
                  productId: 'PLAN',
                  productName: `${sub.planName} (${sub.billingCycle})`,
                  quantity: 1,
                  unitPrice: sub.amount,
                  total: sub.amount
              }]
          };
      });
      
      setInvoices(prev => [...newInvoices, ...prev]);
      alert(`Successfully generated ${createdCount} invoices from active subscriptions.`);
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Monitoring Plans</h2>
          <p className="text-slate-500 mt-1">Manage recurring subscriptions and auto-billing.</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={handleGenerateInvoices}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
             >
                <RefreshCw size={18} /> Run Auto-Billing
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                <Plus size={18} /> New Subscription
            </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
               <div>
                   <p className="text-sm text-slate-500 font-medium">Monthly Recurring Revenue</p>
                   <p className="text-2xl font-bold text-slate-800">
                       ${subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).reduce((acc, s) => acc + s.amount, 0).toLocaleString()}
                   </p>
               </div>
               <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                   <CreditCard size={24} />
               </div>
          </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
               <div>
                   <p className="text-sm text-slate-500 font-medium">Active Plans</p>
                   <p className="text-2xl font-bold text-slate-800">
                       {subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length}
                   </p>
               </div>
               <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                   <CheckCircle size={24} />
               </div>
          </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
               <div>
                   <p className="text-sm text-slate-500 font-medium">Failed Payments</p>
                   <p className="text-2xl font-bold text-red-600">
                       {subscriptions.filter(s => s.lastPaymentStatus === 'Failed').length}
                   </p>
               </div>
               <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                   <AlertTriangle size={24} />
               </div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by customer or plan name..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Plan Name</th>
                <th className="px-6 py-4">Billing Cycle</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Next Bill Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((sub) => {
                  const customer = customers.find(c => c.id === sub.customerId);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{customer?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-600">{sub.planName}</td>
                        <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">{sub.billingCycle}</span>
                        </td>
                        <td className="px-6 py-4 font-medium">${sub.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                            <Calendar size={14} /> {sub.nextBillingDate}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                sub.status === SubscriptionStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {sub.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                             <span className={`flex items-center gap-1 ${
                                sub.lastPaymentStatus === 'Success' ? 'text-green-600' : 'text-red-600 font-bold'
                            }`}>
                                {sub.lastPaymentStatus === 'Success' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                                {sub.lastPaymentStatus}
                            </span>
                        </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
