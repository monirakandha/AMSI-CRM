import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, JobType, Staff, Customer, Role } from '../types';
import { Calendar, Clock, MapPin, User, CheckCircle, Plus, X, Phone, Wrench, Camera, PenTool, Send, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface JobCalendarProps {
  tickets: Ticket[];
  staff: Staff[];
  customers: Customer[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const JobCalendar: React.FC<JobCalendarProps> = ({ tickets, staff, customers, setTickets }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState<Ticket | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [techFilter, setTechFilter] = useState<string>(''); // Filter state

  const [newJob, setNewJob] = useState<Partial<Ticket>>({
      jobType: JobType.SERVICE,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.ASSIGNED
  });

  const technicians = staff.filter(s => s.role === Role.TECH || s.role === Role.ENGINEER);

  // Filter tickets based on date existence and selected technician
  const scheduledTickets = tickets.filter(t => {
      const hasDate = !!t.scheduledDate;
      const matchesTech = techFilter === '' || t.assignedTech === techFilter;
      return hasDate && matchesTech;
  });

  // Simple calendar grid logic
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getJobsForDay = (day: number) => {
      return scheduledTickets.filter(t => {
          const d = new Date(t.scheduledDate!);
          return d.getDate() === day && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      });
  };

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.customerId) return;

    const job: Ticket = {
        id: `JOB-${Math.floor(Math.random() * 10000)}`,
        customerId: newJob.customerId,
        systemId: 'N/A', 
        title: newJob.title,
        description: newJob.description || '',
        status: TicketStatus.ASSIGNED,
        priority: newJob.priority || TicketPriority.MEDIUM,
        scheduledDate: newJob.scheduledDate,
        jobType: newJob.jobType,
        assignedTech: newJob.assignedTech,
        estimatedDuration: newJob.estimatedDuration,
        location: newJob.location || customers.find(c => c.id === newJob.customerId)?.address,
        createdAt: new Date().toISOString()
    } as Ticket;

    setTickets(prev => [...prev, job]);
    setIsNewJobModalOpen(false);
    setNewJob({ jobType: JobType.SERVICE, priority: TicketPriority.MEDIUM, status: TicketStatus.ASSIGNED });
  };

  const changeMonth = (delta: number) => {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1));
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Job Schedule</h2>
          <p className="text-slate-500 mt-1">Technician dispatch and service calendar.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm">
                <Filter size={16} className="text-slate-400" />
                <select 
                    className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
                    value={techFilter}
                    onChange={(e) => setTechFilter(e.target.value)}
                >
                    <option value="">All Technicians</option>
                    {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>
            <button 
                onClick={() => setIsNewJobModalOpen(true)}
                className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
            >
            <Plus size={18} /> Schedule Job
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-4">
                 <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><ChevronLeft size={20} /></button>
                 <h3 className="text-lg font-bold text-slate-800 w-40 text-center">
                     {selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                 </h3>
                 <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><ChevronRight size={20} /></button>
             </div>
             <div className="flex gap-4 text-xs font-medium text-slate-500">
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FFB600]"></span> Service</div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Install</div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Maintenance</div>
             </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
             <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                     <div key={day} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">
                         {day}
                     </div>
                 ))}
                 
                 {emptyDays.map((_, i) => <div key={`empty-${i}`} className="bg-white min-h-[120px]"></div>)}
                 
                 {days.map(day => {
                     const jobs = getJobsForDay(day);
                     return (
                         <div key={day} className="bg-white min-h-[120px] p-2 hover:bg-slate-50 transition-colors border-t border-slate-100">
                             <div className="text-right text-xs font-medium text-slate-400 mb-2">{day}</div>
                             <div className="space-y-1">
                                 {jobs.map(job => (
                                     <button 
                                        key={job.id} 
                                        onClick={() => setSelectedJob(job)}
                                        className={`w-full text-left text-[10px] px-2 py-1.5 rounded border border-l-4 truncate shadow-sm transition-transform hover:scale-[1.02] ${
                                            job.jobType === JobType.INSTALL ? 'bg-green-50 border-green-200 border-l-green-500 text-green-700' :
                                            job.jobType === JobType.MAINTENANCE ? 'bg-purple-50 border-purple-200 border-l-purple-500 text-purple-700' :
                                            'bg-amber-50 border-amber-200 border-l-[#FFB600] text-amber-900'
                                        }`}
                                     >
                                         <span className="font-bold">{job.estimatedDuration?.split(' ')[0]}h</span> {job.title}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     );
                 })}
             </div>
          </div>
      </div>

      {/* New Job Modal */}
      {isNewJobModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800">Create New Job</h3>
                      <button onClick={() => setIsNewJobModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                          <select 
                             className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                             onChange={(e) => {
                                 const c = customers.find(cust => cust.id === e.target.value);
                                 setNewJob({...newJob, customerId: e.target.value, location: c?.address});
                             }}
                          >
                              <option value="">Select Customer</option>
                              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                              <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                value={newJob.jobType}
                                onChange={(e) => setNewJob({...newJob, jobType: e.target.value as JobType})}
                              >
                                  {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                          <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Technician</label>
                               <select 
                                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                  onChange={(e) => setNewJob({...newJob, assignedTech: e.target.value})}
                               >
                                   <option value="">Assign Tech</option>
                                   {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                               </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                              <input 
                                  type="datetime-local" 
                                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                  onChange={(e) => setNewJob({...newJob, scheduledDate: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Duration</label>
                              <input 
                                  type="text" 
                                  placeholder="e.g. 2 hours"
                                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                  onChange={(e) => setNewJob({...newJob, estimatedDuration: e.target.value})}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title / Task</label>
                          <input 
                              type="text" 
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                              placeholder="e.g. Install 4 Cameras"
                              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                          <div className="relative">
                              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                  type="text" 
                                  className="w-full border border-slate-300 rounded-lg pl-9 p-2 text-sm"
                                  value={newJob.location || ''}
                                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                              />
                          </div>
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setIsNewJobModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                      <button onClick={handleCreateJob} className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors">Schedule Job</button>
                  </div>
              </div>
          </div>
      )}

      {/* Job Detail / Task Modal */}
      {selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                               <h2 className="text-xl font-bold text-slate-800">{selectedJob.title}</h2>
                               <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold uppercase">{selectedJob.jobType}</span>
                          </div>
                          <p className="text-sm text-slate-500 font-mono">{selectedJob.id}</p>
                      </div>
                      <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                  <div className="flex items-start gap-3">
                                      <Clock className="text-slate-400 mt-0.5" size={18} />
                                      <div>
                                          <p className="text-xs text-slate-500 font-medium uppercase">Scheduled Time</p>
                                          <p className="text-sm font-bold text-slate-800">
                                              {selectedJob.scheduledDate ? new Date(selectedJob.scheduledDate).toLocaleString() : 'Not Scheduled'}
                                          </p>
                                          <p className="text-xs text-slate-500">Duration: {selectedJob.estimatedDuration || 'Unspecified'}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                      <MapPin className="text-slate-400 mt-0.5" size={18} />
                                      <div>
                                          <p className="text-xs text-slate-500 font-medium uppercase">Location</p>
                                          <p className="text-sm text-slate-800">{selectedJob.location}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                      <User className="text-slate-400 mt-0.5" size={18} />
                                      <div>
                                          <p className="text-xs text-slate-500 font-medium uppercase">Technician</p>
                                          <p className="text-sm text-slate-800">
                                              {staff.find(s => s.id === selectedJob.assignedTech)?.name || 'Unassigned'}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                              
                              <div>
                                  <h4 className="font-bold text-slate-700 mb-2">Job Description</h4>
                                  <p className="text-sm text-slate-600 bg-white border border-slate-200 p-3 rounded-lg">
                                      {selectedJob.description}
                                  </p>
                              </div>
                              
                              <div>
                                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                      <Wrench size={16} /> Required Tools & Parts
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                      {selectedJob.requiredTools?.map((tool, i) => (
                                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                              {tool}
                                          </span>
                                      )) || <span className="text-sm text-slate-400 italic">No specific tools listed.</span>}
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-6">
                              {/* Job Completion Section */}
                              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                                  <Camera size={32} className="text-slate-300 group-hover:text-[#FFB600] mb-2 transition-colors" />
                                  <h4 className="text-sm font-bold text-slate-600 group-hover:text-[#FFB600]">Upload Site Photos</h4>
                                  <p className="text-xs text-slate-400">Before & After images required</p>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-xl p-4">
                                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                      <PenTool size={16} /> Customer Signature
                                  </h4>
                                  <div className="h-24 bg-slate-50 border-b border-slate-200 rounded-t-lg flex items-center justify-center text-slate-300 text-xs italic">
                                      Sign Here
                                  </div>
                                  <button className="w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-b-lg hover:bg-blue-100">
                                      Capture Signature
                                  </button>
                              </div>

                              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-md shadow-green-900/10 flex items-center justify-center gap-2 transition-all">
                                  <CheckCircle size={20} /> Complete Job
                              </button>
                              
                              <button className="w-full bg-white border border-slate-300 text-slate-600 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
                                  <Send size={14} /> Resend Confirmation SMS
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default JobCalendar;