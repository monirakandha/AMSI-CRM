import React, { useState } from 'react';
import { Subscription, SubscriptionStatus, BillingCycle, Customer, Invoice, InvoiceStatus } from '../types';
import { Search, CreditCard, RefreshCw, AlertTriangle, CheckCircle, Plus, Calendar, X, Save } from 'lucide-react';

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  customers: Customer[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, customers, setSubscriptions, setInvoices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBillingRunning, setIsBillingRunning] = useState(false);
  const [newSubscription, setNewSubscription] = useState<Partial<Subscription>>({
      amount: 0,
      billingCycle: BillingCycle.MONTHLY,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date().toISOString().split('T')[0],
      planName: ''
  });

  const handleGenerateInvoices = () => {
      setIsBillingRunning(true);

      // Simulate processing delay for better UX
      setTimeout(() => {
        const activeSubs = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE);
        
        if (activeSubs.length === 0) {
            alert("No active subscriptions found to bill.");
            setIsBillingRunning(false);
            return;
        }

        let createdCount = 0;
        const newInvoices: Invoice[] = [];
        const updatedSubscriptions = [...subscriptions];

        activeSubs.forEach(sub => {
            const customer = customers.find(c => c.id === sub.customerId);
            createdCount++;
            
            // Create Invoice
            newInvoices.push({
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
            });

            // Update Subscription Next Billing Date
            const subIndex = updatedSubscriptions.findIndex(s => s.id === sub.id);
            if (subIndex !== -1) {
                const currentNextBill = new Date(sub.nextBillingDate);
                let nextDate = new Date(currentNextBill);
                
                if (sub.billingCycle === BillingCycle.MONTHLY) nextDate.setMonth(nextDate.getMonth() + 1);
                else if (sub.billingCycle === BillingCycle.QUARTERLY) nextDate.setMonth(nextDate.getMonth() + 3);
                else if (sub.billingCycle === BillingCycle.ANNUALLY) nextDate.setFullYear(nextDate.getFullYear() + 1);
                
                updatedSubscriptions[subIndex] = {
                    ...sub,
                    nextBillingDate: nextDate.toISOString().split('T')[0],
                    lastPaymentStatus: 'Success'
                };
            }
        });
        
        setInvoices(prev => [...newInvoices, ...prev]);
        setSubscriptions(updatedSubscriptions);
        setIsBillingRunning(false);
        alert(`Successfully generated ${createdCount} invoices. Subscription billing dates have been updated.`);
      }, 1000);
  };

  const handleCreateSubscription = () => {
      if (!newSubscription.customerId || !newSubscription.planName || !newSubscription.amount) return;

      const startDate = new Date(newSubscription.startDate || new Date());
      const nextBill = new Date(startDate);
      
      // Simple next billing calculation
      if (newSubscription.billingCycle === BillingCycle.MONTHLY) {
          nextBill.setMonth(nextBill.getMonth() + 1);
      } else if (newSubscription.billingCycle === BillingCycle.QUARTERLY) {
          nextBill.setMonth(nextBill.getMonth() + 3);
      } else if (newSubscription.billingCycle === BillingCycle.ANNUALLY) {
          nextBill.setFullYear(nextBill.getFullYear() + 1);
      }

      const subscription: Subscription = {
          id: `SUB-${Math.floor(Math.random() * 10000)}`,
          customerId: newSubscription.customerId,
          planName: newSubscription.planName,
          amount: Number(newSubscription.amount),
          billingCycle: newSubscription.billingCycle || BillingCycle.MONTHLY,
          startDate: newSubscription.startDate || new Date().toISOString().split('T')[0],
          nextBillingDate: nextBill.toISOString().split('T')[0],
          status: SubscriptionStatus.ACTIVE,
          lastPaymentStatus: 'Success'
      };

      setSubscriptions(prev => [...prev, subscription]);
      setIsAddModalOpen(false);
      setNewSubscription({
          amount: 0,
          billingCycle: BillingCycle.MONTHLY,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date().toISOString().split('T')[0],
          planName: ''
      });
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
      const customer = customers.find(c => c.id === sub.customerId);
      const matchesSearch = 
        (customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
  });

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
                disabled={isBillingRunning}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <RefreshCw size={18} className={isBillingRunning ? "animate-spin" : ""} /> 
                {isBillingRunning ? 'Running...' : 'Run Auto-Billing'}
            </button>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredSubscriptions.map((sub) => {
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
              {filteredSubscriptions.length === 0 && (
                  <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">
                          No subscriptions found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Subscription Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800">New Subscription</h3>
                      <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                          <select 
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={newSubscription.customerId || ''}
                              onChange={(e) => setNewSubscription(prev => ({...prev, customerId: e.target.value}))}
                          >
                              <option value="">Select Customer</option>
                              {customers.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
                          <input 
                              type="text"
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="e.g. Commercial Gold Monitoring"
                              value={newSubscription.planName}
                              onChange={(e) => setNewSubscription(prev => ({...prev, planName: e.target.value}))}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                              <input 
                                  type="number"
                                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  placeholder="0.00"
                                  value={newSubscription.amount}
                                  onChange={(e) => setNewSubscription(prev => ({...prev, amount: Number(e.target.value)}))}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
                              <select 
                                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  value={newSubscription.billingCycle}
                                  onChange={(e) => setNewSubscription(prev => ({...prev, billingCycle: e.target.value as BillingCycle}))}
                              >
                                  {Object.values(BillingCycle).map(cycle => (
                                      <option key={cycle} value={cycle}>{cycle}</option>
                                  ))}
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                          <input 
                              type="date"
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={newSubscription.startDate}
                              onChange={(e) => setNewSubscription(prev => ({...prev, startDate: e.target.value}))}
                          />
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button 
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleCreateSubscription}
                          disabled={!newSubscription.customerId || !newSubscription.planName || !newSubscription.amount}
                          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                          <Save size={18} /> Create Plan
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SubscriptionManager;