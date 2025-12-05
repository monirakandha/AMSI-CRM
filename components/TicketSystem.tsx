import React, { useState } from 'react';
import { Ticket, TicketPriority, TicketStatus, Customer, Staff, Role, JobType } from '../types';
import { analyzeTicketDescription } from '../services/geminiService';
import { AlertCircle, Clock, CheckCircle, BrainCircuit, Loader2, Wrench, User, Edit2, Save, X, HardHat, Briefcase } from 'lucide-react';

interface TicketSystemProps {
  tickets: Ticket[];
  customers: Customer[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  staff: Staff[];
}

const TicketSystem: React.FC<TicketSystemProps> = ({ tickets, customers, setTickets, staff }) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    jobType: JobType.SERVICE,
    assignedTech: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Filter staff to only show technicians and engineers for assignment
  const technicalStaff = staff.filter(s => s.role === Role.TECH || s.role === Role.ENGINEER);

  const handleAnalyze = async () => {
    if (!newTicket.description || !newTicket.systemId) return;
    
    setIsAnalyzing(true);
    // Find system type
    const customer = customers.find(c => c.id === newTicket.customerId);
    const system = customer?.systems.find(s => s.id === newTicket.systemId);
    const systemType = system?.type || "Generic Alarm System";

    const result = await analyzeTicketDescription(newTicket.description, systemType);
    setAnalysisResult(result);
    setNewTicket(prev => ({
        ...prev,
        priority: result.priority,
        aiAnalysis: {
            suggestedAction: result.suggestedAction,
            estimatedTime: result.estimatedTime,
            requiredParts: result.requiredParts
        }
    }));
    setIsAnalyzing(false);
  };

  const handleCreateTicket = () => {
    if(!newTicket.title || !newTicket.customerId) return;
    
    const ticket: Ticket = {
        id: `TKT-${Math.floor(Math.random() * 10000)}`,
        customerId: newTicket.customerId,
        systemId: newTicket.systemId || 'UNKNOWN',
        title: newTicket.title,
        description: newTicket.description || '',
        status: newTicket.status || TicketStatus.OPEN,
        priority: newTicket.priority || TicketPriority.LOW,
        jobType: newTicket.jobType || JobType.SERVICE,
        assignedTech: newTicket.assignedTech,
        createdAt: new Date().toISOString(),
        aiAnalysis: newTicket.aiAnalysis
    } as Ticket;

    setTickets(prev => [ticket, ...prev]);
    setIsNewModalOpen(false);
    setNewTicket({ priority: TicketPriority.LOW, status: TicketStatus.OPEN, jobType: JobType.SERVICE, assignedTech: '' });
    setAnalysisResult(null);
  };

  const handleUpdateTicket = () => {
      if (!editingTicket) return;
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? editingTicket : t));
      setEditingTicket(null);
  };

  const getPriorityColor = (p: TicketPriority) => {
    switch (p) {
        case TicketPriority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
        case TicketPriority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
        case TicketPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case TicketPriority.LOW: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Service Operations</h2>
          <p className="text-slate-500 mt-1">Manage repair tickets and technician dispatch.</p>
        </div>
        <button 
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
        >
          <Wrench size={18} /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Kanban Columns */}
        {[TicketStatus.OPEN, TicketStatus.ASSIGNED, TicketStatus.RESOLVED].map((status) => (
            <div key={status} className="bg-slate-100 rounded-xl flex flex-col h-full border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-slate-700">{status}</h3>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        {tickets.filter(t => t.status === status).length}
                    </span>
                </div>
                <div className="p-4 overflow-y-auto space-y-4 flex-1">
                    {tickets.filter(t => t.status === status).map(ticket => {
                        const customer = customers.find(c => c.id === ticket.customerId);
                        const assignedStaff = staff.find(s => s.id === ticket.assignedTech);
                        
                        return (
                            <div 
                                key={ticket.id} 
                                onClick={() => setEditingTicket(ticket)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group hover:border-[#FFB600]"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-slate-400 group-hover:text-[#FFB600]">{ticket.id}</span>
                                    <div className="flex gap-1">
                                        {ticket.jobType && (
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 uppercase font-semibold">
                                                {ticket.jobType}
                                            </span>
                                        )}
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1 leading-tight group-hover:text-[#FFB600] transition-colors">{ticket.title}</h4>
                                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{ticket.description}</p>
                                
                                {ticket.aiAnalysis && (
                                    <div className="bg-amber-50 border border-amber-100 rounded p-2 mb-3">
                                        <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                                            <BrainCircuit size={12} />
                                            <span className="text-xs font-bold">AI Suggestion</span>
                                        </div>
                                        <p className="text-xs text-slate-700 leading-snug">{ticket.aiAnalysis.suggestedAction}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                                        <User size={12} /> {customer?.name || "Unknown"}
                                    </span>
                                    {assignedStaff ? (
                                        <span className="flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                            <HardHat size={12} /> {assignedStaff.name}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 italic">Unassigned</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      {/* Create New Ticket Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">Create Service Ticket</h3>
                    <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                onChange={(e) => {
                                    const c = customers.find(cust => cust.id === e.target.value);
                                    setNewTicket(prev => ({...prev, customerId: e.target.value, systemId: c?.systems[0]?.id || ''}));
                                }}
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">System</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={newTicket.systemId}
                                onChange={(e) => setNewTicket(prev => ({...prev, systemId: e.target.value}))}
                                disabled={!newTicket.customerId}
                            >
                                {newTicket.customerId ? 
                                    customers.find(c => c.id === newTicket.customerId)?.systems.map(s => 
                                        <option key={s.id} value={s.id}>{s.type} - {s.status}</option>
                                    ) : <option>Select Customer First</option>
                                }
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={newTicket.jobType}
                                onChange={(e) => setNewTicket(prev => ({...prev, jobType: e.target.value as JobType}))}
                            >
                                {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={newTicket.priority}
                                onChange={(e) => setNewTicket(prev => ({...prev, priority: e.target.value as TicketPriority}))}
                            >
                                {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Assign Technician (Optional)</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                            value={newTicket.assignedTech || ''}
                            onChange={(e) => {
                                const newTech = e.target.value;
                                setNewTicket(prev => ({
                                    ...prev, 
                                    assignedTech: newTech,
                                    status: newTech ? TicketStatus.ASSIGNED : TicketStatus.OPEN
                                }));
                            }}
                        >
                            <option value="">-- Unassigned --</option>
                            {technicalStaff.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">If assigned, ticket status will be set to 'Assigned'.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                            placeholder="e.g. Battery Fault on Zone 2"
                            onChange={(e) => setNewTicket(prev => ({...prev, title: e.target.value}))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Detailed Description</label>
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !newTicket.description || !newTicket.systemId}
                                className="text-xs bg-amber-100 text-[#FFB600] px-2 py-1 rounded-full font-medium flex items-center gap-1 hover:bg-amber-200 disabled:opacity-50 transition-colors"
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin" size={12} /> : <BrainCircuit size={12} />}
                                AI Analyze
                            </button>
                        </div>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none resize-none"
                            placeholder="Describe the issue in detail to use AI analysis..."
                            onChange={(e) => setNewTicket(prev => ({...prev, description: e.target.value}))}
                        />
                    </div>

                    {/* AI Results Section */}
                    {analysisResult && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 space-y-3 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <BrainCircuit className="text-blue-600" size={18} />
                                <span className="font-bold text-blue-900 text-sm">AI Dispatch Analysis</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-2 rounded border border-blue-100">
                                    <p className="text-xs text-slate-500">Suggested Priority</p>
                                    <p className={`text-sm font-bold ${getPriorityColor(analysisResult.priority as TicketPriority).split(' ')[1]}`}>
                                        {analysisResult.priority}
                                    </p>
                                </div>
                                <div className="bg-white p-2 rounded border border-blue-100">
                                    <p className="text-xs text-slate-500">Est. Time</p>
                                    <p className="text-sm font-bold text-slate-800">{analysisResult.estimatedTime}</p>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded border border-blue-100">
                                <p className="text-xs text-slate-500 mb-1">Recommended Action</p>
                                <p className="text-sm text-slate-800">{analysisResult.suggestedAction}</p>
                            </div>
                            
                            {analysisResult.requiredParts && analysisResult.requiredParts.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Possible Parts Needed</p>
                                    <div className="flex flex-wrap gap-1">
                                        {analysisResult.requiredParts.map((part: string, idx: number) => (
                                            <span key={idx} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs">
                                                {part}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsNewModalOpen(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateTicket}
                        disabled={!newTicket.title || !newTicket.customerId}
                        className="px-4 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Ticket
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Edit2 size={20} className="text-[#FFB600]" /> Edit Ticket
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-mono">ID: {editingTicket.id}</p>
                    </div>
                    <button onClick={() => setEditingTicket(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none font-bold text-slate-800"
                            value={editingTicket.title}
                            onChange={(e) => setEditingTicket({...editingTicket, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={editingTicket.status}
                                onChange={(e) => setEditingTicket({...editingTicket, status: e.target.value as TicketStatus})}
                            >
                                {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={editingTicket.priority}
                                onChange={(e) => setEditingTicket({...editingTicket, priority: e.target.value as TicketPriority})}
                            >
                                {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={editingTicket.jobType || JobType.SERVICE}
                                onChange={(e) => setEditingTicket({...editingTicket, jobType: e.target.value as JobType})}
                            >
                                {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <label className="block text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                            <Wrench size={16} /> Assign Technician
                        </label>
                        <select 
                            className="w-full border border-purple-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                            value={editingTicket.assignedTech || ''}
                            onChange={(e) => {
                                const newTech = e.target.value;
                                setEditingTicket({
                                    ...editingTicket, 
                                    assignedTech: newTech,
                                    status: newTech && editingTicket.status === TicketStatus.OPEN ? TicketStatus.ASSIGNED : editingTicket.status
                                });
                            }}
                        >
                            <option value="">-- Unassigned --</option>
                            {technicalStaff.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                            ))}
                        </select>
                        <p className="text-xs text-purple-600 mt-2">
                            Assigning a technician will automatically set status to 'Assigned' if currently 'Open'.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none resize-none"
                            value={editingTicket.description}
                            onChange={(e) => setEditingTicket({...editingTicket, description: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setEditingTicket(null)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdateTicket}
                        className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TicketSystem;