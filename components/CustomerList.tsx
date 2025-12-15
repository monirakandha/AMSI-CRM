import React, { useState, useEffect, useRef } from 'react';
import { Customer, SystemStatus, Ticket, Invoice, Quote, TicketStatus, TicketPriority, Staff, CustomerNote, Role } from '../types';
import { Search, MapPin, Phone, Shield, MoreVertical, X, FileText, AlertCircle, FileBarChart, Mail, Gift, CheckCircle, Plus, UserPlus, LayoutGrid, List, MessageSquare, Send, User, Paperclip, Edit, Camera, Upload, Trash2 } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  tickets?: Ticket[]; // Optional for detail view
  invoices?: Invoice[]; // Optional for detail view
  quotes?: Quote[]; // Optional for detail view
  setTickets?: React.Dispatch<React.SetStateAction<Ticket[]>>;
  currentUser: Staff;
  staff: Staff[];
  initialCustomerId?: string;
  initialTab?: string;
  onConsumeNavParams?: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, setCustomers, tickets = [], invoices = [], quotes = [], setTickets, currentUser, staff, initialCustomerId, initialTab, onConsumeNavParams }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'systems' | 'tickets' | 'invoices' | 'quotes' | 'notes'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  // Note State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteAttachment, setNoteAttachment] = useState<string | null>(null);
  const noteFileInputRef = useRef<HTMLInputElement>(null);

  // Add/Edit Customer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contractValue: 0,
    notes: '',
    image: ''
  });
  const customerFileInputRef = useRef<HTMLInputElement>(null);

  // Handle navigation from other components (deep linking)
  useEffect(() => {
    if (initialCustomerId) {
        const customer = customers.find(c => c.id === initialCustomerId);
        if (customer) {
            setSelectedCustomer(customer);
            if (initialTab) {
                // Ensure the tab is valid, default to overview if not
                const validTabs = ['overview', 'systems', 'tickets', 'invoices', 'quotes', 'notes'];
                if (validTabs.includes(initialTab)) {
                    setActiveDetailTab(initialTab as any);
                }
            }
        }
        // Signal to parent that we've consumed the params
        if (onConsumeNavParams) {
            onConsumeNavParams();
        }
    }
  }, [initialCustomerId, initialTab, customers, onConsumeNavParams]);

  const getStatusColor = (status: SystemStatus) => {
    switch (status) {
      case SystemStatus.ARMED_AWAY:
      case SystemStatus.ARMED_STAY:
        return 'bg-green-100 text-green-700 border-green-200';
      case SystemStatus.DISARMED:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case SystemStatus.TROUBLE:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case SystemStatus.ALARM_TRIGGERED:
        return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
      case SystemStatus.OFFLINE:
        return 'bg-gray-200 text-gray-700 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Filter data for selected customer
  const customerTickets = selectedCustomer ? tickets.filter(t => t.customerId === selectedCustomer.id) : [];
  const customerInvoices = selectedCustomer ? invoices.filter(i => i.customerId === selectedCustomer.id) : [];
  const customerQuotes = selectedCustomer ? quotes.filter(q => q.customerId === selectedCustomer.id) : [];

  const handleClaimFreeService = () => {
    if (!selectedCustomer || !setTickets) return;

    const newTicket: Ticket = {
        id: `TKT-FREE-${Math.floor(Math.random() * 10000)}`,
        customerId: selectedCustomer.id,
        systemId: selectedCustomer.systems[0]?.id || 'GENERIC',
        title: "Free After-Sales Service Call",
        description: "Customer has claimed their one-time free after-sales service benefit. Please schedule a technician visit.",
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        createdAt: new Date().toISOString(),
        aiAnalysis: {
            suggestedAction: "Schedule standard maintenance check and customer training.",
            estimatedTime: "1 hour",
            requiredParts: []
        }
    };

    setTickets(prev => [newTicket, ...prev]);
    alert("Service Request Created. Engineering team has been notified via high-priority ticket.");
  };

  const handleOpenAdd = () => {
      setEditingId(null);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        contractValue: 0,
        notes: '',
        image: ''
      });
      setIsAddModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
      setEditingId(customer.id);
      setNewCustomer({ ...customer });
      setIsAddModalOpen(true);
  };

  const handleCustomerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCustomer(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomerImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setNewCustomer(prev => ({ ...prev, image: '' }));
      if (customerFileInputRef.current) customerFileInputRef.current.value = '';
  };

  const handleSaveCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) return;

    if (editingId) {
        // Edit Mode
        const updatedCustomer = { ...newCustomer } as Customer;
        setCustomers(prev => prev.map(c => c.id === editingId ? { ...c, ...updatedCustomer } : c));
        
        // Update selected customer view if it's the one being edited
        if (selectedCustomer && selectedCustomer.id === editingId) {
            setSelectedCustomer(prev => prev ? { ...prev, ...updatedCustomer } as Customer : null);
        }
    } else {
        // Create Mode
        const customer: Customer = {
            id: `CUST-${Math.floor(Math.random() * 10000)}`,
            name: newCustomer.name || '',
            email: newCustomer.email || '',
            phone: newCustomer.phone || '',
            address: newCustomer.address || '',
            contractValue: Number(newCustomer.contractValue) || 0,
            notes: newCustomer.notes || '',
            systems: [], // Initialize with no systems
            noteHistory: [],
            image: newCustomer.image
        };
        setCustomers(prev => [...prev, customer]);
    }

    setIsAddModalOpen(false);
    setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        contractValue: 0,
        notes: '',
        image: ''
    });
    setEditingId(null);
  };

  const handleNoteFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNote = () => {
    if (!selectedCustomer || (!newNoteContent.trim() && !noteAttachment)) return;

    const newNote: CustomerNote = {
      id: `NOTE-${Date.now()}`,
      content: newNoteContent,
      author: currentUser.name,
      authorId: currentUser.id,
      date: new Date().toISOString(),
      attachment: noteAttachment || undefined
    };

    const updatedCustomer = {
      ...selectedCustomer,
      noteHistory: [newNote, ...(selectedCustomer.noteHistory || [])]
    };

    setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
    setNewNoteContent('');
    setNoteAttachment(null);
    if (noteFileInputRef.current) noteFileInputRef.current.value = '';
  };

  const hasClaimedFreeService = selectedCustomer && customerTickets.some(t => t.title === "Free After-Sales Service Call");

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.systems.some(sys => sys.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Customer Directory</h2>
          <p className="text-slate-500 mt-1">Manage client accounts and installed systems.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg p-1 border border-slate-300 shadow-sm">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    title="List View"
                >
                    <List size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Grid View"
                >
                    <LayoutGrid size={20} />
                </button>
            </div>
            <button 
                onClick={handleOpenAdd}
                className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
            >
            <UserPlus size={18} /> Add Customer
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search customers by name, address, or system ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FFB600] focus:border-transparent"
            />
          </div>
        </div>

        <div className={`overflow-y-auto flex-1 p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start' : 'space-y-4'}`}>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
            <div 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className={`border border-slate-200 rounded-lg p-5 hover:border-[#FFB600] transition-all hover:shadow-md bg-white group cursor-pointer ${viewMode === 'grid' ? 'flex flex-col' : ''}`}
            >
              <div className={`flex gap-4 ${viewMode === 'list' ? 'flex-col lg:flex-row justify-between lg:items-center' : 'flex-col'}`}>
                {/* Profile Image & Main Info */}
                <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex-shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {customer.image ? (
                            <img src={customer.image} alt={customer.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-500 font-bold text-lg">{customer.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-slate-800 truncate pr-2">{customer.name}</h3>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(customer); }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                title="Edit Profile"
                            >
                                <Edit size={16} />
                            </button>
                            <button className={`text-slate-400 hover:text-slate-600 ${viewMode === 'list' ? 'lg:hidden' : ''}`}>
                                <MoreVertical size={20} />
                            </button>
                        </div>
                      </div>
                      
                      <div className={`flex text-sm text-slate-500 mb-4 ${viewMode === 'list' ? 'flex-col sm:flex-row gap-1 sm:gap-6' : 'flex-col gap-2'}`}>
                        <div className="flex items-center gap-2 truncate">
                            <MapPin size={16} className="flex-shrink-0" />
                            <span className="truncate">{customer.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="flex-shrink-0" />
                            {customer.phone}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {customer.systems.length > 0 ? customer.systems.map((sys) => (
                            <div key={sys.id} className="flex items-center gap-3 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                <Shield size={16} className="text-slate-400 flex-shrink-0" />
                                <span className="font-medium text-slate-700 truncate">{sys.type}</span>
                                {viewMode === 'list' && <span className="text-slate-400 text-xs hidden sm:inline">ID: {sys.id}</span>}
                                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(sys.status)}`}>
                                    {sys.status}
                                </span>
                            </div>
                        )) : (
                            <div className="text-xs text-slate-400 italic">No systems installed</div>
                        )}
                      </div>
                    </div>
                </div>

                <div className={`pt-4 border-slate-100 ${viewMode === 'list' ? 'flex flex-row lg:flex-col gap-2 border-t lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 min-w-[140px]' : 'flex flex-row items-center justify-between border-t mt-auto'}`}>
                    <div className={`${viewMode === 'list' ? 'text-center lg:text-right' : ''}`}>
                        <p className="text-xs text-slate-500">MRR</p>
                        <p className="text-lg font-bold text-slate-800">${customer.contractValue}</p>
                    </div>
                    <button className={`${viewMode === 'list' ? 'flex-1 lg:flex-none' : ''} text-sm border border-slate-300 rounded hover:bg-slate-50 px-3 py-1.5 text-slate-600 transition-colors`}>
                        View Details
                    </button>
                </div>
              </div>
            </div>
          ))) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No customers found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">
                        {editingId ? 'Edit Customer Profile' : 'Add New Customer'}
                    </h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Image Upload */}
                    <div className="flex justify-center mb-4">
                        <div className="relative group">
                            <div 
                                onClick={() => customerFileInputRef.current?.click()}
                                className="w-24 h-24 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#FFB600] transition-colors"
                            >
                                {newCustomer.image ? (
                                    <img src={newCustomer.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <Camera size={24} className="mx-auto" />
                                        <span className="text-[10px] block mt-1">Upload</span>
                                    </div>
                                )}
                            </div>
                            
                            {newCustomer.image && (
                                <button 
                                    onClick={handleRemoveCustomerImage}
                                    className="absolute -top-1 -right-1 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 border border-white shadow-sm"
                                    title="Remove Photo"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}

                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                <Upload className="text-white" size={20} />
                            </div>

                            <input 
                                type="file" 
                                ref={customerFileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleCustomerImageUpload}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                        <input 
                            type="text" 
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none" 
                            placeholder="e.g. Acme Corp"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                            <input 
                                type="email" 
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none" 
                                placeholder="contact@example.com"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input 
                                type="tel" 
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none" 
                                placeholder="(555) 123-4567"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input 
                            type="text" 
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none" 
                            placeholder="123 Main St, City, State"
                            value={newCustomer.address}
                            onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Contract Value ($)</label>
                        <input 
                            type="number" 
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none" 
                            placeholder="0.00"
                            value={newCustomer.contractValue}
                            onChange={(e) => setNewCustomer({...newCustomer, contractValue: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Notes</label>
                        <textarea 
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm h-24 focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none resize-none" 
                            placeholder="Gate codes, access info, etc."
                            value={newCustomer.notes}
                            onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                        ></textarea>
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
                        onClick={handleSaveCustomer}
                        disabled={!newCustomer.name || !newCustomer.email}
                        className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editingId ? 'Save Changes' : 'Create Customer'}
                    </button>
                </div>
            </div>
          </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden border border-blue-200 flex-shrink-0">
                            {selectedCustomer.image ? (
                                <img src={selectedCustomer.image} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                            ) : (
                                selectedCustomer.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                {selectedCustomer.name}
                                <button 
                                    onClick={() => handleOpenEdit(selectedCustomer)}
                                    className="p-1 text-slate-400 hover:text-[#FFB600] transition-colors"
                                    title="Edit Profile"
                                >
                                    <Edit size={16} />
                                </button>
                            </h2>
                            <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                                <MapPin size={14} /> {selectedCustomer.address}
                            </p>
                            <div className="flex gap-4 mt-2">
                                <a href={`mailto:${selectedCustomer.email}`} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                    <Mail size={12} /> {selectedCustomer.email}
                                </a>
                                <a href={`tel:${selectedCustomer.phone}`} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                    <Phone size={12} /> {selectedCustomer.phone}
                                </a>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white px-6">
                    {(['overview', 'systems', 'tickets', 'invoices', 'quotes', 'notes'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveDetailTab(tab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                                activeDetailTab === tab 
                                ? 'border-[#FFB600] text-[#FFB600]' 
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {activeDetailTab === 'overview' && (
                        <div className="space-y-6">
                             {/* Free Service Benefit Section */}
                             <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h4 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                                        <Gift size={20} className="text-indigo-600" /> After-Sales Benefit
                                    </h4>
                                    <p className="text-sm text-indigo-700 mt-1">This customer is eligible for one free service maintenance call.</p>
                                </div>
                                {hasClaimedFreeService ? (
                                    <div className="bg-white px-4 py-2 rounded-lg border border-indigo-100 text-indigo-600 font-medium text-sm flex items-center gap-2 shadow-sm">
                                        <CheckCircle size={16} /> Service Requested
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleClaimFreeService}
                                        disabled={!setTickets}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-indigo-200 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Dispatch Free Service
                                    </button>
                                )}
                             </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Revenue</h4>
                                    <p className="text-3xl font-bold text-slate-800">${selectedCustomer.contractValue}</p>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Systems</h4>
                                    <p className="text-3xl font-bold text-slate-800">{selectedCustomer.systems.length}</p>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Open Tickets</h4>
                                    <p className="text-3xl font-bold text-slate-800">{customerTickets.filter(t => t.status !== 'Resolved').length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-800 mb-3">General Information</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{selectedCustomer.notes || "No general notes available."}</p>
                            </div>

                            {/* Recent Activity & Comments Section in Overview */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-slate-400" />
                                    Recent Activity & Comments
                                </h4>
                                <div className="space-y-4">
                                    {selectedCustomer.noteHistory && selectedCustomer.noteHistory.length > 0 ? (
                                        selectedCustomer.noteHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((note) => {
                                            // Resolve Author details from Staff list
                                            const noteAuthor = staff.find(s => s.id === note.authorId) || staff.find(s => s.name === note.author);
                                            
                                            return (
                                                <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 overflow-hidden border border-slate-200">
                                                                {noteAuthor?.image ? (
                                                                    <img src={noteAuthor.image} alt={note.author} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xs font-bold">{note.author.charAt(0)}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-slate-800">{note.author}</span>
                                                                    {noteAuthor && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-medium">
                                                                            {noteAuthor.role}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-slate-400 block">
                                                                    {new Date(note.date).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pl-11">
                                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                            {note.content}
                                                        </p>
                                                        {note.attachment && (
                                                            <div className="mt-3">
                                                                <img src={note.attachment} alt="Attachment" className="max-w-full h-auto max-h-60 rounded-lg border border-slate-200 cursor-pointer hover:opacity-95" onClick={() => window.open(note.attachment)} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-6 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                                            No recent comments or activity.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetailTab === 'systems' && (
                        <div className="space-y-4">
                            {selectedCustomer.systems.length > 0 ? selectedCustomer.systems.map((sys) => (
                                <div key={sys.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{sys.type}</h4>
                                            <p className="text-xs text-slate-500">System ID: {sys.id} • {sys.zones} Zones</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sys.status)}`}>
                                            {sys.status}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-2">Last Service: {sys.lastServiceDate}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
                                    No systems recorded for this customer.
                                </div>
                            )}
                        </div>
                    )}

                    {activeDetailTab === 'tickets' && (
                        <div className="space-y-3">
                            {customerTickets.length > 0 ? customerTickets.map((t) => (
                                <div key={t.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-1.5 rounded-full ${t.priority === 'Critical' ? 'bg-red-100 text-red-600' : t.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <AlertCircle size={16} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">{t.title}</h5>
                                            <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.id}</span>
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 whitespace-nowrap">
                                        {new Date(t.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            )) : <div className="text-center text-slate-400 py-10 bg-white rounded-xl border border-slate-200">No service tickets found.</div>}
                        </div>
                    )}

                    {activeDetailTab === 'invoices' && (
                        <div className="space-y-3">
                            {customerInvoices.length > 0 ? customerInvoices.map((inv) => (
                                <div key={inv.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-slate-400" size={20} />
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">{inv.id}</h5>
                                            <p className="text-xs text-slate-500">Due: {inv.dueDate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800">${inv.totalAmount.toFixed(2)}</p>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                            inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>{inv.status}</span>
                                    </div>
                                </div>
                            )) : <div className="text-center text-slate-400 py-10 bg-white rounded-xl border border-slate-200">No invoices found.</div>}
                        </div>
                    )}

                    {activeDetailTab === 'quotes' && (
                        <div className="space-y-3">
                             {customerQuotes.length > 0 ? customerQuotes.map((q) => (
                                <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <FileBarChart className="text-purple-400" size={20} />
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">{q.id}</h5>
                                            <p className="text-xs text-slate-500">Expires: {q.expiryDate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800">${q.totalAmount.toFixed(2)}</p>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                                            {q.status}
                                        </span>
                                    </div>
                                </div>
                            )) : <div className="text-center text-slate-400 py-10 bg-white rounded-xl border border-slate-200">No quotes found.</div>}
                        </div>
                    )}

                    {activeDetailTab === 'notes' && (
                        <div className="space-y-4 h-full flex flex-col">
                            {/* Input Section */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Add New Note</label>
                                
                                {noteAttachment && (
                                    <div className="mb-3 relative inline-block">
                                        <img src={noteAttachment} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-200 object-cover" />
                                        <button 
                                            onClick={() => { setNoteAttachment(null); if(noteFileInputRef.current) noteFileInputRef.current.value=''; }}
                                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200 border border-white shadow-sm"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}

                                <div className="relative">
                                    <textarea 
                                        className="w-full border border-slate-300 rounded-lg p-3 pr-24 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none resize-none h-24"
                                        placeholder="Type your comment or note here..."
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        <button
                                            onClick={() => noteFileInputRef.current?.click()}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                            title="Attach Image"
                                        >
                                            <Paperclip size={18} />
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={noteFileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleNoteFileSelect}
                                        />
                                        <button 
                                            onClick={handleAddNote}
                                            disabled={!newNoteContent.trim() && !noteAttachment}
                                            className="p-2 bg-[#FFB600] text-slate-900 rounded-full hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* History Feed */}
                            <div className="flex-1 space-y-4 overflow-y-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare size={16} className="text-slate-400" />
                                    <h4 className="text-sm font-bold text-slate-600">Comment History</h4>
                                </div>
                                {selectedCustomer.noteHistory && selectedCustomer.noteHistory.length > 0 ? (
                                    selectedCustomer.noteHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((note) => {
                                        // Resolve Author details from Staff list
                                        const noteAuthor = staff.find(s => s.id === note.authorId) || staff.find(s => s.name === note.author);
                                        
                                        return (
                                            <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 overflow-hidden border border-slate-200">
                                                            {noteAuthor?.image ? (
                                                                <img src={noteAuthor.image} alt={note.author} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-bold">{note.author.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-slate-800">{note.author}</span>
                                                                {noteAuthor && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-medium">
                                                                        {noteAuthor.role}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-400 block">
                                                                {new Date(note.date).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pl-11">
                                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                        {note.content}
                                                    </p>
                                                    {note.attachment && (
                                                        <div className="mt-3">
                                                            <img src={note.attachment} alt="Attachment" className="max-w-full h-auto max-h-60 rounded-lg border border-slate-200 cursor-pointer hover:opacity-95" onClick={() => window.open(note.attachment)} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400">
                                        <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No notes or comments yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
                    <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;