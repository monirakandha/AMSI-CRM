import React, { useState } from 'react';
import { Staff } from '../types';
import { User, Mail, Phone, Briefcase, Save, Edit2, Shield, Camera } from 'lucide-react';

interface UserProfileProps {
  currentUser: Staff;
  setCurrentUser: (user: Staff) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, setCurrentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
  });

  const handleSave = () => {
    setCurrentUser({
      ...currentUser,
      ...formData
    });
    setIsEditing(false);
  };

  return (
    <div className="p-8 h-full bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>
            <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-[#FFB600] text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm flex items-center gap-2"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors shadow-sm flex items-center gap-2 bg-white"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#FFB600] to-orange-500 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 relative overflow-hidden group cursor-pointer">
                  {currentUser.name.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{currentUser.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase border border-blue-200">
                    {currentUser.role}
                  </span>
                  <span className="text-sm text-slate-500">ID: {currentUser.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Contact Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                        <User size={18} className="text-slate-400" />
                        {currentUser.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                        <Mail size={18} className="text-slate-400" />
                        {currentUser.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                        <Phone size={18} className="text-slate-400" />
                        {currentUser.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 opacity-70 cursor-not-allowed">
                      <Briefcase size={18} className="text-slate-400" />
                      {currentUser.role.charAt(0) + currentUser.role.slice(1).toLowerCase()} Department
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Security & Access</h4>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Account Status</p>
                      <p className="text-xs text-slate-500">Your account is active and secure.</p>
                    </div>
                  </div>
                  <button className="text-[#FFB600] text-sm font-bold hover:underline">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;