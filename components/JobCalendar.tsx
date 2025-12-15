import React, { useState, useEffect, useRef } from 'react';
import { Ticket, TicketStatus, TicketPriority, JobType, Staff, Customer, Role } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, User, CheckCircle, Plus, X, Phone, Wrench, Camera, PenTool, Send, ChevronLeft, ChevronRight, Filter, LayoutGrid, List, Columns, Maximize2, Minimize2, StickyNote, Upload, Trash2, RefreshCw } from 'lucide-react';

interface JobCalendarProps {
  tickets: Ticket[];
  staff: Staff[];
  customers: Customer[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

interface JobCardProps {
    job: Ticket;
    isCompact?: boolean;
    customers: Customer[];
    staff: Staff[];
    onSelect: (job: Ticket) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isCompact = false, customers, staff, onSelect }) => {
    const customer = customers.find(c => c.id === job.customerId);
    const tech = staff.find(s => s.id === job.assignedTech);
    
    // Style Variants - Updated Colors
    const baseStyle = "w-full text-left rounded shadow-sm transition-all hover:scale-[1.02] border border-l-4 overflow-hidden";
    
    // Service: Blue, Install: Green, Maintenance: Golden/Amber
    const colorStyle = job.jobType === JobType.INSTALL ? 'bg-emerald-50 border-emerald-200 border-l-emerald-500 text-emerald-900' :
                       job.jobType === JobType.MAINTENANCE ? 'bg-amber-50 border-amber-200 border-l-amber-500 text-amber-900' :
                       'bg-blue-50 border-blue-200 border-l-blue-500 text-blue-900';
    
    // Status indicator
    const isCompleted = job.status === TicketStatus.RESOLVED;
    const completedStyle = isCompleted ? 'opacity-75 grayscale-[0.5]' : '';

    if (isCompact) {
        return (
            <button 
                onClick={(e) => { e.stopPropagation(); onSelect(job); }}
                className={`${baseStyle} ${colorStyle} ${completedStyle} px-1.5 py-1 text-[10px] leading-tight mb-1 relative`}
            >
                <div className="flex justify-between items-center">
                    <span className="font-bold truncate max-w-[65%]">{customer?.name.split(' ')[0]}</span>
                    <span className="opacity-70 font-mono text-[9px]">
                        {job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                </div>
                <div className="truncate opacity-80 flex items-center gap-1">
                    {isCompleted && <CheckCircle size={8} />}
                    {job.title}
                </div>
                {(job.notes || job.noteTitle) && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-bl-full" title="Has Notes"></div>
                )}
            </button>
        );
    }

    return (
       <button 
          onClick={(e) => { e.stopPropagation(); onSelect(job); }}
          className={`${baseStyle} ${colorStyle} ${completedStyle} px-3 py-2 text-xs mb-2 group`}
       >
           <div className="flex justify-between items-start mb-1">
              <span className="font-bold truncate text-sm">{customer?.name || 'Unknown'}</span>
              <span className="font-mono bg-white/50 px-1.5 py-0.5 rounded text-[10px]">
                  {job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
              </span>
           </div>
           <div className="font-medium mb-2 truncate group-hover:underline decoration-dotted underline-offset-2 flex items-center gap-2" title={job.title}>
               {isCompleted && <CheckCircle size={14} className="text-green-600" />}
               {job.title}
           </div>
           
           {/* Job Notes Indicator on Card */}
           {(job.notes || job.noteTitle) && (
               <div className="mb-2 p-1.5 bg-yellow-50 text-yellow-800 text-[10px] rounded border border-yellow-200 flex flex-col gap-0.5 text-left">
                   <div className="flex items-center gap-1">
                        <StickyNote size={10} className="flex-shrink-0" />
                        {job.noteTitle && <span className="font-bold truncate">{job.noteTitle}</span>}
                   </div>
                   {job.notes && <span className="line-clamp-2 leading-tight pl-3.5">{job.notes}</span>}
               </div>
           )}

           <div className="flex justify-between items-center opacity-80 pt-2 border-t border-black/5">
              {tech ? (
                  <div className="flex items-center gap-1.5">
                      <User size={10} /> <span className="truncate max-w-[80px]">{tech.name.split(' ')[0]}</span>
                  </div>
              ) : <span className="italic opacity-50">Unassigned</span>}
              <div className="flex gap-2">
                 <span className="flex items-center gap-1"><Clock size={10}/> {job.estimatedDuration?.split(' ')[0]}h</span>
              </div>
           </div>
       </button>
    );
};

type ViewMode = 'day' | 'week' | 'month' | 'year';

const JobCalendar: React.FC<JobCalendarProps> = ({ tickets, staff, customers, setTickets }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState<Ticket | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [techFilter, setTechFilter] = useState<string>('');
  const [forceCompact, setForceCompact] = useState(false);
  
  // Note State
  const [currentNote, setCurrentNote] = useState('');
  const [currentNoteTitle, setCurrentNoteTitle] = useState('');

  // Refs for uploads
  const jobPhotoInputRef = useRef<HTMLInputElement>(null);

  const [newJob, setNewJob] = useState<Partial<Ticket>>({
      jobType: JobType.SERVICE,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.ASSIGNED
  });

  const technicians = staff.filter(s => s.role === Role.TECH || s.role === Role.ENGINEER);

  // Sync note state when a job is selected
  useEffect(() => {
      if (selectedJob) {
          setCurrentNote(selectedJob.notes || '');
          setCurrentNoteTitle(selectedJob.noteTitle || '');
      }
  }, [selectedJob]);

  // Helper to strictly compare dates ignoring time
  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
  };

  // Filter tickets
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

  // --- ACTIONS ---

  // Helper to update state without closing modal
  const updateTicketState = (updatedTicket: Ticket) => {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setSelectedJob(updatedTicket);
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
    
    if (newJob.scheduledDate) {
        const newJobDate = new Date(newJob.scheduledDate);
        setSelectedDate(new Date(newJobDate.getFullYear(), newJobDate.getMonth(), 1));
        setViewMode('month');
    }

    setNewJob({ jobType: JobType.SERVICE, priority: TicketPriority.MEDIUM, status: TicketStatus.ASSIGNED });
  };

  const handleSaveNote = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedJob) return;
      const updatedJob = { ...selectedJob, notes: currentNote, noteTitle: currentNoteTitle };
      updateTicketState(updatedJob);
  };

  const handleCompleteJob = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedJob) return;
      
      const isResolved = selectedJob.status === TicketStatus.RESOLVED;
      const newStatus = isResolved ? TicketStatus.IN_PROGRESS : TicketStatus.RESOLVED;
      
      const updatedJob: Ticket = { 
          ...selectedJob, 
          status: newStatus,
          history: [
              ...(selectedJob.history || []),
              { 
                  date: new Date().toISOString(), 
                  action: isResolved ? 'Job Reopened' : 'Job Completed', 
                  user: 'Technician', 
                  details: isResolved ? 'Status reverted to In Progress' : 'Marked as completed via app' 
              }
          ]
      };
      updateTicketState(updatedJob);
  };

  const handleCaptureSignature = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedJob) return;
      
      const updatedJob: Ticket = {
          ...selectedJob,
          signature: `Signed by Customer on ${new Date().toLocaleString()}`
      };
      updateTicketState(updatedJob);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedJob || !e.target.files?.[0]) return;
      
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
          const newPhoto = reader.result as string;
          const updatedJob = {
              ...selectedJob,
              photos: [...(selectedJob.photos || []), newPhoto]
          };
          updateTicketState(updatedJob);
      };
      reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
      if (!selectedJob || !selectedJob.photos) return;
      const newPhotos = selectedJob.photos.filter((_, i) => i !== index);
      const updatedJob = { ...selectedJob, photos: newPhotos };
      updateTicketState(updatedJob);
  };

  const getHeaderText = () => {
      if (viewMode === 'year') return selectedDate.getFullYear().toString();
      if (viewMode === 'month') return selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (viewMode === 'day') return selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (viewMode === 'week') {
          const start = getStartOfWeek(selectedDate);
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          if (start.getMonth() === end.getMonth()) {
              return `${start.toLocaleDateString(undefined, { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
          }
          return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      return '';
  }

  // View Renders...
  const renderMonthView = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getJobsForDay = (day: number) => {
        const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        return scheduledTickets.filter(t => {
            const d = new Date(t.scheduledDate!);
            return isSameDay(d, targetDate);
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
                     const isToday = isSameDay(new Date(), new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
                     return (
                         <div key={day} className={`bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-colors border-t border-slate-100 flex flex-col ${isToday ? 'bg-amber-50/20' : ''}`}>
                             <div className={`text-right text-xs font-medium mb-2 ${isToday ? 'text-[#FFB600] font-bold' : 'text-slate-400'}`}>
                                {isToday ? <span className="bg-[#FFB600] text-white px-1.5 py-0.5 rounded-full">{day}</span> : day}
                             </div>
                             <div className="flex-1">
                                 {jobs.map(job => (
                                     <JobCard key={job.id} job={job} isCompact={forceCompact} customers={customers} staff={staff} onSelect={setSelectedJob} />
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
                       const isToday = isSameDay(new Date(), day);
                       const jobs = scheduledTickets.filter(t => {
                          const d = new Date(t.scheduledDate!);
                          return isSameDay(d, day);
                       }).sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());
                       return (
                           <div key={day.toISOString()} className={`flex flex-col min-h-[400px] ${isToday ? 'bg-amber-50/30' : ''}`}>
                               <div className={`p-3 text-center border-b border-slate-200 ${isToday ? 'bg-[#FFB600] text-slate-900' : 'bg-slate-50'}`}>
                                   <div className={`text-xs uppercase font-bold mb-1 ${isToday ? 'text-slate-800' : 'text-slate-500'}`}>{day.toLocaleDateString(undefined, {weekday: 'short'})}</div>
                                   <div className={`text-xl font-bold ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>{day.getDate()}</div>
                               </div>
                               <div className="p-2 flex-1 relative">
                                   {jobs.map(job => (
                                        <JobCard key={job.id} job={job} isCompact={true} customers={customers} staff={staff} onSelect={setSelectedJob} />
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
          return isSameDay(d, selectedDate);
      }).sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());
      return (
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 overflow-y-auto p-6">
             <div className="max-w-4xl mx-auto space-y-4">
                 {jobs.length === 0 ? (
                     <div className="text-center py-20">
                         <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                         <h3 className="text-lg font-bold text-slate-600">No jobs scheduled</h3>
                         <button onClick={() => setIsNewJobModalOpen(true)} className="mt-4 text-[#FFB600] font-bold hover:underline">Schedule a Job</button>
                     </div>
                 ) : (
                     jobs.map(job => (
                        <JobCard key={job.id} job={job} isCompact={false} customers={customers} staff={staff} onSelect={setSelectedJob} />
                     ))
                 )}
             </div>
          </div>
      );
  };

  const renderYearView = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return (
        <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {months.map((month, index) => {
                   const jobCount = scheduledTickets.filter(t => {
                      const d = new Date(t.scheduledDate!);
                      return d.getMonth() === index && d.getFullYear() === selectedDate.getFullYear();
                   }).length;
                   return (
                       <div key={month} onClick={() => { const d = new Date(selectedDate); d.setMonth(index); setSelectedDate(d); setViewMode('month'); }}
                          className="bg-white border border-slate-200 rounded-xl p-6 hover:border-[#FFB600] cursor-pointer transition-all flex flex-col items-center justify-center h-40">
                           <h4 className="font-bold text-slate-700 text-lg mb-1">{month}</h4>
                           <span className="text-sm font-bold text-slate-800">{jobCount} Jobs</span>
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
          
          {/* Service Type Legend */}
          <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Service
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Install
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Maintenance
              </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm">
                <Filter size={16} className="text-slate-400" />
                <select className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
                    <option value="">All Technicians</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            <button onClick={() => setForceCompact(!forceCompact)} className={`p-2 rounded-lg border shadow-sm transition-colors ${forceCompact ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>
                {forceCompact ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button onClick={() => setIsNewJobModalOpen(true)} className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2">
                <Plus size={18} /> Schedule Job
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden p-1">
          <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50">
             <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
                 <div className="flex items-center bg-white rounded-lg border border-slate-300 p-1 shadow-sm">
                     <button onClick={() => navigate('prev')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft size={20} /></button>
                     <button onClick={() => setSelectedDate(new Date())} className="px-3 text-xs font-bold text-slate-600 hover:text-[#FFB600]">Today</button>
                     <button onClick={() => navigate('next')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ChevronRight size={20} /></button>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 min-w-[200px] text-center lg:text-left">{getHeaderText()}</h3>
             </div>
             <div className="flex bg-white rounded-lg p-1 border border-slate-300 shadow-sm w-full lg:w-auto">
                 {[{ id: 'day', label: 'Day', icon: List }, { id: 'week', label: 'Week', icon: Columns }, { id: 'month', label: 'Month', icon: LayoutGrid }, { id: 'year', label: 'Year', icon: CalendarIcon }].map(v => (
                     <button key={v.id} onClick={() => setViewMode(v.id as ViewMode)} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === v.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                         <v.icon size={14} className="hidden sm:block" /> {v.label}
                     </button>
                 ))}
             </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'year' && renderYearView()}
          </div>
      </div>
      
       {/* Create Modal skipped for brevity, assumed unchanged in logic */}
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
                          <select className="w-full border border-slate-300 rounded-lg p-2 text-sm" onChange={(e) => { const c = customers.find(cust => cust.id === e.target.value); setNewJob({...newJob, customerId: e.target.value, location: c?.address}); }}>
                              <option value="">Select Customer</option>
                              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                              <select className="w-full border border-slate-300 rounded-lg p-2 text-sm" value={newJob.jobType} onChange={(e) => setNewJob({...newJob, jobType: e.target.value as JobType})}>
                                  {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                          <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Technician</label>
                               <select className="w-full border border-slate-300 rounded-lg p-2 text-sm" onChange={(e) => setNewJob({...newJob, assignedTech: e.target.value})}>
                                   <option value="">Assign Tech</option>
                                   {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                               </select>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                              <input type="datetime-local" className="w-full border border-slate-300 rounded-lg p-2 text-sm" onChange={(e) => setNewJob({...newJob, scheduledDate: e.target.value})}/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Duration</label>
                              <input type="text" placeholder="e.g. 2 hours" className="w-full border border-slate-300 rounded-lg p-2 text-sm" onChange={(e) => setNewJob({...newJob, estimatedDuration: e.target.value})}/>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title / Task</label>
                          <input type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm" placeholder="e.g. Install 4 Cameras" onChange={(e) => setNewJob({...newJob, title: e.target.value})}/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                          <input type="text" className="w-full border border-slate-300 rounded-lg pl-2 p-2 text-sm" value={newJob.location || ''} onChange={(e) => setNewJob({...newJob, location: e.target.value})}/>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setIsNewJobModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                      <button onClick={handleCreateJob} className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors">Schedule Job</button>
                  </div>
              </div>
          </div>
      )}

      {selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                               <h2 className="text-xl font-bold text-slate-800">{selectedJob.title}</h2>
                               <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${selectedJob.status === TicketStatus.RESOLVED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                   {selectedJob.status === TicketStatus.RESOLVED ? 'Completed' : selectedJob.jobType}
                               </span>
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
                              
                              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                  <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2 text-sm">
                                      <StickyNote size={16} /> Job Notes (Visible on Schedule)
                                  </h4>
                                  <input 
                                      className="w-full border border-yellow-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white mb-2 font-bold placeholder:font-normal"
                                      placeholder="Note Title"
                                      value={currentNoteTitle}
                                      onChange={(e) => setCurrentNoteTitle(e.target.value)}
                                  />
                                  <textarea
                                      className="w-full border border-yellow-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white min-h-[80px]"
                                      placeholder="e.g. Gate code: 4455, Beware of dog..."
                                      value={currentNote}
                                      onChange={(e) => setCurrentNote(e.target.value)}
                                  />
                                  <div className="mt-2 flex justify-end">
                                      <button
                                          onClick={handleSaveNote}
                                          className="px-3 py-1.5 bg-yellow-200 text-yellow-800 text-xs font-bold rounded hover:bg-yellow-300 transition-colors shadow-sm"
                                      >
                                          Update Note
                                      </button>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-6">
                              {/* Job Completion Section */}
                              <div className="space-y-2">
                                  <div 
                                    onClick={() => jobPhotoInputRef.current?.click()}
                                    className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden"
                                  >
                                      <Camera size={32} className="text-slate-300 group-hover:text-[#FFB600] mb-2 transition-colors" />
                                      <h4 className="text-sm font-bold text-slate-600 group-hover:text-[#FFB600]">Upload Site Photos</h4>
                                      <p className="text-xs text-slate-400">Before & After images required</p>
                                      <input 
                                          type="file" 
                                          ref={jobPhotoInputRef} 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={handlePhotoUpload} 
                                      />
                                  </div>
                                  
                                  {/* Photo Gallery */}
                                  {selectedJob.photos && selectedJob.photos.length > 0 && (
                                      <div className="grid grid-cols-3 gap-2">
                                          {selectedJob.photos.map((photo, idx) => (
                                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                  <img src={photo} alt={`Site photo ${idx}`} className="w-full h-full object-cover" />
                                                  <button 
                                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemovePhoto(idx); }}
                                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                  >
                                                      <Trash2 size={10} />
                                                  </button>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>

                              <div className="bg-white border border-slate-200 rounded-xl p-4">
                                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                      <PenTool size={16} /> Customer Signature
                                  </h4>
                                  <div className={`h-24 bg-slate-50 border-b border-slate-200 rounded-t-lg flex items-center justify-center text-slate-300 ${selectedJob.signature ? 'font-cursive text-2xl text-blue-800' : 'text-xs italic'}`}>
                                      {selectedJob.signature || "Sign Here"}
                                  </div>
                                  <button 
                                      onClick={handleCaptureSignature}
                                      disabled={!!selectedJob.signature}
                                      className={`w-full py-2 text-xs font-bold rounded-b-lg transition-colors ${selectedJob.signature ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                  >
                                      {selectedJob.signature ? 'Signed Successfully' : 'Capture Signature'}
                                  </button>
                              </div>

                              <button 
                                  onClick={handleCompleteJob}
                                  className={`w-full py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-all ${
                                      selectedJob.status === TicketStatus.RESOLVED 
                                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' // Allow click to reopen
                                      : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/10'
                                  }`}
                              >
                                  {selectedJob.status === TicketStatus.RESOLVED ? <RefreshCw size={20} /> : <CheckCircle size={20} />} 
                                  {selectedJob.status === TicketStatus.RESOLVED ? 'Reopen Job' : 'Complete Job'}
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