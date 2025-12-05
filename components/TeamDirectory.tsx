import React, { useState } from 'react';
import { Staff, Role } from '../types';
import { UserPlus, Search, Mail, Phone, Briefcase, HardHat, Shield, UserCog, Filter, X } from 'lucide-react';

interface TeamDirectoryProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const TeamDirectory: React.FC<TeamDirectoryProps> = ({ staff, setStaff }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<Partial<Staff>>({
    role: Role.SALES,
  });

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) return;

    const member: Staff = {
      id: `ST-${Math.floor(Math.random() * 10000)}`,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone || '',
      role: newMember.role,
      activeLeads: 0
    };

    setStaff(prev => [...prev, member]);
    setIsModalOpen(false);
    setNewMember({ role: Role.SALES });
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.SALES: return <Briefcase size={16} className="text-blue-500" />;
      case Role.ENGINEER: return <HardHat size={16} className="text-purple-500" />;
      case Role.ADMIN: return <Shield size={16} className="text-red-500" />;
      case Role.TECH: return <UserCog size={16} className="text-green-500" />;
      default: return <UserCog size={16} className="text-slate-500" />;
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.SALES: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Role.ENGINEER: return 'bg-purple-100 text-purple-700 border-purple-200';
      case Role.ADMIN: return 'bg-red-100 text-red-700 border-red-200';
      case Role.TECH: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Team Directory</h2>
          <p className="text-slate-500 mt-1">Manage staff members and roles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FFB600] hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <UserPlus size={18} /> Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FFB600] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-[#FFB600] focus:border-[#FFB600] block p-2 outline-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | 'All')}
            >
                <option value="All">All Roles</option>
                {Object.values(Role).map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStaff.map((member) => (
                <div key={member.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group relative">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-2xl mb-4 group-hover:bg-[#FFB600] group-hover:text-slate-900 transition-colors">
                        {member.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{member.name}</h3>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border mb-4 ${getRoleBadgeColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role}
                    </div>
                    
                    <div className="w-full space-y-3 text-sm">
                        <div className="flex items-center justify-center gap-2 text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            <a href={`mailto:${member.email}`} className="hover:text-blue-600 transition-colors truncate max-w-[180px]">
                                {member.email}
                            </a>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            <span>{member.phone || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="text-slate-400 hover:text-slate-600">
                             <UserCog size={16} />
                         </button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">Add Team Member</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                            value={newMember.name || ''}
                            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                            value={newMember.email || ''}
                            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input 
                            type="tel" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                            value={newMember.phone || ''}
                            onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none bg-white"
                            value={newMember.role}
                            onChange={(e) => setNewMember({...newMember, role: e.target.value as Role})}
                        >
                            {Object.values(Role).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAddMember}
                        disabled={!newMember.name || !newMember.email}
                        className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Member
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TeamDirectory;