import React, { useState } from 'react';
import { Invoice, InvoiceStatus, Customer, Product, InvoiceItem } from '../types';
import { Search, FileText, Plus, Calendar, User, Trash2, DollarSign, Download, Send, Eye, Edit, X, CheckCircle, AlertCircle, XCircle, UserPlus, Save } from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, customers, products, setInvoices, setCustomers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newInvoice, setNewInvoice] = useState<{
    customerId: string;
    items: Partial<InvoiceItem>[];
    dueDate: string;
    date: string;
  }>({
    customerId: '',
    items: [],
    dueDate: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Quick Add Customer State
  const [newCustomerForm, setNewCustomerForm] = useState({
      name: '',
      email: '',
      phone: '',
      address: ''
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-700 border-green-200';
      case InvoiceStatus.SENT: return 'bg-blue-100 text-blue-700 border-blue-200';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
      case InvoiceStatus.DRAFT: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAddItem = () => {
    setNewInvoice(prev => ({
        ...prev,
        items: [...prev.items, { id: Math.random().toString(), quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...newInvoice.items];
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

    // Recalculate total for line item
    if (item.quantity && item.unitPrice) {
        item.total = item.quantity * item.unitPrice;
    }

    setNewInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveItem = (index: number) => {
    setNewInvoice(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = newInvoice.items.reduce((acc, item) => acc + (item.total || 0), 0);
    const tax = subtotal * 0.08; // 8% tax mock
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setNewInvoice({ 
        customerId: '', 
        items: [], 
        dueDate: '', 
        date: new Date().toISOString().split('T')[0] 
    });
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
      setEditingId(invoice.id);
      setNewInvoice({
          customerId: invoice.customerId,
          items: invoice.items.map(item => ({...item})), // Deep copy
          dueDate: invoice.dueDate,
          date: invoice.date
      });
      setIsModalOpen(true);
      setViewInvoice(null);
  };

  const handleSaveInvoice = () => {
    if (!newInvoice.customerId) return;
    
    const customer = customers.find(c => c.id === newInvoice.customerId);
    const totals = calculateTotals();
    
    if (editingId) {
        // Update existing invoice
        setInvoices(prev => prev.map(inv => inv.id === editingId ? {
            ...inv,
            customerId: newInvoice.customerId,
            customerName: customer?.name || 'Unknown',
            dueDate: newInvoice.dueDate,
            date: newInvoice.date,
            items: newInvoice.items as InvoiceItem[],
            subtotal: totals.subtotal,
            tax: totals.tax,
            totalAmount: totals.total
        } : inv));
    } else {
        // Create new invoice
        const invoice: Invoice = {
            id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            customerId: newInvoice.customerId,
            customerName: customer?.name || 'Unknown',
            date: newInvoice.date,
            dueDate: newInvoice.dueDate,
            items: newInvoice.items as InvoiceItem[],
            subtotal: totals.subtotal,
            tax: totals.tax,
            totalAmount: totals.total,
            status: InvoiceStatus.DRAFT // Default to draft
        };
        setInvoices(prev => [invoice, ...prev]);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setNewInvoice({ customerId: '', items: [], dueDate: '', date: '' });
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
      setNewInvoice(prev => ({ ...prev, customerId: newId })); // Auto-select new customer
      setIsAddCustomerModalOpen(false);
      setNewCustomerForm({ name: '', email: '', phone: '', address: '' });
  };

  const handleMarkAsPaid = (e: React.MouseEvent, invoice: Invoice) => {
    e.preventDefault();
    e.stopPropagation();
    
    setInvoices(prev => prev.map(inv => 
        inv.id === invoice.id ? { ...inv, status: InvoiceStatus.PAID } : inv
    ));
    if (viewInvoice?.id === invoice.id) {
        setViewInvoice(prev => prev ? {...prev, status: InvoiceStatus.PAID} : null);
    }
  };

  const handleMarkAsUnpaid = (e: React.MouseEvent, invoice: Invoice) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to mark Invoice ${invoice.id} as UNPAID?`)) {
        // Use local date for accurate comparison
        const today = new Date();
        const dueDate = new Date(invoice.dueDate);
        const isOverdue = dueDate < today;
        const newStatus = isOverdue ? InvoiceStatus.OVERDUE : InvoiceStatus.SENT;
        
        setInvoices(prev => prev.map(inv => 
            inv.id === invoice.id ? { ...inv, status: newStatus } : inv
        ));
        if (viewInvoice?.id === invoice.id) {
            setViewInvoice(prev => prev ? {...prev, status: newStatus} : null);
        }
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Please allow popups to download PDF");
        return;
    }

    const customer = customers.find(c => c.id === invoice.customerId);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 50px; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9; }
            .logo { font-size: 24px; font-weight: bold; color: #1e293b; display: flex; align-items: center; gap: 10px; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { margin: 0; color: #1e293b; font-size: 32px; letter-spacing: -1px; }
            .invoice-meta { margin-top: 10px; color: #64748b; font-size: 14px; }
            .bill-to { margin-bottom: 40px; }
            .bill-to h3 { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
            .bill-to p { margin: 0 0 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; border-bottom: 2px solid #f1f5f9; padding: 12px 10px; background: #f8fafc; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            td { border-bottom: 1px solid #f1f5f9; padding: 16px 10px; font-size: 14px; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #64748b; }
            .total-final { font-weight: bold; font-size: 18px; color: #1e293b; border-top: 2px solid #1e293b; margin-top: 10px; padding-top: 15px; }
            .footer { margin-top: 80px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #f1f5f9; color: #64748b; margin-top: 10px; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <div class="logo">
                <span>AMSI CRM</span>
              </div>
              <p style="margin-top: 10px; font-size: 14px; color: #64748b;">
                123 Security Blvd<br>Tech City, TC 90210<br>support@amsi.com
              </p>
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <div class="status-badge ${invoice.status === InvoiceStatus.PAID ? 'status-paid' : invoice.status === InvoiceStatus.OVERDUE ? 'status-overdue' : ''}">
                ${invoice.status}
              </div>
              <div class="invoice-meta">
                <p>Invoice #: ${invoice.id}</p>
                <p>Date: ${invoice.date}</p>
                <p>Due Date: ${invoice.dueDate}</p>
              </div>
            </div>
          </div>

          <div class="bill-to">
            <h3>Bill To</h3>
            <p><strong>${invoice.customerName}</strong></p>
            <p>${customer?.address || 'No address on file'}</p>
            <p>${customer?.email || ''}</p>
            <p>${customer?.phone || ''}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th width="50%">Description</th>
                <th style="text-align: center">Qty</th>
                <th style="text-align: right">Unit Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.productName}</strong>
                  </td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: right">$${item.unitPrice.toFixed(2)}</td>
                  <td style="text-align: right">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>$${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Tax (8%)</span>
              <span>$${invoice.tax.toFixed(2)}</span>
            </div>
            <div class="totals-row total-final">
              <span>Total Due</span>
              <span>$${invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Please make checks payable to AMSI Security Systems Inc.</p>
            <p>Questions? Contact us at support@amsi.com or (555) 012-3456</p>
          </div>
          
          <script>
             window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSendEmail = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    alert(`Invoice ${invoice.id} sent to ${customer?.email || 'customer email'}.`);
    
    // Update status to sent if it's draft
    if (invoice.status === InvoiceStatus.DRAFT) {
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? {...inv, status: InvoiceStatus.SENT} : inv));
        if (viewInvoice?.id === invoice.id) {
            setViewInvoice(prev => prev ? {...prev, status: InvoiceStatus.SENT} : null);
        }
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Invoices</h2>
          <p className="text-slate-500 mt-1">Billing history and payment status.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search invoices by ID or customer..." 
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
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date Issued</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{invoice.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{invoice.customerName}</td>
                  <td className="px-6 py-4 text-slate-500">{invoice.date}</td>
                  <td className="px-6 py-4 text-slate-500">{invoice.dueDate}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">${invoice.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button 
                            type="button"
                            onClick={() => setViewInvoice(invoice)}
                            className="flex items-center gap-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-slate-200" 
                            title="View Details"
                        >
                            <Eye size={14} /> View
                        </button>
                        {invoice.status !== InvoiceStatus.PAID && (
                            <button 
                                type="button"
                                onClick={() => handleEditInvoice(invoice)}
                                className="flex items-center gap-1 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-slate-200" 
                                title="Edit Invoice"
                            >
                                <Edit size={14} /> Edit
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={() => handleDownloadPDF(invoice)}
                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-slate-200" 
                            title="Download PDF"
                        >
                            <Download size={14} /> Download
                        </button>
                        
                        {invoice.status !== InvoiceStatus.PAID ? (
                             <button 
                                type="button"
                                onClick={(e) => handleMarkAsPaid(e, invoice)}
                                className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-green-200" 
                                title="Mark as Paid"
                            >
                                <CheckCircle size={14} /> Mark as Paid
                            </button>
                        ) : (
                             <button 
                                type="button"
                                onClick={(e) => handleMarkAsUnpaid(e, invoice)}
                                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-red-200" 
                                title="Mark as Unpaid"
                            >
                                <XCircle size={14} /> Mark Unpaid
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
               {filteredInvoices.length === 0 && (
                  <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                          No invoices found matching "{searchTerm}"
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-slate-800">Invoice Details</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(viewInvoice.status)}`}>
                                {viewInvoice.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-mono">{viewInvoice.id}</p>
                    </div>
                    <button onClick={() => setViewInvoice(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-white">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Bill To</p>
                            <p className="text-lg font-bold text-slate-800">{viewInvoice.customerName}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                {customers.find(c => c.id === viewInvoice.customerId)?.email}
                            </p>
                            <p className="text-sm text-slate-500">
                                {customers.find(c => c.id === viewInvoice.customerId)?.address}
                            </p>
                        </div>
                        <div className="text-right">
                             <div className="mb-2">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Date Issued</p>
                                <p className="text-slate-800 font-medium">{viewInvoice.date}</p>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Due Date</p>
                                <p className="text-red-600 font-medium">{viewInvoice.dueDate}</p>
                             </div>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm mb-6">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Item Description</th>
                                <th className="px-4 py-3 text-center">Qty</th>
                                <th className="px-4 py-3 text-right">Unit Price</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {viewInvoice.items.map((item, idx) => (
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
                                <span>${viewInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Tax (8%)</span>
                                <span>${viewInvoice.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-800 font-bold text-lg pt-3 border-t border-slate-200">
                                <span>Total Due</span>
                                <span>${viewInvoice.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setViewInvoice(null)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    {viewInvoice.status !== InvoiceStatus.PAID ? (
                         <button 
                            type="button"
                            onClick={(e) => handleMarkAsPaid(e, viewInvoice)}
                            className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <CheckCircle size={16} /> Mark Paid
                        </button>
                    ) : (
                         <button 
                            type="button"
                            onClick={(e) => handleMarkAsUnpaid(e, viewInvoice)}
                            className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <XCircle size={16} /> Mark Unpaid
                        </button>
                    )}
                    {viewInvoice.status !== InvoiceStatus.PAID && (
                        <button 
                            type="button"
                            onClick={() => handleEditInvoice(viewInvoice)}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Edit size={16} /> Edit
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={() => handleDownloadPDF(viewInvoice)}
                        className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Create/Edit Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-[#FFB600]" /> {editingId ? 'Edit Invoice' : 'New Invoice'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select 
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none bg-white h-[42px]"
                                    onChange={(e) => setNewInvoice(prev => ({...prev, customerId: e.target.value}))}
                                    value={newInvoice.customerId}
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                             <button 
                                onClick={(e) => { e.preventDefault(); setIsAddCustomerModalOpen(true); }}
                                className="w-full bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-3 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap h-[42px]"
                                title="Add New Customer"
                            >
                                <UserPlus size={18} /> Add Customer
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none h-[42px]"
                                    value={newInvoice.date}
                                    onChange={(e) => setNewInvoice(prev => ({...prev, date: e.target.value}))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none h-[42px]"
                                    value={newInvoice.dueDate}
                                    onChange={(e) => setNewInvoice(prev => ({...prev, dueDate: e.target.value}))}
                                />
                            </div>
                        </div>
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
                                {newInvoice.items.map((item, idx) => (
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
                                {newInvoice.items.length === 0 && (
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
                        onClick={handleSaveInvoice}
                        disabled={!newInvoice.customerId || newInvoice.items.length === 0}
                        className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <DollarSign size={18} /> {editingId ? 'Update Invoice' : 'Save Invoice'}
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

export default InvoiceList;