import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, JobType, Staff, Customer, Role } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, User, CheckCircle, Plus, X, Phone, Wrench, Camera, PenTool, Send, ChevronLeft, ChevronRight, Filter, LayoutGrid, List, Columns } from 'lucide-react';

interface JobCalendarProps {
  tickets: Ticket[];
  staff: Staff[];
  customers: Customer[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

interface JobCardProps {
    job: Ticket;
    compact?: boolean;
    customers: Customer[];
    staff: Staff[];
    onSelect: (job: Ticket) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, compact = false, customers, staff, onSelect }) => {
    const customer = customers.find(c => c.id === job.customerId);
    const tech = staff.find(s => s.id === job.assignedTech);
    
    return (
       <button 
          onClick={(e) => { e.stopPropagation(); onSelect(job); }}
          className={`w-full text-left rounded border border-l-4 shadow-sm transition-transform hover:scale-[1.02] ${compact ? 'px-1.5 py-1 text-[9px]' : 'px-2 py-1.5 text-[10px]'} ${
              job.jobType === JobType.INSTALL ? 'bg-green-50 border-green-200 border-l-green-500 text-green-700' :
              job.jobType === JobType.MAINTENANCE ? 'bg-purple-50 border-purple-200 border-l-purple-500 text-purple-700' :
              'bg-amber-50 border-amber-200 border-l-[#FFB600] text-amber-900'
          }`}
       >
           <div className="flex justify-between items-start mb-0.5">
              <span className="font-bold truncate max-w-[70%]">{customer?.name || 'Unknown'}</span>
              {!compact && (
                  <span className="opacity-70 font-mono text-[9px]">
                      {job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </span>
              )}
           </div>
           <div className="truncate mb-1" title={job.title}>{job.title}</div>
           {!compact && (
               <div className="flex justify-between items-center opacity-80 border-t border-black/5 pt-1">
                  {tech ? (
                      <div className="flex items-center gap-1">
                          <User size={8} /> <span className="truncate">{tech.name}</span>
                      </div>
                  ) : <span>Unassigned</span>}
                  <span className="font-bold">{job.estimatedDuration?.split(' ')[0]}h</span>
               </div>
           )}
       </button>
    );
};

type ViewMode = 'day' | 'week' | 'month' | 'year';

const JobCalendar: React.FC<JobCalendarProps> = ({ tickets, staff, customers, setTickets }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
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

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  const navigate = (direction: 'prev' | 'next') => {
      const newDate = new Date(selectedDate);
      const delta = direction === 'next' ? 1 : -1;

      switch (viewMode) {
          case 'day':
              newDate.setDate(newDate.getDate() + delta);
              break;
          case 'week':
              newDate.setDate(newDate.getDate() + (delta * 7));
              break;
          case 'month':
              newDate.setMonth(newDate.getMonth() + delta);
              break;
          case 'year':
              newDate.setFullYear(newDate.getFullYear() + delta);
              break;
      }
      setSelectedDate(newDate);
  }

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
    
    // Switch view to the month of the new job to ensure it's visible
    if (newJob.scheduledDate) {
        const newJobDate = new Date(newJob.scheduledDate);
        setSelectedDate(new Date(newJobDate.getFullYear(), newJobDate.getMonth(), 1));
        setViewMode('month'); // Optional: switch to month view
    }

    setNewJob({ jobType: JobType.SERVICE, priority: TicketPriority.MEDIUM, status: TicketStatus.ASSIGNED });
  };

  const getHeaderText = () => {
      if (viewMode === 'year') return selectedDate.getFullYear().toString();
      if (viewMode === 'month') return selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (viewMode === 'day') return selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (viewMode === 'week') {
          const start = getStartOfWeek(selectedDate);
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          // Check if same month
          if (start.getMonth() === end.getMonth()) {
              return `${start.toLocaleDateString(undefined, { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
          }
          return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      return '';
  }

  // --- Render Views ---

  const renderMonthView = () => {
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

    return (
        <div className="flex-1 overflow-y-auto">
             <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden min-h-[600px]">
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                     <div key={day} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">
                         {day}
                     </div>
                 ))}
                 
                 {emptyDays.map((_, i) => <div key={`empty-${i}`} className="bg-white min-h-[100px]"></div>)}
                 
                 {days.map(day => {
                     const jobs = getJobsForDay(day);
                     const isToday = new Date().toDateString() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();
                     
                     return (
                         <div key={day} className={`bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-colors border-t border-slate-100 flex flex-col ${isToday ? 'bg-amber-50/20' : ''}`}>
                             <div className={`text-right text-xs font-medium mb-2 ${isToday ? 'text-[#FFB600] font-bold' : 'text-slate-400'}`}>
                                {isToday ? <span className="bg-[#FFB600] text-white px-1.5 py-0.5 rounded-full">{day}</span> : day}
                             </div>
                             <div className="space-y-1 flex-1">
                                 {jobs.map(job => (
                                     <JobCard 
                                        key={job.id} 
                                        job={job} 
                                        customers={customers} 
                                        staff={staff} 
                                        onSelect={setSelectedJob} 
                                     />
                                 ))}
                             </div>
                         </div>
                     );
                 })}
             </div>
        </div>
    );
  };

  const renderWeekView = () => {
      const startOfWeek = getStartOfWeek(selectedDate);
      const weekDays = Array.from({length: 7}, (_, i) => {
          const d = new Date(startOfWeek);
          d.setDate(d.getDate() + i);
          return d;
      });

      return (
          <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200">
             <div className="grid grid-cols-7 h-full divide-x divide-slate-200">
                  {weekDays.map(day => {
                       const isToday = new Date().toDateString() === day.toDateString();
                       const jobs = scheduledTickets.filter(t => {
                          const d = new Date(t.scheduledDate!);
                          return d.toDateString() === day.toDateString();
                       }).sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());
    
                       return (
                           <div key={day.toISOString()} className={`flex flex-col min-h-[400px] ${isToday ? 'bg-amber-50/30' : ''}`}>
                               <div className={`p-3 text-center border-b border-slate-200 ${isToday ? 'bg-[#FFB600] text-slate-900' : 'bg-slate-50'}`}>
                                   <div className={`text-xs uppercase font-bold mb-1 ${isToday ? 'text-slate-800' : 'text-slate-500'}`}>{day.toLocaleDateString(undefined, {weekday: 'short'})}</div>
                                   <div className={`text-xl font-bold ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>{day.getDate()}</div>
                               </div>
                               <div className="p-2 space-y-2 flex-1 relative">
                                   {jobs.length === 0 && (
                                       <div className="h-full flex items-center justify-center">
                                           <span className="text-[10px] text-slate-300 italic rotate-90 whitespace-nowrap">No Schedule</span>
                                       </div>
                                   )}
                                   {jobs.map(job => (
                                       <div key={job.id} className="mb-2">
                                            <div className="text-[10px] text-slate-400 font-mono mb-0.5 text-center">
                                                {new Date(job.scheduledDate!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            <JobCard 
                                                job={job} 
                                                compact={true} 
                                                customers={customers} 
                                                staff={staff} 
                                                onSelect={setSelectedJob} 
                                            />
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )
                  })}
              </div>
          </div>
      )
  };

  const renderDayView = () => {
      const jobs = scheduledTickets.filter(t => {
          const d = new Date(t.scheduledDate!);
          return d.toDateString() === selectedDate.toDateString();
      }).sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());

      return (
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 overflow-y-auto p-6">
             <div className="max-w-4xl mx-auto space-y-6">
                 {jobs.length === 0 ? (
                     <div className="text-center py-20">
                         <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                         <h3 className="text-lg font-bold text-slate-600">No jobs scheduled</h3>
                         <p className="text-slate-400">There are no tickets assigned for {selectedDate.toLocaleDateString()}.</p>
                         <button onClick={() => setIsNewJobModalOpen(true)} className="mt-4 text-[#FFB600] font-bold hover:underline">Schedule a Job</button>
                     </div>
                 ) : (
                     jobs.map(job => {
                         const customer = customers.find(c => c.id === job.customerId);
                         const tech = staff.find(s => s.id === job.assignedTech);
                         return (
                            <div key={job.id} onClick={() => setSelectedJob(job)} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-[#FFB600] cursor-pointer flex gap-6 group transition-all">
                                <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-slate-100 pr-6">
                                    <span className="text-2xl font-bold text-slate-800">{new Date(job.scheduledDate!).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-2">{job.estimatedDuration}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="text-lg font-bold text-slate-800 group-hover:text-[#FFB600] transition-colors">{job.title}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                            job.jobType === JobType.INSTALL ? 'bg-green-100 text-green-700 border-green-200' :
                                            job.jobType === JobType.MAINTENANCE ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                            'bg-amber-100 text-amber-900 border-amber-200'
                                        }`}>
                                            {job.jobType}
                                        </span>
                                    </div>
                                    <p className="text-base text-slate-700 mb-3 font-medium flex items-center gap-2">
                                        <User size={16} className="text-slate-400" /> {customer?.name}
                                    </p>
                                    <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded">{job.description}</p>
                                    
                                    <div className="flex items-center gap-6 text-sm text-slate-500 pt-3 border-t border-slate-100">
                                        <span className="flex items-center gap-1.5"><Wrench size={14} /> Tech: <span className="font-bold text-slate-700">{tech?.name || 'Unassigned'}</span></span>
                                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location || 'No Location'}</span>
                                        <span className="flex items-center gap-1.5 ml-auto text-xs bg-slate-100 px-2 py-1 rounded">ID: {job.id}</span>
                                    </div>
                                </div>
                            </div>
                         );
                     })
                 )}
             </div>
          </div>
      );
  };

  const renderYearView = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    return (
        <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {months.map((month, index) => {
                   const jobCount = scheduledTickets.filter(t => {
                      const d = new Date(t.scheduledDate!);
                      return d.getMonth() === index && d.getFullYear() === selectedDate.getFullYear();
                   }).length;
  
                   return (
                       <div 
                          key={month} 
                          onClick={() => {
                              const d = new Date(selectedDate);
                              d.setMonth(index);
                              setSelectedDate(d);
                              setViewMode('month');
                          }}
                          className="bg-white border border-slate-200 rounded-xl p-6 hover:border-[#FFB600] hover:shadow-md cursor-pointer transition-all flex flex-col items-center justify-center h-40 group"
                       >
                           <h4 className="font-bold text-slate-700 text-lg mb-1 group-hover:text-[#FFB600]">{month}</h4>
                           <div className="w-12 h-1 bg-slate-100 rounded-full mb-3 group-hover:bg-[#FFB600]"></div>
                           <span className="text-sm font-bold text-slate-800">{jobCount}</span>
                           <span className="text-xs text-slate-400">Jobs Scheduled</span>
                       </div>
                   )
               })}
            </div>
        </div>
    )
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden p-1">
          {/* Calendar Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50">
             <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
                 <div className="flex items-center bg-white rounded-lg border border-slate-300 p-1 shadow-sm">
                     <button onClick={() => navigate('prev')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft size={20} /></button>
                     <button onClick={() => setSelectedDate(new Date())} className="px-3 text-xs font-bold text-slate-600 hover:text-[#FFB600]">Today</button>
                     <button onClick={() => navigate('next')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ChevronRight size={20} /></button>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 min-w-[200px] text-center lg:text-left">
                     {getHeaderText()}
                 </h3>
             </div>

             <div className="flex bg-white rounded-lg p-1 border border-slate-300 shadow-sm w-full lg:w-auto">
                 {[
                     { id: 'day', label: 'Day', icon: List },
                     { id: 'week', label: 'Week', icon: Columns },
                     { id: 'month', label: 'Month', icon: LayoutGrid },
                     { id: 'year', label: 'Year', icon: CalendarIcon }
                 ].map(v => (
                     <button
                        key={v.id}
                        onClick={() => setViewMode(v.id as ViewMode)}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                            viewMode === v.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                     >
                         <v.icon size={14} className="hidden sm:block" />
                         {v.label}
                     </button>
                 ))}
             </div>
          </div>

          {/* Calendar Content */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'year' && renderYearView()}
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
                              <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
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
                                      <User className="text-slate-400 mt-0.5" size={18} />
                                      <div>
                                          <p className="text-xs text-slate-500 font-medium uppercase">Customer</p>
                                          <p className="text-sm font-bold text-slate-800">
                                              {customers.find(c => c.id === selectedJob.customerId)?.name || 'Unknown'}
                                          </p>
                                      </div>
                                  </div>
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
                                      <Wrench className="text-slate-400 mt-0.5" size={18} />
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
                                      {selectedJob.description || "No description provided."}
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