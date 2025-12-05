import React, { useState } from 'react';
import { Quote, QuoteStatus, Customer, Product, InvoiceItem, Invoice, InvoiceStatus } from '../types';
import { Search, FileBarChart, Plus, Calendar, User, Trash2, DollarSign, Send, CheckCircle, XCircle, FileCheck, AlertCircle } from 'lucide-react';

interface QuoteListProps {
  quotes: Quote[];
  customers: Customer[];
  products: Product[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setActiveTab: (tab: string) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ quotes, customers, products, setQuotes, setInvoices, setActiveTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuote, setNewQuote] = useState<{
    customerId: string;
    items: Partial<InvoiceItem>[];
    expiryDate: string;
    notes: string;
  }>({
    customerId: '',
    items: [],
    expiryDate: '',
    notes: ''
  });

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.ACCEPTED: return 'bg-green-100 text-green-700 border-green-200';
      case QuoteStatus.SENT: return 'bg-blue-100 text-blue-700 border-blue-200';
      case QuoteStatus.REJECTED: return 'bg-red-100 text-red-700 border-red-200';
      case QuoteStatus.DRAFT: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAddItem = () => {
    setNewQuote(prev => ({
        ...prev,
        items: [...prev.items, { id: Math.random().toString(), quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...newQuote.items];
    const item = updatedItems[index];

    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            item.productId = product.id;
            item.productName = product.name;
            item.unitPrice = product.price;
        }
    } else {
        (item as any)[field] = value;
    }

    if (item.quantity && item.unitPrice) {
        item.total = item.quantity * item.unitPrice;
    }

    setNewQuote(prev => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveItem = (index: number) => {
    setNewQuote(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = newQuote.items.reduce((acc, item) => acc + (item.total || 0), 0);
    const tax = subtotal * 0.08; 
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleCreateQuote = () => {
    if (!newQuote.customerId) return;
    
    const customer = customers.find(c => c.id === newQuote.customerId);
    const totals = calculateTotals();
    
    const quote: Quote = {
        id: `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        customerId: newQuote.customerId,
        customerName: customer?.name || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        expiryDate: newQuote.expiryDate,
        items: newQuote.items as InvoiceItem[],
        subtotal: totals.subtotal,
        tax: totals.tax,
        totalAmount: totals.total,
        status: QuoteStatus.DRAFT,
        notes: newQuote.notes
    };

    setQuotes(prev => [quote, ...prev]);
    setIsModalOpen(false);
    setNewQuote({ customerId: '', items: [], expiryDate: '', notes: '' });
  };

  const handleApproveQuote = (quote: Quote) => {
      if (confirm(`Mark quote ${quote.id} as Accepted?`)) {
          setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: QuoteStatus.ACCEPTED } : q));
      }
  };

  const handleRejectQuote = (quote: Quote) => {
      const reason = window.prompt("Please enter reason for requesting changes/rejection:");
      if (reason === null) return; // Cancelled
      
      setQuotes(prev => prev.map(q => q.id === quote.id ? { 
          ...q, 
          status: QuoteStatus.REJECTED,
          notes: q.notes ? `${q.notes}\n[Changes Requested ${new Date().toLocaleDateString()}]: ${reason}` : `[Changes Requested ${new Date().toLocaleDateString()}]: ${reason}`
      } : q));
  };

  const handleConvertToInvoice = (quote: Quote) => {
    if (confirm(`Convert quote ${quote.id} to an invoice?`)) {
        const newInvoice: Invoice = {
            id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            customerId: quote.customerId,
            customerName: quote.customerName,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 14 days
            items: quote.items,
            subtotal: quote.subtotal,
            tax: quote.tax,
            totalAmount: quote.totalAmount,
            status: InvoiceStatus.DRAFT
        };

        setInvoices(prev => [newInvoice, ...prev]);
        setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: QuoteStatus.ACCEPTED } : q));
        
        // Navigate to invoices tab
        setActiveTab('invoices');
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Quotes & Proposals</h2>
          <p className="text-slate-500 mt-1">Manage customer estimates and project proposals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> Create Quote
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search quotes by ID or customer..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FFB600] focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">Quote ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{quote.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{quote.customerName}</td>
                  <td className="px-6 py-4 text-slate-500">{quote.date}</td>
                  <td className="px-6 py-4 text-slate-500">{quote.expiryDate}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">${quote.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                        {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        {quote.status !== QuoteStatus.ACCEPTED && quote.status !== QuoteStatus.REJECTED && (
                            <>
                                <button 
                                    onClick={() => handleApproveQuote(quote)}
                                    className="text-slate-400 hover:text-green-600 p-1" 
                                    title="Approve Quote"
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <button 
                                    onClick={() => handleRejectQuote(quote)}
                                    className="text-slate-400 hover:text-red-600 p-1" 
                                    title="Request Changes / Reject"
                                >
                                    <XCircle size={16} />
                                </button>
                            </>
                        )}
                        {quote.status === QuoteStatus.ACCEPTED && (
                            <button 
                                onClick={() => handleConvertToInvoice(quote)}
                                className="text-blue-500 hover:text-blue-700 p-1 font-medium text-xs border border-blue-200 rounded px-2 bg-blue-50" 
                                title="Convert to Invoice"
                            >
                                Convert to Invoice
                            </button>
                        )}
                        <button className="text-slate-400 hover:text-blue-600 p-1" title="Send Email">
                            <Send size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileBarChart className="text-[#FFB600]" /> New Quote
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select 
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none bg-white"
                                    onChange={(e) => setNewQuote(prev => ({...prev, customerId: e.target.value}))}
                                    value={newQuote.customerId}
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                    onChange={(e) => setNewQuote(prev => ({...prev, expiryDate: e.target.value}))}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Notes / Scope</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm h-20 focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none resize-none"
                            placeholder="Describe project scope or special conditions..."
                            onChange={(e) => setNewQuote(prev => ({...prev, notes: e.target.value}))}
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-1/2">Product / Service</th>
                                    <th className="px-4 py-3 w-24 text-center">Qty</th>
                                    <th className="px-4 py-3 w-32 text-right">Price</th>
                                    <th className="px-4 py-3 w-32 text-right">Total</th>
                                    <th className="px-4 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {newQuote.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2">
                                            <select 
                                                className="w-full p-2 border border-slate-200 rounded focus:border-[#FFB600] outline-none text-sm"
                                                value={item.productId || ''}
                                                onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                                            >
                                                <option value="">Select Item...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full p-2 border border-slate-200 rounded focus:border-[#FFB600] outline-none text-center"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right text-slate-600">
                                            ${(item.unitPrice || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium text-slate-800">
                                            ${(item.total || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button 
                                                onClick={() => handleRemoveItem(idx)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-3 bg-slate-50 border-t border-slate-200">
                            <button 
                                onClick={handleAddItem}
                                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Line Item
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Tax (8%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-800 font-bold text-lg pt-3 border-t border-slate-200">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateQuote}
                        disabled={!newQuote.customerId || newQuote.items.length === 0}
                        className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <DollarSign size={18} /> Save Quote
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuoteList;