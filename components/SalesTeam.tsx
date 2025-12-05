import React, { useState } from 'react';
import { Staff, Lead, LeadStatus, Role, LeadHistoryEntry } from '../types';
import { Briefcase, User, Phone, Mail, Plus, MapPin, HardHat, Send, X, Clock, FileText, CheckCircle, XCircle, ArrowRight, MessageSquare } from 'lucide-react';

interface SalesTeamProps {
  staff: Staff[];
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const SalesTeam: React.FC<SalesTeamProps> = ({ staff, leads, setLeads }) => {
  const [activeTab, setActiveTab] = useState<'team' | 'leads'>('leads');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const salesTeam = staff.filter(s => s.role === Role.SALES);
  const engineers = staff.filter(s => s.role === Role.ENGINEER);

  const [newLead, setNewLead] = useState<Partial<Lead>>({
    status: LeadStatus.NEW,
    assignedSalesId: salesTeam[0]?.id
  });

  const handleCreateLead = () => {
    if (!newLead.customerName) return;
    const now = new Date().toISOString();
    const lead: Lead = {
        ...newLead,
        id: `L-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: now,
        history: [
            {
                date: now,
                action: 'Lead Created',
                user: 'System', // In a real app, this would be the logged-in user
                details: 'Initial lead creation.'
            }
        ]
    } as Lead;
    setLeads(prev => [...prev, lead]);
    setIsLeadModalOpen(false);
    setNewLead({ status: LeadStatus.NEW, assignedSalesId: salesTeam[0]?.id });
  };

  const updateLeadStatus = (id: string, status: LeadStatus, engineerId?: string) => {
    setLeads(prev => prev.map(l => {
        if (l.id === id) {
            const historyEntry: LeadHistoryEntry = {
                date: new Date().toISOString(),
                action: 'Status Change',
                user: 'Sales Team',
                details: `Status updated to ${status}`
            };
            
            // If engineer is being assigned or changed
            if (engineerId && engineerId !== l.assignedEngineerId) {
                historyEntry.details += `. Assigned to Engineer: ${staff.find(s => s.id === engineerId)?.name || engineerId}`;
            }

            return { 
                ...l, 
                status, 
                assignedEngineerId: engineerId || l.assignedEngineerId,
                history: [historyEntry, ...l.history]
            };
        }
        return l;
    }));
    // Close detail modal if open and update the local state to reflect change immediately if viewing the same lead
    if (selectedLead && selectedLead.id === id) {
        setSelectedLead(prev => prev ? ({...prev, status, assignedEngineerId: engineerId || prev.assignedEngineerId}) : null);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Sales Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage sales team members and lead pipeline.</p>
        </div>
        <div className="flex gap-3">
             <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setActiveTab('leads')}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'leads' ? 'bg-amber-50 text-[#FFB600]' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Pipeline
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'team' ? 'bg-amber-50 text-[#FFB600]' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Team Members
                </button>
            </div>
            {activeTab === 'leads' && (
                <button 
                    onClick={() => setIsLeadModalOpen(true)}
                    className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={18} /> New Lead
                </button>
            )}
        </div>
      </div>

      {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesTeam.map(member => (
                <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl mb-4">
                        {member.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{member.role}</p>
                    <div className="w-full space-y-2 text-sm text-slate-600 mb-6">
                        <div className="flex items-center justify-center gap-2">
                            <Mail size={14} /> {member.email}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Phone size={14} /> {member.phone}
                        </div>
                    </div>
                    <div className="w-full pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Active Leads</span>
                            <span className="font-bold text-blue-600">{member.activeLeads || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      )}

      {activeTab === 'leads' && (
        <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 h-full min-w-max">
                {[LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.SITE_SURVEY, LeadStatus.ENGINEER_REVIEW, LeadStatus.QUOTE_SENT, LeadStatus.CLOSED_WON, LeadStatus.CLOSED_LOST].map(status => (
                    <div key={status} className="w-80 flex flex-col h-full bg-slate-100 rounded-xl border border-slate-200">
                        <div className="p-3 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 text-sm">{status}</h4>
                            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                {leads.filter(l => l.status === status).length}
                            </span>
                        </div>
                        <div className="p-3 space-y-3 overflow-y-auto flex-1">
                            {leads.filter(l => l.status === status).map(lead => (
                                <div 
                                    key={lead.id} 
                                    onClick={() => setSelectedLead(lead)}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative cursor-pointer"
                                >
                                    <h5 className="font-bold text-slate-800 mb-1">{lead.customerName}</h5>
                                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                        <User size={12} /> {lead.contactName}
                                    </p>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                                        {lead.requirements}
                                    </p>
                                    <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                                        <span className="font-medium text-green-600">Est. ${lead.estimatedValue}</span>
                                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {/* Workflow Action Buttons */}
                                    <div className="pt-2 border-t border-slate-100 mt-2">
                                        {status === LeadStatus.NEW && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, LeadStatus.CONTACTED); }}
                                                className="w-full py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <MessageSquare size={12} /> Mark Contacted
                                            </button>
                                        )}
                                        {status === LeadStatus.CONTACTED && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, LeadStatus.SITE_SURVEY); }}
                                                className="w-full py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <MapPin size={12} /> Move to Survey
                                            </button>
                                        )}
                                        {status === LeadStatus.SITE_SURVEY && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Simple prompt for now to pick engineer
                                                    const engId = engineers[0]?.id; // Default to first engineer for demo
                                                    updateLeadStatus(lead.id, LeadStatus.ENGINEER_REVIEW, engId);
                                                }}
                                                className="w-full py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Send size={12} /> Request Engineer Review
                                            </button>
                                        )}
                                        {status === LeadStatus.ENGINEER_REVIEW && (
                                            <div className="flex items-center justify-center gap-2 text-xs text-purple-600 font-medium py-1">
                                                <HardHat size={12} /> Under Review
                                            </div>
                                        )}
                                        {status === LeadStatus.QUOTE_SENT && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, LeadStatus.CLOSED_WON); }}
                                                    className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle size={12} /> Won
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, LeadStatus.CLOSED_LOST); }}
                                                    className="flex-1 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <XCircle size={12} /> Lost
                                                </button>
                                            </div>
                                        )}
                                        {status === LeadStatus.CLOSED_WON && (
                                            <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold">
                                                <CheckCircle size={12} /> Deal Closed
                                            </div>
                                        )}
                                        {status === LeadStatus.CLOSED_LOST && (
                                            <div className="flex items-center justify-center gap-1 text-red-400 text-xs font-medium">
                                                <XCircle size={12} /> Closed Lost
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* New Lead Modal */}
      {isLeadModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Add New Lead</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                        <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                            onChange={e => setNewLead({...newLead, customerName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                onChange={e => setNewLead({...newLead, contactName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Value ($)</label>
                            <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                onChange={e => setNewLead({...newLead, estimatedValue: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quote Details / Requirements</label>
                        <textarea className="w-full p-2 border border-slate-300 rounded-lg text-sm h-24" placeholder="Enter details for engineer review..."
                            onChange={e => setNewLead({...newLead, requirements: e.target.value})}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Assign Sales Rep</label>
                        <select className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                             onChange={e => setNewLead({...newLead, assignedSalesId: e.target.value})}
                             value={newLead.assignedSalesId}
                        >
                            {salesTeam.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={() => setIsLeadModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleCreateLead} className="px-4 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500">Add Lead</button>
                </div>
            </div>
          </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedLead.customerName}</h2>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                             <span className="flex items-center gap-1"><User size={14} /> {selectedLead.contactName}</span>
                             <span className="flex items-center gap-1"><MapPin size={14} /> {selectedLead.address || 'No address provided'}</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                             <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Current Status</p>
                             <span className="inline-block px-2 py-0.5 rounded text-sm font-bold bg-blue-100 text-blue-800">
                                 {selectedLead.status}
                             </span>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                             <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Estimated Value</p>
                             <p className="text-lg font-bold text-slate-800">${selectedLead.estimatedValue.toLocaleString()}</p>
                         </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <FileText size={16} /> Requirements / Notes
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                            {selectedLead.requirements || "No requirements listed."}
                        </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={16} /> Activity History
                        </h4>
                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                            {selectedLead.history && selectedLead.history.length > 0 ? (
                                selectedLead.history.map((entry, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{entry.action}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{entry.details}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 bg-slate-50 inline-block px-2 py-0.5 rounded">
                                            <User size={10} /> {entry.user}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No history available.</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                     <button onClick={() => setSelectedLead(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
                         Close Details
                     </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default SalesTeam;