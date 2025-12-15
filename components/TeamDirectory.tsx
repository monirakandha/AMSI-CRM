import React, { useState, useRef } from 'react';
import { Staff, Role } from '../types';
import { UserPlus, Search, Mail, Phone, Briefcase, HardHat, Shield, UserCog, Filter, X, Eye, Edit, Save, CheckCircle, MapPin, Camera, Upload, Trash2 } from 'lucide-react';

interface TeamDirectoryProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const TeamDirectory: React.FC<TeamDirectoryProps> = ({ staff, setStaff }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMember, setViewMember] = useState<Staff | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Staff>>({
    role: Role.SALES,
    address: '',
    image: ''
  });

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
      setEditingId(null);
      setFormData({ role: Role.SALES, name: '', email: '', phone: '', address: '', image: '' });
      setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Staff) => {
      setEditingId(member.id);
      setFormData({ ...member });
      setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSaveMember = () => {
    if (!formData.name || !formData.email || !formData.role) return;

    if (editingId) {
        // Edit Existing
        setStaff(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } as Staff : s));
    } else {
        // Create New
        const member: Staff = {
            id: `ST-${Math.floor(Math.random() * 10000)}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || '',
            address: formData.address || '',
            image: formData.image,
            role: formData.role,
            activeLeads: 0 // Default
        };
        setStaff(prev => [...prev, member]);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ role: Role.SALES });
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

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (member: Staff) => {
      const duplicates = staff.filter(s => s.name.trim().toLowerCase() === member.name.trim().toLowerCase());
      if (duplicates.length > 1) {
          // Append unique identifier (last part of ID)
          const suffix = member.id.split('-').pop();
          return `${member.name} #${suffix}`;
      }
      return member.name;
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Team Directory</h2>
          <p className="text-slate-500 mt-1">Manage staff members and roles.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
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
                <div key={member.id} className="bg-white rounded-xl border border-slate-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="p-6 flex flex-col items-center w-full">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-2xl mb-4 group-hover:bg-[#FFB600] group-hover:text-slate-900 transition-colors overflow-hidden relative border border-slate-200">
                            {member.image ? (
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(member.name)
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{getDisplayName(member)}</h3>
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
                    </div>

                    <div className="w-full border-t border-slate-100 bg-slate-50 flex divide-x divide-slate-200">
                        <button 
                            onClick={() => setViewMember(member)}
                            className="flex-1 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Eye size={16} /> View
                        </button>
                        <button 
                            onClick={() => handleOpenEdit(member)}
                            className="flex-1 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit size={16} /> Edit
                        </button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">
                        {editingId ? 'Edit Team Member' : 'Add Team Member'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* Image Upload Section */}
                    <div className="flex gap-6 mb-6">
                        <div className="relative group">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#FFB600] transition-colors"
                            >
                                {formData.image ? (
                                    <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <Camera size={24} className="mx-auto" />
                                        <span className="text-[10px] block mt-1">Upload</span>
                                    </div>
                                )}
                            </div>
                            
                            {formData.image && (
                                <button 
                                    onClick={handleRemoveImage}
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
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none bg-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                                >
                                    {Object.values(Role).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input 
                                type="tel" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
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
                        onClick={handleSaveMember}
                        disabled={!formData.name || !formData.email}
                        className="px-6 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {editingId ? <Save size={18} /> : <UserPlus size={18} />}
                        {editingId ? 'Save Changes' : 'Add Member'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* View Member Modal */}
      {viewMember && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
                  <div className="relative">
                      <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900"></div>
                      <button 
                          onClick={() => setViewMember(null)}
                          className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-sm"
                      >
                          <X size={20} />
                      </button>
                      <div className="absolute -bottom-10 left-8">
                          <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md">
                              <div className="w-full h-full bg-[#FFB600] rounded-full flex items-center justify-center text-slate-900 font-bold text-2xl overflow-hidden border-2 border-white relative">
                                  {viewMember.image ? (
                                      <img src={viewMember.image} alt={viewMember.name} className="w-full h-full object-cover" />
                                  ) : (
                                      getInitials(viewMember.name)
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="pt-12 px-8 pb-8">
                      <h3 className="text-2xl font-bold text-slate-800">{getDisplayName(viewMember)}</h3>
                      <div className="flex items-center gap-2 mt-2 mb-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(viewMember.role)}`}>
                              {viewMember.role}
                          </span>
                          <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                              {viewMember.id}
                          </span>
                      </div>

                      <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                                  <Mail size={18} />
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold">Email</p>
                                  <a href={`mailto:${viewMember.email}`} className="text-sm font-medium text-slate-800 hover:text-blue-600">{viewMember.email}</a>
                              </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                                  <Phone size={18} />
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold">Phone</p>
                                  <a href={`tel:${viewMember.phone}`} className="text-sm font-medium text-slate-800 hover:text-blue-600">{viewMember.phone || 'N/A'}</a>
                              </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                                  <MapPin size={18} />
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold">Address</p>
                                  <p className="text-sm font-medium text-slate-800">{viewMember.address || 'N/A'}</p>
                              </div>
                          </div>
                          
                          {viewMember.role === Role.SALES && (
                              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <div className="p-2 bg-white rounded-lg border border-blue-200 text-blue-600">
                                      <Briefcase size={18} />
                                  </div>
                                  <div>
                                      <p className="text-xs text-blue-600 uppercase font-bold">Performance</p>
                                      <p className="text-sm font-bold text-slate-800">{viewMember.activeLeads || 0} Active Leads</p>
                                  </div>
                              </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-4 text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                              <CheckCircle size={14} /> Account Active
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                        <button 
                            onClick={() => { setViewMember(null); handleOpenEdit(viewMember); }}
                            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Edit size={16} /> Edit Profile
                        </button>
                      <button 
                          onClick={() => setViewMember(null)}
                          className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors text-sm"
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

export default TeamDirectory;