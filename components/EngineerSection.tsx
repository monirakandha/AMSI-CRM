import React, { useState } from 'react';
import { Staff, Lead, LeadStatus, Role, LeadHistoryEntry, Ticket } from '../types';
import { HardHat, ClipboardCheck, Clock, FileCheck, User, X, History, Bell, Wrench, AlertTriangle } from 'lucide-react';

interface EngineerSectionProps {
  staff: Staff[];
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  tickets: Ticket[];
}

const EngineerSection: React.FC<EngineerSectionProps> = ({ staff, leads, setLeads, tickets = [] }) => {
  const engineers = staff.filter(s => s.role === Role.ENGINEER);
  const reviewQueue = leads.filter(l => l.status === LeadStatus.ENGINEER_REVIEW);
  
  // Filter for Free Service Call tickets
  const serviceRequests = tickets.filter(t => t.title === "Free After-Sales Service Call" && t.status !== 'Resolved');
  
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);

  const handleReviewAction = (leadId: string, action: 'approve' | 'reject') => {
      let notes = '';
      if (action === 'reject') {
          const reason = window.prompt("Please enter feedback for the sales team:");
          if (reason === null) return; // Cancelled
          notes = reason;
      }

      const newStatus = action === 'approve' ? LeadStatus.QUOTE_SENT : LeadStatus.SITE_SURVEY;
      
      const historyEntry: LeadHistoryEntry = {
          date: new Date().toISOString(),
          action: action === 'approve' ? 'Quote Approved' : 'Changes Requested',
          user: 'Engineering Team',
          details: action === 'approve' 
            ? 'Design approved. Moved to Quote Sent status.' 
            : `Design rejected. Returned for revision. Feedback: ${notes}`
      };

      setLeads(prev => prev.map(l => {
          if (l.id === leadId) {
              return { 
                  ...l, 
                  status: newStatus,
                  history: [historyEntry, ...l.history]
              };
          }
          return l;
      }));
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Engineering & Design</h2>
        <p className="text-slate-500 mt-1">Review system designs, quotes, and manage site surveys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
        {/* Left Col: Team List & Notifications */}
        <div className="lg:col-span-1 space-y-6">
            {/* Service Requests Notification */}
            {serviceRequests.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
                        <Bell size={16} className="fill-indigo-500 text-indigo-600 animate-pulse" />
                        Service Call Requests
                    </h3>
                    <div className="space-y-2">
                        {serviceRequests.map(req => (
                            <div key={req.id} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                <p className="text-xs font-bold text-slate-800 mb-1">Free Service Claim</p>
                                <p className="text-xs text-slate-500 mb-2 truncate">{req.id}</p>
                                <div className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                                    <Wrench size={10} /> Needs Scheduling
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <HardHat size={20} className="text-slate-400" /> Engineering Team
            </h3>
            <div className="space-y-4">
                {engineers.map(eng => (
                    <div key={eng.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                            {eng.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{eng.name}</h4>
                            <p className="text-xs text-slate-500 truncate">{eng.email}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Col: Review Queue */}
        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-slate-400" /> Quote Reviews & Site Surveys
                </h3>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                    {reviewQueue.length} Pending
                </span>
             </div>

             <div className="bg-slate-50 rounded-xl border border-slate-200 flex-1 overflow-y-auto p-4 space-y-4">
                {reviewQueue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <FileCheck size={48} className="mb-2 opacity-50" />
                        <p>All caught up! No leads pending review.</p>
                    </div>
                ) : (
                    reviewQueue.map(lead => (
                        <div key={lead.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-lg font-bold text-slate-800">{lead.customerName}</h4>
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">Pending Review</span>
                                    </div>
                                    <div className="flex gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><User size={12}/> {lead.contactName}</span>
                                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(lead.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-500">Est. Value</p>
                                    <p className="text-xl font-bold text-slate-800">${lead.estimatedValue.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">System Requirements / Quote Details</h5>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {lead.requirements}
                                </p>
                            </div>

                            {/* Mini History Toggle */}
                            <div className="mb-4">
                                <button 
                                    onClick={() => setShowHistoryFor(showHistoryFor === lead.id ? null : lead.id)}
                                    className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
                                >
                                    <History size={12} /> {showHistoryFor === lead.id ? 'Hide History' : 'View History'}
                                </button>
                                {showHistoryFor === lead.id && (
                                    <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-2 max-h-40 overflow-y-auto">
                                        {lead.history.map((h, i) => (
                                            <div key={i} className="flex justify-between border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                                                <span>{h.action} - <span className="text-slate-500">{h.details}</span></span>
                                                <span className="text-slate-400">{new Date(h.date).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <button 
                                    onClick={() => handleReviewAction(lead.id, 'reject')}
                                    className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center gap-2"
                                >
                                    <AlertTriangle size={16} /> Request Changes
                                </button>
                                <button 
                                    onClick={() => handleReviewAction(lead.id, 'approve')}
                                    className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm text-sm flex items-center gap-2"
                                >
                                    <FileCheck size={16} /> Approve Quote
                                </button>
                            </div>
                        </div>
                    ))
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerSection;