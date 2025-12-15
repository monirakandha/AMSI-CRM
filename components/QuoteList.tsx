import React, { useState } from 'react';
import { Quote, QuoteStatus, Customer, Product, InvoiceItem, Invoice, InvoiceStatus } from '../types';
import { Search, FileBarChart, Plus, Calendar, User, Trash2, DollarSign, Send, CheckCircle, XCircle, FileCheck, AlertCircle, Eye, Edit, X, UserPlus, Save, AlertTriangle } from 'lucide-react';

interface QuoteListProps {
  quotes: Quote[];
  customers: Customer[];
  products: Product[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setActiveTab: (tab: string) => void;
  onNavigateToCustomer?: (customerId: string, tab: string) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ quotes, customers, products, setQuotes, setCustomers, setInvoices, setActiveTab, onNavigateToCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Rejection Modal State
  const [rejectingQuote, setRejectingQuote] = useState<Quote | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // New Quote State
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

  // Quick Add Customer State
  const [newCustomerForm, setNewCustomerForm] = useState({
      name: '',
      email: '',
      phone: '',
      address: ''
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

  const handleOpenCreateModal = (e?: React.MouseEvent) => {
      if (e) {
          e.preventDefault();
          e.stopPropagation();
      }
      setEditingId(null);
      setNewQuote({ customerId: '', items: [], expiryDate: '', notes: '' });
      setIsModalOpen(true);
  };

  const handleEditQuote = (e: React.MouseEvent, quote: Quote) => {
      e.stopPropagation();
      setEditingId(quote.id);
      setNewQuote({
          customerId: quote.customerId,
          items: quote.items.map(item => ({...item})), // Deep copy
          expiryDate: quote.expiryDate,
          notes: quote.notes || ''
      });
      setIsModalOpen(true);
      setViewQuote(null); // Close view modal if open
  };

  const handleSaveQuote = () => {
    if (!newQuote.customerId) return;
    
    const customer = customers.find(c => c.id === newQuote.customerId);
    const totals = calculateTotals();

    if (editingId) {
        // Update existing quote
        setQuotes(prev => prev.map(q => q.id === editingId ? {
            ...q,
            customerId: newQuote.customerId,
            customerName: customer?.name || 'Unknown',
            expiryDate: newQuote.expiryDate,
            items: newQuote.items as InvoiceItem[],
            subtotal: totals.subtotal,
            tax: totals.tax,
            totalAmount: totals.total,
            notes: newQuote.notes
        } : q));
    } else {
        // Create new quote
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
    }
    
    setIsModalOpen(false);
    setNewQuote({ customerId: '', items: [], expiryDate: '', notes: '' });
    setEditingId(null);
  };

  const handleSaveNewCustomer = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!newCustomerForm.name) return;

      const newId = `CUST-${Math.floor(Math.random() * 10000)}`;
      const newCustomer: Customer = {
          id: newId,
          name: newCustomerForm.name,
          email: newCustomerForm.email,
          phone: newCustomerForm.phone,
          address: newCustomerForm.address,
          contractValue: 0,
          systems: [],
          notes: '',
          noteHistory: []
      };

      setCustomers(prev => [...prev, newCustomer]);
      setNewQuote(prev => ({ ...prev, customerId: newId })); // Auto-select new customer
      setIsAddCustomerModalOpen(false);
      setNewCustomerForm({ name: '', email: '', phone: '', address: '' });
  };

  const handleApproveQuote = (e: React.MouseEvent, quote: Quote) => {
      e.stopPropagation();
      // Directly update status without confirm dialog for better UX
      const updatedQuote = { ...quote, status: QuoteStatus.ACCEPTED };
      setQuotes(prev => prev.map(q => q.id === quote.id ? updatedQuote : q));
      
      // Explicitly update the view state if this quote is currently being viewed
      if (viewQuote?.id === quote.id) {
          setViewQuote(updatedQuote);
      }
  };

  const handleInitiateReject = (e: React.MouseEvent, quote: Quote) => {
      e.preventDefault();
      e.stopPropagation();
      setRejectingQuote(quote);
      setRejectionReason('');
  };

  const handleConfirmRejection = () => {
      if (!rejectingQuote) return;

      const reason = rejectionReason || "No reason provided";
      const updatedNotes = rejectingQuote.notes 
        ? `${rejectingQuote.notes}\n[Changes Requested ${new Date().toLocaleDateString()}]: ${reason}` 
        : `[Changes Requested ${new Date().toLocaleDateString()}]: ${reason}`;
      
      const updatedQuote = { 
          ...rejectingQuote, 
          status: QuoteStatus.REJECTED,
          notes: updatedNotes
      };
      
      setQuotes(prev => prev.map(q => q.id === rejectingQuote.id ? updatedQuote : q));
      
      // Update the modal view if it's currently open so user sees the change
      if (viewQuote?.id === rejectingQuote.id) {
          setViewQuote(updatedQuote);
      }

      // Close rejection modal
      setRejectingQuote(null);
      setRejectionReason('');
  };

  const handleSendQuote = (e: React.MouseEvent, quote: Quote) => {
      e.stopPropagation();
      if (confirm(`Send quote ${quote.id} to customer?`)) {
          const updatedQuote = { ...quote, status: QuoteStatus.SENT };
          setQuotes(prev => prev.map(q => q.id === quote.id ? updatedQuote : q));
          if (viewQuote?.id === quote.id) {
              setViewQuote(updatedQuote);
          }
          alert(`Quote ${quote.id} marked as Sent.`);
      }
  };

  const handleConvertToInvoice = (e: React.MouseEvent, quote: Quote) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create new invoice object
    const newInvoice: Invoice = {
        id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        customerId: quote.customerId,
        customerName: quote.customerName,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 14 days
        items: quote.items.map(item => ({...item})), // Deep copy items
        subtotal: quote.subtotal,
        tax: quote.tax,
        totalAmount: quote.totalAmount,
        status: InvoiceStatus.DRAFT
    };

    const updatedQuote = { ...quote, status: QuoteStatus.ACCEPTED };

    // Update state in parent
    setInvoices(prev => [newInvoice, ...prev]);
    setQuotes(prev => prev.map(q => q.id === quote.id ? updatedQuote : q));
    
    // Close modal if open
    setViewQuote(null);
    
    // Navigate immediately - React state updates will be batched or processed by parent
    setActiveTab('invoices');
  };

  const { subtotal, tax, total } = calculateTotals();

  const filteredQuotes = quotes.filter(quote => 
    quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Quotes & Proposals</h2>
          <p className="text-slate-500 mt-1">Manage customer estimates and project proposals.</p>
        </div>
        <button 
          type="button"
          onClick={handleOpenCreateModal}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50 transition-colors cursor-default">
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
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                         <button 
                            type="button"
                            onClick={() => setViewQuote(quote)}
                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white px-2 py-1 rounded text-xs font-medium transition-colors" 
                            title="View Details"
                        >
                            <Eye size={14} /> View
                        </button>
                        
                        {(quote.status === QuoteStatus.ACCEPTED || quote.status === QuoteStatus.SENT) && (
                            <button 
                                type="button"
                                onClick={(e) => handleConvertToInvoice(e, quote)}
                                className="flex items-center gap-1 text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 bg-blue-50 px-2 py-1 rounded text-xs font-medium transition-colors" 
                                title="Convert to Invoice"
                            >
                                <FileCheck size={14} /> Convert
                            </button>
                        )}

                        {(quote.status === QuoteStatus.DRAFT || quote.status === QuoteStatus.SENT || quote.status === QuoteStatus.REJECTED) && (
                            <button 
                                type="button"
                                onClick={(e) => handleEditQuote(e, quote)}
                                className="flex items-center gap-1 text-slate-600 hover:text-amber-600 border border-slate-200 hover:border-amber-200 bg-white px-2 py-1 rounded text-xs font-medium transition-colors" 
                                title="Edit Quote"
                            >
                                <Edit size={14} /> Edit
                            </button>
                        )}

                        {(quote.status === QuoteStatus.SENT || quote.status === QuoteStatus.DRAFT) && (
                            <>
                                <button 
                                    type="button"
                                    onClick={(e) => handleApproveQuote(e, quote)}
                                    className="flex items-center gap-1 text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 bg-green-50 px-2 py-1 rounded text-xs font-medium transition-colors" 
                                    title="Mark Accepted"
                                >
                                    <CheckCircle size={14} /> Accept
                                </button>
                                <button 
                                    type="button"
                                    onClick={(e) => handleInitiateReject(e, quote)}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-red-50 px-2 py-1 rounded text-xs font-medium transition-colors" 
                                    title="Reject"
                                >
                                    <XCircle size={14} /> Reject
                                </button>
                            </>
                        )}
                        {quote.status === QuoteStatus.DRAFT && (
                            <button 
                                type="button"
                                onClick={(e) => handleSendQuote(e, quote)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50 px-2 py-1 rounded text-xs font-medium transition-colors" 
                                title="Mark as Sent"
                            >
                                <Send size={14} /> Send
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
               {filteredQuotes.length === 0 && (
                  <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                          No quotes found matching "{searchTerm}"
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Quote Detail Modal */}
      {viewQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-slate-800">Quote Details</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(viewQuote.status)}`}>
                                {viewQuote.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-mono">{viewQuote.id}</p>
                    </div>
                    <button onClick={() => setViewQuote(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-white">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Customer</p>
                            <p className="text-lg font-bold text-slate-800">{viewQuote.customerName}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                {customers.find(c => c.id === viewQuote.customerId)?.email}
                            </p>
                            <p className="text-sm text-slate-500">
                                {customers.find(c => c.id === viewQuote.customerId)?.address}
                            </p>
                        </div>
                        <div className="text-right">
                             <div className="mb-2">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Date Created</p>
                                <p className="text-slate-800 font-medium">{viewQuote.date}</p>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Expiry Date</p>
                                <p className="text-red-600 font-medium">{viewQuote.expiryDate}</p>
                             </div>
                        </div>
                    </div>

                    {viewQuote.notes && (
                        <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                             <p className="text-xs font-bold text-slate-400 uppercase mb-2">Project Notes</p>
                             <p className="text-sm text-slate-600 whitespace-pre-wrap">{viewQuote.notes}</p>
                        </div>
                    )}

                    <table className="w-full text-left text-sm mb-6">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Product / Service</th>
                                <th className="px-4 py-3 text-center">Qty</th>
                                <th className="px-4 py-3 text-right">Unit Price</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {viewQuote.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">${item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Subtotal</span>
                                <span>${viewQuote.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Tax (8%)</span>
                                <span>${viewQuote.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-800 font-bold text-lg pt-3 border-t border-slate-200">
                                <span>Total</span>
                                <span>${viewQuote.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                    <button 
                        onClick={() => setViewQuote(null)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    {(viewQuote.status === QuoteStatus.DRAFT || viewQuote.status === QuoteStatus.SENT) && (
                         <button 
                            type="button"
                            onClick={(e) => handleEditQuote(e, viewQuote)}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Edit size={16} /> Edit
                        </button>
                    )}
                    {(viewQuote.status === QuoteStatus.ACCEPTED || viewQuote.status === QuoteStatus.SENT) && (
                         <button 
                            type="button"
                            onClick={(e) => handleConvertToInvoice(e, viewQuote)}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <FileCheck size={16} /> Convert to Invoice
                        </button>
                    )}
                    {(viewQuote.status === QuoteStatus.SENT || viewQuote.status === QuoteStatus.DRAFT) && (
                        <>
                             <button 
                                type="button"
                                onClick={(e) => handleInitiateReject(e, viewQuote)}
                                className="px-4 py-2 bg-white border border-slate-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                            >
                                Reject
                            </button>
                             <button 
                                type="button"
                                onClick={(e) => handleApproveQuote(e, viewQuote)}
                                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                Accept
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 flex flex-col animate-fade-in">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <div className="p-2 bg-red-50 rounded-full">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Reject Quote</h3>
                </div>
                
                <p className="text-sm text-slate-500 mb-4">
                    Please provide a reason for rejecting quote <span className="font-mono font-bold text-slate-700">{rejectingQuote.id}</span>. This will be recorded in the project notes.
                </p>
                
                <textarea 
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none mb-6"
                    placeholder="e.g. Price is too high, incorrect quantity, customer requested different model..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    autoFocus
                />
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => { setRejectingQuote(null); setRejectionReason(''); }}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmRejection}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Create/Edit Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileBarChart className="text-[#FFB600]" /> {editingId ? 'Edit Quote' : 'New Quote'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
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
                                <button 
                                    onClick={(e) => { e.preventDefault(); setIsAddCustomerModalOpen(true); }}
                                    className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-3 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                                    title="Add New Customer"
                                >
                                    <UserPlus size={18} /> Add Customer
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                    value={newQuote.expiryDate}
                                    onChange={(e) => setNewQuote(prev => ({...prev, expiryDate: e.target.value}))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Notes</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none resize-none"
                            placeholder="Add details about the project..."
                            value={newQuote.notes}
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
                                {newQuote.items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                                            No items added. Click "Add Item" to start.
                                        </td>
                                    </tr>
                                )}
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
                        onClick={handleSaveQuote}
                        disabled={!newQuote.customerId || newQuote.items.length === 0}
                        className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <DollarSign size={18} /> {editingId ? 'Update Quote' : 'Save Quote'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Add New Customer Modal (Nested) */}
      {isAddCustomerModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <UserPlus className="text-[#FFB600]" size={20} /> Add New Customer
                      </h3>
                      <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                          <input 
                              type="text" 
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                              placeholder="e.g. Acme Corp"
                              value={newCustomerForm.name}
                              onChange={(e) => setNewCustomerForm(prev => ({...prev, name: e.target.value}))}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                              <input 
                                  type="email" 
                                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                  placeholder="contact@example.com"
                                  value={newCustomerForm.email}
                                  onChange={(e) => setNewCustomerForm(prev => ({...prev, email: e.target.value}))}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                              <input 
                                  type="tel" 
                                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                  placeholder="(555) 123-4567"
                                  value={newCustomerForm.phone}
                                  onChange={(e) => setNewCustomerForm(prev => ({...prev, phone: e.target.value}))}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                          <input 
                              type="text" 
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                              placeholder="123 Main St, City, State"
                              value={newCustomerForm.address}
                              onChange={(e) => setNewCustomerForm(prev => ({...prev, address: e.target.value}))}
                          />
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button 
                          onClick={() => setIsAddCustomerModalOpen(false)}
                          className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveNewCustomer}
                          disabled={!newCustomerForm.name}
                          className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                          <Save size={18} /> Add Customer
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default QuoteList;